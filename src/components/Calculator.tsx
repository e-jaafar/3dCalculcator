import { Text } from '@react-three/drei';
import { useState , useRef } from 'react';
import { Group } from 'three';

import CalcButton from './CalcButton';
import CalcDisplay from './CalcDisplay';

// Button type definition
type ButtonType = 'number' | 'operator' | 'equals' | 'clear' | 'decimal' | 'memory';

// Define the button layout - position and label for each button
const buttons = [
  // Fourth row
  { position: [-1.15, -1.75, 0.1] as [number, number, number], label: '0', type: 'number' as ButtonType, width: 0.5 },
  { position: [-0.55, -1.75, 0.1] as [number, number, number], label: '.', type: 'decimal' as ButtonType, width: 0.5 },
  { position: [0.05, -1.75, 0.1] as [number, number, number], label: '±', type: 'operator' as ButtonType, width: 0.5 },
  { position: [0.95, -1.75, 0.1] as [number, number, number], label: '=', type: 'equals' as ButtonType, width: 1.1, height: 0.5 },

  // Second row (was first row)
  { position: [-1.15, -1.15, 0.1] as [number, number, number], label: '7', type: 'number' as ButtonType, width: 0.5 },
  { position: [-0.55, -1.15, 0.1] as [number, number, number], label: '8', type: 'number' as ButtonType, width: 0.5 },
  { position: [0.05, -1.15, 0.1] as [number, number, number], label: '9', type: 'number' as ButtonType, width: 0.5 },
  { position: [0.65, -1.15, 0.1] as [number, number, number], label: '×', type: 'operator' as ButtonType, width: 0.5 },
  { position: [1.25, -1.15, 0.1] as [number, number, number], label: '÷', type: 'operator' as ButtonType, width: 0.5 },


  // First row (bottom of calculator) - Was originally second row
  { position: [-1.15, -0.55, 0.1] as [number, number, number], label: '4', type: 'number' as ButtonType, width: 0.5 },
  { position: [-0.55, -0.55, 0.1] as [number, number, number], label: '5', type: 'number' as ButtonType, width: 0.5 },
  { position: [0.05, -0.55, 0.1] as [number, number, number], label: '6', type: 'number' as ButtonType, width: 0.5 },
  { position: [0.65, -0.55, 0.1] as [number, number, number], label: '+', type: 'operator' as ButtonType, width: 0.5 },
  { position: [1.25, -0.55, 0.1] as [number, number, number], label: '-', type: 'operator' as ButtonType, width: 0.5 },

  // Third row
  { position: [-1.15, 0.05, 0.1] as [number, number, number], label: '1', type: 'number' as ButtonType, width: 0.5 },
  { position: [-0.55, 0.05, 0.1] as [number, number, number], label: '2', type: 'number' as ButtonType, width: 0.5 },
  { position: [0.05, 0.05, 0.1] as [number, number, number], label: '3', type: 'number' as ButtonType, width: 0.5 },
  { position: [0.65, 0.05, 0.1] as [number, number, number], label: 'DEL', type: 'clear' as ButtonType, width: 0.5 },
  { position: [1.25, 0.05, 0.1] as [number, number, number], label: 'AC', type: 'clear' as ButtonType, width: 0.5 },
  
  // Memory buttons
  { position: [-1.15, 0.65, 0.1] as [number, number, number], label: 'MR', type: 'memory' as ButtonType, width: 0.5 },
  { position: [-0.55, 0.65, 0.1] as [number, number, number], label: 'M+', type: 'memory' as ButtonType, width: 0.5 },
  { position: [0.05, 0.65, 0.1] as [number, number, number], label: 'M-', type: 'memory' as ButtonType, width: 0.5 },
  { position: [0.65, 0.65, 0.1] as [number, number, number], label: 'MC', type: 'memory' as ButtonType, width: 0.5 },
  { position: [1.25, 0.65, 0.1] as [number, number, number], label: '%', type: 'operator' as ButtonType, width: 0.5 },
];

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [memoryValue, setMemoryValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [solarActive, setSolarActive] = useState(true); // State for solar panel animation

  const groupRef = useRef<Group>(null);

  const handleButtonClick = (value: string) => {
    // When any button is pressed, solar panel flickers
    setSolarActive(false);
    setTimeout(() => setSolarActive(true), 100);

    // Handle memory operations
    if (value === 'MR' && memoryValue !== null) {
      setDisplayValue(memoryValue.toString());
      setWaitingForOperand(false);
      return;
    } else if (value === 'M+') {
      const currentValue = parseFloat(displayValue);
      setMemoryValue((prev) => (prev !== null ? prev + currentValue : currentValue));
      setWaitingForOperand(true);
      return;
    } else if (value === 'M-') {
      const currentValue = parseFloat(displayValue);
      setMemoryValue((prev) => (prev !== null ? prev - currentValue : -currentValue));
      setWaitingForOperand(true);
      return;
    } else if (value === 'MC') {
      setMemoryValue(null);
      return;
    }

    // Handle Clear and All Clear
    if (value === 'AC') {
      setDisplayValue('0');
      setStoredValue(null);
      setOperation(null);
      setWaitingForOperand(false);
      setErrorState(false);
      return;
    } else if (value === 'DEL') {
      if (errorState) {
        setDisplayValue('0');
        setErrorState(false);
      } else if (displayValue.length > 1) {
        setDisplayValue(displayValue.slice(0, -1));
      } else {
        setDisplayValue('0');
      }
      return;
    }

    if (errorState) {
      // Clear error state on any button press
      setDisplayValue('0');
      setErrorState(false);
      setWaitingForOperand(false);
      return;
    }

    if (value === '±') {
      setDisplayValue(prev =>
        prev.startsWith('-') ? prev.substring(1) : `-${prev}`
      );
      return;
    }

    if (value === '%') {
      const currentValue = parseFloat(displayValue);
      setDisplayValue((currentValue / 100).toString());
      return;
    }

    // Handle operator input
    if (['+', '-', '×', '÷', '='].includes(value)) {
      let operationSymbol = value;
      if (value === '×') operationSymbol = '*';
      if (value === '÷') operationSymbol = '/';

      if (value === '=') {
        if (storedValue !== null && operation) {
          const currentValue = parseFloat(displayValue);
          let result;

          try {
            switch (operation) {
              case '+':
                result = storedValue + currentValue;
                break;
              case '-':
                result = storedValue - currentValue;
                break;
              case '*':
                result = storedValue * currentValue;
                break;
              case '/':
                if (currentValue === 0) {
                  throw new Error('Division by zero');
                }
                result = storedValue / currentValue;
                break;
              default:
                result = currentValue;
            }

            // Check if result is valid
            if (!isFinite(result)) {
              throw new Error('Invalid operation');
            }

            // Format result to avoid extremely long decimals
            const resultStr = result.toString();
            setDisplayValue(resultStr.length > 10 ? result.toExponential(4) : resultStr);
          } catch {
            setDisplayValue('Error');
            setErrorState(true);
          }

          setStoredValue(null);
          setOperation(null);
          setWaitingForOperand(true);
        }
      } else {
        // Handle operator
        setOperation(operationSymbol);
        setStoredValue(parseFloat(displayValue));
        setWaitingForOperand(true);
      }
    } else if (value === '.') {
      // Handle decimal point
      if (waitingForOperand) {
        setDisplayValue('0.');
        setWaitingForOperand(false);
      } else if (!displayValue.includes('.')) {
        // Only add decimal if it doesn't already have one
        setDisplayValue(displayValue + '.');
      }
    } else {
      // Handle number input
      if (waitingForOperand) {
        setDisplayValue(value);
        setWaitingForOperand(false);
      } else {
        // Prevent adding too many digits
        if (displayValue.replace('.', '').length < 10) {
          setDisplayValue(displayValue === '0' ? value : displayValue + value);
        }
      }
    }
  };

  return (
    // Position the calculator on the desk, properly laid flat
    <group ref={groupRef} position={[0.5, 0.08, -0.3]} rotation={[-Math.PI / 2, 0, -Math.PI / 24]}>
      {/* Calculator body - bottom part */}
      <mesh position={[0, -0.45, -0.10]} receiveShadow castShadow>
        <boxGeometry args={[3.3, 4.0, 0.25]} />
        <meshStandardMaterial color="#323232" roughness={0.6} />
      </mesh>

      {/* Calculator top part with beveled edges */}
      <mesh position={[0, -0.45, 0.04]} receiveShadow castShadow>
        <boxGeometry args={[3.05, 3.75, 0.15]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
      </mesh>

      {/* Ridge separating top and bottom sections */}
      <mesh position={[0, 1.0, 0.06]} receiveShadow>
        <boxGeometry args={[3.05, 0.05, 0.15]} />
        <meshStandardMaterial color="#222222" roughness={0.5} />
      </mesh>

      {/* Solar panel - recessed into body */}
      <mesh position={[-0.95, 1.4, 0.06]} receiveShadow>
        <boxGeometry args={[1.0, 0.3, 0.01]} />
        <meshStandardMaterial
          color={solarActive ? "#1a1a1a" : "#0c0c0c"}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Calculator brand name */}
      <mesh position={[0.95, 1.4, 0.07]}>
        <planeGeometry args={[0.9, 0.2]} />
        <meshStandardMaterial color="#222222" transparent opacity={0} />
      </mesh>
      <Text
        position={[0.95, 1.4, 0.1]}
        color="#888888"
        fontSize={0.18}
        anchorX="center"
        anchorY="middle"
      >
        CASIO
      </Text>

      {/* Model number */}
      <Text
        position={[0.95, 1.25, 0.1]}
        color="#666666"
        fontSize={0.1}
        anchorX="center"
        anchorY="middle"
      >
        fx-115ES PLUS
      </Text>

      {/* Display - properly recessed into the calculator body */}
      <group position={[0, 1.75, 0]}>
        <mesh position={[0, 0, 0.05]} receiveShadow>
          <boxGeometry args={[2.9, 1.0, 0.03]} />
          <meshStandardMaterial color="#111111" metalness={0.1} roughness={0.8} />
        </mesh>
        <CalcDisplay position={[0, 0, 0.06]} value={displayValue} />
      </group>

      {/* Buttons */}
      {buttons.map((button, index) => (
        <CalcButton
          key={index}
          position={button.position}
          label={button.label}
          type={button.type}
          width={button.width}
          height={button.height || 0.5}
          onClick={() => handleButtonClick(button.label)}
        />
      ))}

      {/* Button section border */}
      <mesh position={[0, -0.45, 0.08]} receiveShadow>
        <boxGeometry args={[3.0, 3.6, 0.01]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
      </mesh>
    </group>
  );
};

export default Calculator;
