import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState, useRef } from 'react';
import { Mesh, Vector3 } from 'three';

interface CalcButtonProps {
  position: [number, number, number];
  label: string;
  type?: 'number' | 'operator' | 'equals' | 'clear' | 'decimal' | 'memory';
  onClick: () => void;
  width?: number;
  height?: number;
}

const CalcButton: React.FC<CalcButtonProps> = ({
  position,
  label,
  type = 'number',
  onClick,
  width = 0.6,
  height: buttonHeight = 0.6
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const meshRef = useRef<Mesh>(null);

  // Color based on button type
  let color = '#555555'; // Default darker gray for number buttons
  let height = 0.08;
  let fontSize = 0.22;
  const textColor = 'white';
  const buttonSize: [number, number] = [width, buttonHeight]; // Width, height

  // Set properties based on button type
  switch (type) {
    case 'equals':
      color = '#2196f3'; // Blue for equals
      height = 0.1; // Taller
      break;
    case 'operator':
      color = '#ff9800'; // Orange for operators
      fontSize = 0.22;
      break;
    case 'clear':
      color = '#f44336'; // Red for clear buttons
      fontSize = 0.2;
      break;
    case 'decimal':
      color = '#607d8b'; // Bluish gray for decimal
      break;
    case 'memory':
      color = '#4a148c'; // Purple for memory buttons
      fontSize = 0.2;
      break;
    case 'number':
    default:
      break;
  }

  // Create animation for button press
  useFrame(() => {
    if (!meshRef.current) return;

    // Base position with slight offset for 3D effect
    const targetPosition = new Vector3(position[0], position[1], position[2]);

    // For flat orientation, the button moves down (less z) when pressed
    if (pressed) {
      targetPosition.z -= 0.03;
    }

    // Smooth animation for pressing
    meshRef.current.position.lerp(targetPosition, 0.15);

    // Scale slightly when hovered
    const targetScale = hovered && !pressed ? 1.05 : 1;
    meshRef.current.scale.x = meshRef.current.scale.x * 0.8 + targetScale * 0.2;
    meshRef.current.scale.y = meshRef.current.scale.y * 0.8 + targetScale * 0.2;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => {
        setPressed(true);
      }}
      onPointerUp={() => {
        setPressed(false);
        onClick();
      }}
      castShadow
      receiveShadow
    >
      {/* Slightly rounded button */}
      <boxGeometry args={[buttonSize[0], buttonSize[1], height]} />
      <meshStandardMaterial
        color={hovered ? '#ffffff' : color}
        roughness={0.7}
        metalness={0.1}
      />
      <Text
        position={[0, 0, height/2 + 0.01]}
        color={textColor}
        fontSize={fontSize}
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]} // Keep text flat for readability
      >
        {label}
      </Text>
    </mesh>
  );
};

export default CalcButton;
