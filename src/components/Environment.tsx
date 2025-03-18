import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud, Sky, Text3D } from '@react-three/drei';
import * as THREE from 'three';

// Types de météo disponibles
export type WeatherType = 'clear' | 'cloudy' | 'rainy' | 'snowy';
// Moments de la journée
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

interface EnvironmentProps {
  autoChangeTime?: boolean;
  initialTimeOfDay?: TimeOfDay;
  initialWeather?: WeatherType;
  timeSpeedFactor?: number; // Facteur de vitesse du cycle jour/nuit (1 = 1 minute pour un cycle complet)
}

const Environment: React.FC<EnvironmentProps> = ({
  autoChangeTime = true,
  initialTimeOfDay = 'day',
  initialWeather = 'clear',
  timeSpeedFactor = 1,
}) => {
  // État pour le temps et la météo
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initialTimeOfDay);
  const [weather, setWeather] = useState<WeatherType>(initialWeather);
  const [sunPosition, setSunPosition] = useState<[number, number, number]>([0, 1, 0]);
  const [timeProgress, setTimeProgress] = useState(
    initialTimeOfDay === 'dawn' ? 0.25 :
    initialTimeOfDay === 'day' ? 0.5 :
    initialTimeOfDay === 'dusk' ? 0.75 :
    0 // night
  );
  
  // Références pour les objets animés
  const cloudsRef = useRef<THREE.Group>(null);
  const rainRef = useRef<THREE.Group>(null);
  const rainParticles = useRef<THREE.Points>(null);
  
  // Couleurs pour les différents moments de la journée
  const skyColors = {
    dawn: '#ff7e57',
    day: '#87ceeb',
    dusk: '#ff5e57',
    night: '#0c1445',
  };
  
  const lightColors = {
    dawn: '#ff9966',
    day: '#ffffff',
    dusk: '#ff7755',
    night: '#334466',
  };
  
  const lightIntensities = {
    dawn: 0.8,
    day: 1.0,
    dusk: 0.7,
    night: 0.2,
  };

  // Effet pour mettre à jour le cycle jour/nuit avec des transitions plus fluides
  useFrame((_, delta) => {
    // Limiter delta pour éviter les sauts lors de bas framerate
    const limitedDelta = Math.min(delta, 0.1);
    
    // Mise à jour du temps si auto-change est activé
    if (autoChangeTime) {
      // Progression du temps (1 cycle complet en 1 minute par défaut) - ralentie
      const newProgress = (timeProgress + limitedDelta * 0.01 * timeSpeedFactor) % 1;
      setTimeProgress(newProgress);
      
      // Déterminer le moment de la journée en fonction de la progression
      const newTimeOfDay: TimeOfDay = 
        newProgress < 0.25 ? 'night' :
        newProgress < 0.5 ? 'dawn' :
        newProgress < 0.75 ? 'day' : 'dusk';
        
      if (newTimeOfDay !== timeOfDay) {
        setTimeOfDay(newTimeOfDay);
      }
      
      // Calculer la position du soleil sur une orbite (semi-cercle au-dessus de l'horizon)
      const sunAngle = (newProgress * Math.PI * 2) - Math.PI / 2;
      const sunHeight = Math.sin(sunAngle) * 10;
      const sunDistance = Math.cos(sunAngle) * 10;
      setSunPosition([sunDistance, Math.max(0.1, sunHeight), -2]);
    }
    
    // Animation des nuages - ralentie
    if (cloudsRef.current) {
      cloudsRef.current.position.x += limitedDelta * 0.05;
      if (cloudsRef.current.position.x > 20) {
        cloudsRef.current.position.x = -20;
      }
    }
    
    // Animation de la pluie - optimisée
    if (weather === 'rainy' && rainParticles.current) {
      const positions = (rainParticles.current.geometry as THREE.BufferGeometry)
        .getAttribute('position') as THREE.BufferAttribute;
      
      // Traiter les gouttes par groupes pour plus d'efficacité et moins de glitches
      for (let i = 0; i < positions.count; i += 3) {
        // Mise à jour des positions pour un groupe de gouttes
        for (let j = 0; j < Math.min(3, positions.count - i); j++) {
          const idx = i + j;
          positions.setY(idx, positions.getY(idx) - 0.05); // Vitesse réduite
          
          // Réinitialiser les gouttes qui sont tombées sous la "fenêtre"
          if (positions.getY(idx) < -5) {
            positions.setY(idx, 5);
            positions.setX(idx, Math.random() * 8 - 4);
            positions.setZ(idx, Math.random() * 2 - 8);
          }
        }
      }
      positions.needsUpdate = true;
    }
  });

  // Création des particules de pluie - optimisée
  const createRaindrops = () => {
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = [];
    const rainCount = 600; // Réduit pour de meilleures performances
    
    for (let i = 0; i < rainCount; i++) {
      // Distribution moins aléatoire pour réduire l'effet de scintillement
      const xGrid = Math.floor(i / 30) % 20;
      const yGrid = i % 30;
      
      rainPositions.push(
        (xGrid - 10) * 0.5 + (Math.random() * 0.3),  // x - distribution en grille avec légère variation
        (yGrid - 15) * 0.5 + (Math.random() * 0.3),  // y - distribution en grille avec légère variation
        Math.random() * 2 - 8    // z
      );
    }
    
    rainGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(rainPositions, 3)
    );
    
    const rainMaterial = new THREE.PointsMaterial({
      color: '#aaccff',
      size: 0.04, // Taille réduite
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    
    return (
      <points ref={rainParticles} geometry={rainGeometry} material={rainMaterial} />
    );
  };

  // Interface utilisateur pour changer la météo et l'heure
  const handleWeatherChange = (newWeather: WeatherType) => {
    setWeather(newWeather);
  };
  
  const handleTimeChange = (newTime: TimeOfDay) => {
    setTimeOfDay(newTime);
    setTimeProgress(
      newTime === 'dawn' ? 0.25 :
      newTime === 'day' ? 0.5 :
      newTime === 'dusk' ? 0.75 : 0
    );
  };

  return (
    <group>
      {/* Ciel avec couleur adaptée au moment de la journée */}
      <Sky 
        distance={450000} 
        sunPosition={sunPosition} 
        inclination={0.6}
        azimuth={0.25}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        rayleigh={timeOfDay === 'night' ? 6 : 0.5}
        turbidity={timeOfDay === 'night' ? 20 : 10}
      />
      
      {/* Éclairage ambiant adapté au moment de la journée */}
      <ambientLight 
        color={lightColors[timeOfDay]} 
        intensity={lightIntensities[timeOfDay] * 0.5} 
      />
      
      {/* Soleil/Lune - source principale de lumière */}
      <directionalLight
        position={sunPosition}
        intensity={lightIntensities[timeOfDay]}
        color={lightColors[timeOfDay]}
        castShadow
        shadow-mapSize-width={1024} // Réduit pour meilleures performances
        shadow-mapSize-height={1024} // Réduit pour meilleures performances
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005} // Réduit les artefacts de shadow acne
      />
      
      {/* Nuages si le temps est nuageux ou pluvieux - réduits et positionnés différemment */}
      {(weather === 'cloudy' || weather === 'rainy') && (
        <group ref={cloudsRef}>
          <Cloud position={[-4, 6, -12]} speed={0.1} opacity={0.7} width={8} depth={1.5} />
          <Cloud position={[2, 8, -15]} speed={0.05} opacity={0.5} width={6} depth={1} />
          <Cloud position={[8, 7, -18]} speed={0.15} opacity={0.6} width={10} depth={1.5} />
        </group>
      )}
      
      {/* Pluie si météo pluvieuse */}
      {weather === 'rainy' && (
        <group ref={rainRef} position={[0, 0, -10]}>
          {createRaindrops()}
        </group>
      )}
      
      {/* Contrôles UI pour changer la météo et l'heure - rendus différemment */}
      <group position={[-4.9, 0.1, -3]} rotation={[0, 0, 0]}>
        {/* Contrôles météo avec légendes */}
        <mesh position={[-0.3, 0.2, 0]}>
          <boxGeometry args={[0.4, 0.1, 0.01]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        <mesh onClick={() => handleWeatherChange('clear')} position={[-0.6, 0, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.05]} />
          <meshStandardMaterial color={weather === 'clear' ? '#ffcc00' : '#555555'} />
        </mesh>
        <mesh onClick={() => handleWeatherChange('cloudy')} position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.05]} />
          <meshStandardMaterial color={weather === 'cloudy' ? '#aaaaaa' : '#555555'} />
        </mesh>
        <mesh onClick={() => handleWeatherChange('rainy')} position={[0, 0, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.05]} />
          <meshStandardMaterial color={weather === 'rainy' ? '#6688cc' : '#555555'} />
        </mesh>
      </group>
      
      <group position={[-4.5, 0.1, -3.5]} rotation={[0, 0, 0]}>
        {/* Contrôles heure avec légendes */}
        <mesh position={[0.3, 0.2, 0]}>
          <boxGeometry args={[0.4, 0.1, 0.01]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        <mesh onClick={() => handleTimeChange('dawn')} position={[0, 0, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.05]} />
          <meshStandardMaterial color={timeOfDay === 'dawn' ? '#ff9966' : '#555555'} />
        </mesh>
        <mesh onClick={() => handleTimeChange('day')} position={[0.3, 0, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.05]} />
          <meshStandardMaterial color={timeOfDay === 'day' ? '#ffcc00' : '#555555'} />
        </mesh>
        <mesh onClick={() => handleTimeChange('dusk')} position={[0.6, 0, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.05]} />
          <meshStandardMaterial color={timeOfDay === 'dusk' ? '#ff7755' : '#555555'} />
        </mesh>
        <mesh onClick={() => handleTimeChange('night')} position={[0.9, 0, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.05]} />
          <meshStandardMaterial color={timeOfDay === 'night' ? '#334466' : '#555555'} />
        </mesh>
      </group>
    </group>
  );
};

export default Environment; 