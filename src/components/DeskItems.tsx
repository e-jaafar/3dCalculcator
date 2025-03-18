import { useSpring, animated } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';

interface DeskItemsProps {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
}

const DeskItems: React.FC<DeskItemsProps> = ({ timeOfDay }) => {
  // États des éléments interactifs
  const [coffeeHot, setCoffeeHot] = useState(true);
  const [pencilRotated, setPencilRotated] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [openPage, setOpenPage] = useState(0);
  
  // Références pour animation
  const pencilRef = useRef<THREE.Group>(null);
  const coffeeRef = useRef<THREE.Group>(null);
  const steamRef = useRef<THREE.Group>(null);
  const notebookRef = useRef<THREE.Group>(null);
  
  // Position de la souris pour interaction avancée
  // Animations avec react-spring - ralentissement des animations pour réduire les glitches
  const pencilProps = useSpring({
    px: pencilRotated ? 3 : 3,
    py: pencilRotated ? 0.05 : 0.05,
    pz: pencilRotated ? 0.5 : 0,
    rx: 0,
    ry: 0,
    rz: pencilRotated ? Math.PI * 0.25 : 0,
    config: { tension: 120, friction: 30 } // Valeurs plus faibles pour animations plus douces
  });
  
  // Animation d'opacité pour la vapeur de café

  
  // Animation de rotation du cahier
  const notebookProps = useSpring({
    rx: 0,
    ry: notebookOpen ? Math.PI * 0.1 : 0,
    rz: 0,
    config: { tension: 80, friction: 20 } // Valeurs plus faibles pour animations plus douces
  });
  
  // Animations de vapeur de café et interactions - réduction de la vitesse des animations
  useFrame((state, delta) => {
    // Limiter delta pour éviter les sauts lors de bas framerate
    const limitedDelta = Math.min(delta, 0.1);
    
    if (pencilRef.current) {
      // Animation subtile du crayon au repos - réduite
      if (!pencilRotated) {
        pencilRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.01;
      }
    }
    
    // Animation de la vapeur du café - ralentie
    if (steamRef.current && coffeeHot) {
      // Faire flotter les particules de vapeur
      steamRef.current.children.forEach((particle, i) => {
        if (particle instanceof THREE.Mesh) {
          // Animation de montée - ralentie
          particle.position.y += limitedDelta * (0.05 + i % 3 * 0.02);
          
          // Animation d'oscillation - réduite
          particle.position.x += Math.sin(state.clock.getElapsedTime() * (0.3 + i * 0.05)) * limitedDelta * 0.03;
          
          // Rotation lente - ralentie
          particle.rotation.z += limitedDelta * 0.1;
          
          // Réinitialisation lorsqu'elle va trop haut
          if (particle.position.y > 0.8) {
            particle.position.y = 0.2;
            particle.position.x = (Math.random() - 0.5) * 0.1;
            particle.position.z = (Math.random() - 0.5) * 0.1;
          }
        }
      });
    }
    
    // Animation du cahier ouvert - réduite
    if (notebookRef.current && notebookOpen) {
      // Légère ondulation des pages - réduite
      notebookRef.current.children.forEach((page, i) => {
        if (i > 0 && i < 6 && page instanceof THREE.Mesh) {
          page.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5 + i * 0.1) * 0.005 + openPage * 0.1;
        }
      });
    }
    
    // Mise à jour de la position de la souris pour interactivité

  });
  
  // Fonction pour créer les particules de vapeur du café - réduites en nombre
  const createSteamParticles = () => {
    const particles = [];
    
    for (let i = 0; i < 6; i++) { // Réduit de 10 à 6 particules
      particles.push(
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 0.08, 
            0.2 + Math.random() * 0.15, 
            (Math.random() - 0.5) * 0.08
          ]}
          scale={[0.04 + Math.random() * 0.02, 0.04 + Math.random() * 0.02, 0.04]}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent={true} 
            opacity={0.25} 
          />
        </mesh>
      );
    }
    
    return particles;
  };
  
  // Fonction pour créer les pages du cahier
  const createNotebookPages = () => {
    const pages = [];
    const pageCount = 6; // Pages + couverture
    
    for (let i = 0; i < pageCount; i++) {
      const isFirstPage = i === 0;
      const isLastPage = i === pageCount - 1;
      const pageAngle = notebookOpen ? (isFirstPage ? 0 : 0) : 0;
      
      pages.push(
        <mesh 
          key={i}
          position={[0, 0.01 * i, 0]}
          rotation={[0, pageAngle, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.4, 0.01, 2]} />
          <meshStandardMaterial 
            color={isFirstPage || isLastPage ? "#546e7a" : "#f5f5f5"} 
            roughness={isFirstPage || isLastPage ? 0.8 : 0.2}
            metalness={0}
          />
          
          {/* Lignes sur les pages du cahier */}
          {!isFirstPage && !isLastPage && (
            <group position={[0, 0.006, 0]}>
              {[...Array(8)].map((_, lineIndex) => (
                <mesh key={lineIndex} position={[0, 0, -0.9 + lineIndex * 0.25]}>
                  <boxGeometry args={[1.2, 0.002, 0.01]} />
                  <meshBasicMaterial color="#a5d6a7" opacity={0.5} transparent />
                </mesh>
              ))}
            </group>
          )}
          
          {/* Titre du cahier sur la couverture */}
          {(isFirstPage || isLastPage) && (
            <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.6, 0.2]} />
              <meshBasicMaterial color="#333333" transparent opacity={0.8} />
            </mesh>
          )}
          
          {/* Notes écrites dans le cahier (pages intérieures) - remplacé par des rectangles colorés */}
          {!isFirstPage && !isLastPage && openPage === i - 1 && (
            <group position={[0, 0.007, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <mesh>
                <planeGeometry args={[1, 0.5]} />
                <meshBasicMaterial color="#dddddd" transparent opacity={0.6} />
              </mesh>
              <mesh position={[0, -0.1, 0.001]}>
                <planeGeometry args={[0.8, 0.05]} />
                <meshBasicMaterial color="#333333" transparent opacity={0.6} />
              </mesh>
              <mesh position={[0, 0, 0.001]}>
                <planeGeometry args={[0.6, 0.05]} />
                <meshBasicMaterial color="#333333" transparent opacity={0.6} />
              </mesh>
              <mesh position={[0, 0.1, 0.001]}>
                <planeGeometry args={[0.7, 0.05]} />
                <meshBasicMaterial color="#333333" transparent opacity={0.6} />
              </mesh>
            </group>
          )}
        </mesh>
      );
    }
    
    return pages;
  };

  return (
    <group>
      {/* Tasse de café */}
      <animated.group
        ref={coffeeRef}
        position={[-3.5, 0.05, -1.2] as [number, number, number]} // Légèrement déplacée
        onClick={() => setCoffeeHot(!coffeeHot)}
      >
        {/* Corps de la tasse */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.2, 0.4, 16]} />
          <meshStandardMaterial 
            color="#c62828"
            roughness={0.2}
            metalness={0}
          />
        </mesh>
        
        {/* Anse de la tasse */}
        <mesh position={[0.25, 0.05, 0]} castShadow>
          <torusGeometry args={[0.1, 0.04, 8, 20, Math.PI]} />
          <meshStandardMaterial 
            color="#c62828"
            roughness={0.2}
            metalness={0}
          />
        </mesh>
        
        {/* Café (intérieur de la tasse) */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.2, 16]} />
          <meshStandardMaterial 
            color="#3e2723"
            roughness={0.1}
            metalness={0.1}
            emissive={coffeeHot ? "#2e1b16" : "#1a0e0a"}
            emissiveIntensity={coffeeHot ? 0.2 : 0.1}
          />
        </mesh>
        
        {/* Vapeur du café - utiliser un matériau animé plutôt que de définir opacity sur le groupe */}
        <group 
          ref={steamRef}
          position={[0, 0.2, 0]}
        >
          {coffeeHot && createSteamParticles()}
        </group>
      </animated.group>
      
      {/* Crayon */}
      <animated.group
        ref={pencilRef}
        onClick={() => setPencilRotated(!pencilRotated)}
        castShadow
        position-x={pencilProps.px}
        position-y={pencilProps.py}
        position-z={pencilProps.pz}
        rotation-x={pencilProps.rx}
        rotation-y={pencilProps.ry}
        rotation-z={pencilProps.rz}
      >
        {/* Corps du crayon */}
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.5, 6]} />
          <meshStandardMaterial color="#ffb74d" roughness={0.6} />
        </mesh>
        
        {/* Mine du crayon */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <coneGeometry args={[0.04, 0.2, 6]} />
          <meshStandardMaterial color="#424242" roughness={0.3} metalness={0.2} />
        </mesh>
        
        {/* Gomme */}
        <mesh position={[0, -0.8, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.1, 6]} />
          <meshStandardMaterial color="#ef5350" roughness={0.8} />
        </mesh>
      </animated.group>
      
      {/* Cahier - repositionné plus à gauche */}
      <animated.group
        ref={notebookRef}
        position={[-2.5, 0.05, 0.8] as [number, number, number]} // Repositionné plus à gauche et légèrement différent sur l'axe Z
        rotation-x={notebookProps.rx}
        rotation-y={notebookProps.ry}
        rotation-z={notebookProps.rz}
        onClick={() => {
          if (notebookOpen) {
            // Tourner les pages quand le cahier est ouvert
            setOpenPage((prev) => (prev + 1) % 5);
          } else {
            // Ouvrir le cahier s'il est fermé
            setNotebookOpen(true);
          }
        }}
        onDoubleClick={() => setNotebookOpen(!notebookOpen)}
      >
        {createNotebookPages()}
      </animated.group>
      
      {/* Sous-main (rectangle sur le bureau) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial 
          color={timeOfDay === 'night' ? "#263238" : "#37474f"} 
          roughness={0.9}
        />
      </mesh>
    </group>
  );
};

export default DeskItems; 