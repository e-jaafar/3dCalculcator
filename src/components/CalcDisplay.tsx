import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import { Mesh } from 'three';

interface CalcDisplayProps {
  position: [number, number, number];
  value: string;
}

const CalcDisplay: React.FC<CalcDisplayProps> = ({ position, value }) => {
  const meshRef = useRef<Mesh>(null);
  const textRef = useRef<any>(null);
  const glowRef = useRef<Mesh>(null);

  // Format the display value
  const formattedValue = value.length > 10 ? value.slice(0, 10) : value;

  // Add subtle animation to display
  useFrame(() => {
    // Subtle glow effect for the text
    if (textRef.current && textRef.current.material) {
      const intensity = 0.8 + Math.sin(Date.now() * 0.002) * 0.1;
      textRef.current.material.color.setRGB(0, intensity, 0);
    }

    // Subtle glow animation for the screen
    if (glowRef.current && glowRef.current.material) {
      const glowIntensity = 0.05 + Math.sin(Date.now() * 0.0015) * 0.025;
      (glowRef.current.material as any).emissiveIntensity = glowIntensity;
    }
  });

  return (
    <group position={position}>
      {/* Display panel frame */}
      <mesh position={[0, 0, -0.02]} receiveShadow>
        <boxGeometry args={[2.8, 0.7, 0.06]} />
        <meshStandardMaterial color="#111111" metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Display screen background */}
      <mesh ref={meshRef} position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[2.65, 0.55, 0.02]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* LCD screen glow effect */}
      <mesh ref={glowRef} position={[0, 0, 0.01]} receiveShadow>
        <boxGeometry args={[2.6, 0.5, 0.01]} />
        <meshStandardMaterial
          color="#152215"
          emissive="#00ff00"
          emissiveIntensity={0.05}
          metalness={0.1}
          roughness={0.3}
          opacity={0.9}
          transparent
        />
      </mesh>

      {/* Display text */}
      <Text
        ref={textRef}
        position={[0.9, 0, 0.025]}
        color="green"
        fontSize={0.35}
        anchorX="right"
        anchorY="middle"
        maxWidth={2.4}
        textAlign="right"
        rotation={[0, 0, 0]}
      >
        {formattedValue}
      </Text>

      {/* Status indicators */}
      <group position={[0, 0, 0]}>
        {/* Memory indicator */}
        <mesh position={[-1.25, 0.15, 0.025]} scale={0.05}>
          <boxGeometry args={[0.8, 0.5, 0.01]} />
          <meshBasicMaterial color="#222222" />
        </mesh>
        <Text position={[-1.20, 0.15, 0.03]} color="#333333" fontSize={0.05} anchorX="left">
          M
        </Text>

        {/* Error indicator */}
        <mesh position={[-1.25, 0, 0.025]} scale={0.05}>
          <boxGeometry args={[0.8, 0.5, 0.01]} />
          <meshBasicMaterial color="#222222" />
        </mesh>
        <Text position={[-1.20, 0, 0.03]} color="#333333" fontSize={0.05} anchorX="left">
          E
        </Text>

        {/* Power indicator - lit */}
        <mesh position={[-1.25, -0.15, 0.025]} scale={0.05}>
          <boxGeometry args={[0.8, 0.5, 0.01]} />
          <meshBasicMaterial color="#113311" />
        </mesh>
        <Text position={[-1.20, -0.15, 0.03]} color="#1a7a1a" fontSize={0.05} anchorX="left">
          ON
        </Text>
      </group>
    </group>
  );
};

export default CalcDisplay;
