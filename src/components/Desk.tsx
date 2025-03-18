import { useSpring, animated } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useState, useRef } from 'react';

const Desk = () => {
  const [lampOn, setLampOn] = useState(true);
  const [buttonHovered, setButtonHovered] = useState(false);

  // Reference for the lamp group for animation
  const lampRef = useRef<any>(null);

  // Spring animation for the power button
  const { buttonColor, buttonY } = useSpring({
    buttonColor: buttonHovered ? '#cc0000' : lampOn ? '#880000' : '#550000',
    buttonY: buttonHovered ? 0.03 : 0.02,
    config: { tension: 300, friction: 20 }
  });

  // Spring animation for light intensity
  const { intensity, emissiveIntensity } = useSpring({
    intensity: lampOn ? 3.0 : 0,
    emissiveIntensity: lampOn ? 1.2 : 0,
    config: { tension: 100, friction: 20 }
  });

  // Subtle lamp movement animation
  useFrame(({ clock }) => {
    if (lampRef.current) {
      // Very subtle bobbing motion
      lampRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.004;
      lampRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.003;
    }
  });

  return (
    <group>
      {/* Desk surface */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[10, 8, 0.1]} />
        <meshStandardMaterial
          color="#6d432c"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Desk legs */}
      {[
        [-4.5, -0.75, -3.5] as [number, number, number],  // Front left leg
        [4.5, -0.75, -3.5] as [number, number, number],   // Front right leg
        [-4.5, -0.75, 3.5] as [number, number, number],   // Back left leg
        [4.5, -0.75, 3.5] as [number, number, number],    // Back right leg
      ].map((position, index) => (
        <mesh
          key={index}
          position={position}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial
            color="#3d2b1c"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Enhanced desk study lamp with functional power button */}
      <group
        position={[-4.0, 0.05, 3.0]}
        rotation={[0, Math.PI / 4, 0]}
        ref={lampRef}
        scale={1.5}
      >
        {/* Heavy weighted base - wider and flatter */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.5, 0.08, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.5} />
        </mesh>

        {/* Base accent ring */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <torusGeometry args={[0.45, 0.02, 16, 32]} />
          <meshStandardMaterial color="#272727" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Power button */}
        <animated.group
          position-y={buttonY}
          onClick={() => setLampOn(!lampOn)}
          onPointerOver={() => setButtonHovered(true)}
          onPointerOut={() => setButtonHovered(false)}
        >
          <animated.mesh position={[-0.3, 0.01, 0.3]} castShadow>
            <cylinderGeometry args={[0.04, 0.045, 0.025, 16]} />
            <animated.meshStandardMaterial color={buttonColor} metalness={0.5} roughness={0.4} />
          </animated.mesh>

          {/* Power icon */}
          <Text
            position={[-0.3, 0.035, 0.3]}
            rotation={[-Math.PI/2, 0, 0]}
            fontSize={0.02}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            ⏻
          </Text>
        </animated.group>

        {/* Cable running from base */}
        <group position={[0.2, -0.01, -0.3]} rotation={[Math.PI/2, 0, Math.PI/3]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
        </group>

        {/* Neck/stem connector to base */}
        <group position={[0, 0.04, 0]}>
          {/* Lower neck */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.3, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Main arm connector joint - study lamp style */}
          <group position={[0, 0.3, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* First arm section */}
            <group rotation={[0, 0, Math.PI * 0.15]}>
              <mesh position={[0.25, 0.4, 0]} rotation={[0, 0, Math.PI * 0.5]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.7, 12]} />
                <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.4} />
              </mesh>

              {/* Middle spring detail */}
              <mesh position={[0.25, 0.4, 0]} rotation={[0, 0, Math.PI * 0.5]}>
                <torusGeometry args={[0.06, 0.01, 8, 32, Math.PI * 1.8]} />
                <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.4} />
              </mesh>

              {/* Middle joint */}
              <group position={[0.6, 0.5, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.06, 16, 16]} />
                  <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
                </mesh>

                {/* Second arm section */}
                <group rotation={[0, 0, -Math.PI * 0.25]}>
                  <mesh position={[0.35, 0.15, 0]} rotation={[0, 0, Math.PI * 0.5]} castShadow>
                    <cylinderGeometry args={[0.035, 0.035, 0.8, 12]} />
                    <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.4} />
                  </mesh>

                  {/* Lamphead connector joint */}
                  <group position={[0.7, 0.25, 0]}>
                    <mesh castShadow>
                      <sphereGeometry args={[0.05, 16, 16]} />
                      <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
                    </mesh>

                    {/* Lamphead neck */}
                    <group rotation={[Math.PI * 0.18, Math.PI * 0.15, Math.PI * 0.08]}>
                      <mesh position={[0, 0.1, 0]} castShadow>
                        <cylinderGeometry args={[0.03, 0.04, 0.2, 12]} />
                        <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.4} />
                      </mesh>

                      {/* Lampshade - more study lamp style */}
                      <group position={[0, 0.25, 0]} rotation={[0, 0, 0]}>
                        {/* Outer shade - classic cone shape */}
                        <mesh castShadow>
                          <coneGeometry args={[0.28, 0.35, 32, 1, true]} />
                          <meshStandardMaterial color="#232323" metalness={0.4} roughness={0.6} side={2} />
                        </mesh>

                        {/* Inner shade - reflective */}
                        <mesh position={[0, -0.01, 0]}>
                          <coneGeometry args={[0.265, 0.33, 32, 1, true]} />
                          <animated.meshStandardMaterial
                            color="#f8f8f8"
                            metalness={0.8}
                            roughness={0.2}
                            emissive="#ffcc88"
                            emissiveIntensity={emissiveIntensity}
                            side={2}
                          />
                        </mesh>

                        {/* Ventilation holes at top rim */}
                        {[...Array(8)].map((_, i) => (
                          <mesh
                            key={i}
                            position={[
                              Math.sin(i/8 * Math.PI * 2) * 0.25,
                              0.16,
                              Math.cos(i/8 * Math.PI * 2) * 0.25
                            ]}
                            scale={0.03}
                          >
                            <sphereGeometry args={[1, 8, 8]} />
                            <meshStandardMaterial color="#111111" transparent opacity={0.8} />
                          </mesh>
                        ))}

                        {/* Light bulb - visible inside the shade */}
                        <group position={[0, -0.12, 0]}>
                          <mesh>
                            <sphereGeometry args={[0.09, 16, 16]} />
                            <animated.meshStandardMaterial
                              color="#ffffff"
                              emissive="#ffe0bd"
                              emissiveIntensity={emissiveIntensity}
                              transparent
                              opacity={0.9}
                            />
                          </mesh>

                          {/* Bulb base */}
                          <mesh position={[0, 0.07, 0]}>
                            <cylinderGeometry args={[0.025, 0.04, 0.06, 12]} />
                            <meshStandardMaterial color="#b3b3b3" metalness={0.7} roughness={0.3} />
                          </mesh>

                          {/* Light source */}
                          <animated.pointLight
                            intensity={intensity}
                            color="#ffe0bd"
                            distance={15}
                            castShadow
                            shadow-mapSize-width={2048}
                            shadow-mapSize-height={2048}
                            shadow-bias={-0.001}
                          />
                        </group>

                        {/* Small metal accent at the top */}
                        <mesh position={[0, 0.175, 0]}>
                          <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
                          <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
                        </mesh>
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Floor */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.8} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -7]} receiveShadow>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.95} />
      </mesh>

      {/* Side wall */}
      <mesh position={[-7, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.95} />
      </mesh>
    </group>
  );
};

export default Desk;
