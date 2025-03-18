import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WeatherType, TimeOfDay } from './Environment';

interface WindowProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  weather: WeatherType;
  timeOfDay: TimeOfDay;
}

const Window: React.FC<WindowProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  weather,
  timeOfDay,
}) => {
  // Références pour animation
  const windowRef = useRef<THREE.Group>(null);
  const raindropsRef = useRef<THREE.Mesh[]>([]);
  const condensationRef = useRef<THREE.Mesh>(null);
  
  // Couleurs extérieures selon le moment de la journée
  const skyColors = {
    dawn: '#ffa07a',
    day: '#87ceeb',
    dusk: '#ff7f50',
    night: '#191970',
  };
  
  // Gérer les gouttes de pluie sur la vitre - réduire le nombre et utiliser des positions plus régulières
  const raindrops = useMemo(() => {
    if (weather !== 'rainy') return [];
    
    const drops = [];
    const dropCount = 20; // Réduit de 30 à 20
    
    // Utiliser une grille pour des positions plus régulières
    for (let i = 0; i < dropCount; i++) {
      // Distribution sur une grille de 5x4 avec variation aléatoire
      const gridX = i % 5;
      const gridY = Math.floor(i / 5);
      
      // Position semi-régulière sur la vitre
      const x = (gridX / 4 - 0.5) * 1.5 + (Math.random() * 0.1);
      const y = (gridY / 3 - 0.5) * 1.5 + (Math.random() * 0.1);
      
      // Taille et vitesse régulières pour moins de chaos visuel
      const size = 0.03 + (gridY % 3) * 0.01;
      const height = 0.05 + (gridX % 3) * 0.03;
      
      drops.push({ 
        position: [x, y, 0.05], 
        size, 
        height, 
        speed: 0.001 + (gridY / 10) * 0.002 // Vitesse progressive basée sur la position verticale
      });
    }
    
    return drops;
  }, [weather]);
  
  // Animation des gouttes de pluie et effets
  useFrame((_, delta) => {
    // Limiter delta pour éviter les sauts lors de bas framerate
    const limitedDelta = Math.min(delta, 0.1);
    
    // Animer les gouttes de pluie qui coulent sur la vitre
    if (weather === 'rainy' && raindropsRef.current) {
      raindropsRef.current.forEach((drop, i) => {
        if (drop && drop.position) {
          // Faire descendre la goutte avec un mouvement plus fluide
          drop.position.y -= limitedDelta * (raindrops[i]?.speed || 0.002);
          
          // Léger mouvement sinusoïdal latéral pour un effet plus naturel
          drop.position.x += Math.sin(Date.now() * 0.0003 + i) * limitedDelta * 0.0005;
          
          // Si la goutte sort de la fenêtre, la replacer en haut
          if (drop.position.y < -1) {
            // Position horizontale similaire pour donner l'illusion de la même goutte qui continue
            drop.position.y = 1;
            drop.position.x = raindrops[i]?.position[0] as number + (Math.random() * 0.1 - 0.05);
          }
        }
      });
    }
    
    // Animation de condensation sur la vitre - plus douce et stable
    if (condensationRef.current) {
      let opacity = 0;
      
      if (weather === 'rainy') {
        opacity = 0.2;
      } else if (timeOfDay === 'dawn') {
        opacity = 0.1;
      } else if (timeOfDay === 'night') {
        opacity = 0.08;
      }
      
      // Effet de pulsation très léger et lent
      opacity += Math.sin(Date.now() * 0.0005) * 0.02;
      
      const material = condensationRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
        // Transition douce vers la nouvelle opacité
        material.opacity += (Math.max(0, Math.min(0.3, opacity)) - material.opacity) * 0.05;
      }
    }
  });

  // Convertir le tableau de rotation en Euler pour éviter l'erreur de typage
  const eulerRotation = useMemo(() => {
    return new THREE.Euler(rotation[0], rotation[1], rotation[2]);
  }, [rotation]);

  return (
    <group position={position} rotation={eulerRotation} scale={scale} ref={windowRef}>
      {/* Cadre de fenêtre */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[2.2, 2.2, 0.1]} />
        <meshStandardMaterial color="#5c3c2e" roughness={0.8} />
      </mesh>
      
      {/* Rebord de fenêtre intérieur */}
      <mesh position={[0, -1.15, 0.3]} receiveShadow castShadow>
        <boxGeometry args={[2.2, 0.1, 0.6]} />
        <meshStandardMaterial color="#6d4c3d" roughness={0.7} />
      </mesh>
      
      {/* Arrière-plan de la fenêtre (ciel/extérieur) */}
      <mesh position={[0, 0, 0.04]} receiveShadow>
        <planeGeometry args={[1.9, 1.9]} />
        <meshBasicMaterial color={skyColors[timeOfDay]} />
      </mesh>
      
      {/* Vitre - Verre principal */}
      <mesh position={[0, 0, 0.06]} receiveShadow>
        <planeGeometry args={[2, 2]} />
        <meshPhysicalMaterial 
          color="#e0f0ff"
          transparent
          opacity={0.2}
          roughness={0} 
          metalness={0.1}
          clearcoat={0.5} // Réduit pour moins de glitches
          clearcoatRoughness={0.2}
          reflectivity={0.5} // Réduit pour diminuer les artefacts visuels
        />
      </mesh>
      
      {/* Division de la fenêtre (croisillons) */}
      <mesh position={[0, 0, 0.07]} castShadow>
        <boxGeometry args={[0.05, 2, 0.03]} />
        <meshStandardMaterial color="#4c3020" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.07]} castShadow>
        <boxGeometry args={[2, 0.05, 0.03]} />
        <meshStandardMaterial color="#4c3020" roughness={0.8} />
      </mesh>
      
      {/* Condensation sur la vitre */}
      <mesh position={[0, 0, 0.07]} ref={condensationRef}>
        <planeGeometry args={[1.9, 1.9]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>
      
      {/* Gouttes de pluie sur la vitre - simplifiées */}
      {weather === 'rainy' && raindrops.map((drop, i) => (
        <mesh 
          key={i}
          ref={(el) => {
            if (el) raindropsRef.current[i] = el;
          }}
          position={drop.position as [number, number, number]}
        >
          <capsuleGeometry args={[drop.size / 2, drop.height, 6, 6]} /> {/* Moins de segments */}
          <meshPhysicalMaterial
            color="#c0e0ff"
            transparent
            opacity={0.6}
            roughness={0.2}
            transmission={0.7} // Réduit
            thickness={0.3} // Réduit
          />
        </mesh>
      ))}
      
      {/* Quelques objets à l'extérieur pour donner de la profondeur */}
      <group position={[0, 0, -1]}>
        {/* Un arbre simple au loin */}
        <mesh position={[-0.5, -0.2, -1]} scale={[0.2, 0.6, 0.2]}>
          <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        
        <mesh position={[-0.5, 0.2, -1]} scale={[1, 1, 1]}>
          <coneGeometry args={[0.3, 0.6, 8]} />
          <meshStandardMaterial 
            color={timeOfDay === 'night' ? '#1a2e1a' : '#2e7d32'} 
            emissive={timeOfDay === 'night' ? '#0a140a' : '#000000'} 
            emissiveIntensity={timeOfDay === 'night' ? 0.2 : 0}
          />
        </mesh>
        
        {/* Une maison au loin */}
        <group position={[0.6, -0.3, -2]}>
          <mesh scale={[0.4, 0.3, 0.3]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#d7ccc8" />
          </mesh>
          
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]} scale={[0.5, 0.2, 0.4]}>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color="#795548" />
          </mesh>
          
          {/* Lumière dans la fenêtre de la maison (la nuit) */}
          {timeOfDay === 'night' && (
            <mesh position={[0, 0, 0.16]} scale={[0.1, 0.1, 0.01]}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial color="#ffd54f" />
              <pointLight color="#ffd54f" intensity={0.5} distance={3} decay={2} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};

export default Window; 