import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState, Suspense } from 'react';
import * as THREE from 'three';

import Calculator from './components/Calculator';
import Desk from './components/Desk';
import Environment, { TimeOfDay, WeatherType } from './components/Environment';
import Window from './components/Window';
import DeskItems from './components/DeskItems';

function App() {
  // États pour le moment de la journée et la météo
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [weather, setWeather] = useState<WeatherType>('clear');

  // Fonction pour mettre à jour les états depuis Environment
  const handleEnvironmentChange = (newTime: TimeOfDay, newWeather: WeatherType) => {
    setTimeOfDay(newTime);
    setWeather(newWeather);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas
        camera={{
          // Position camera at an angle to see the desk and calculator
          position: [3, 5, 6],
          fov: 50,
          // Look directly down at the calculator
          up: [0, 1, 0], // Set up vector to Y axis for proper orientation
        }}
        shadows
        gl={{ 
          antialias: true, // Important pour réduire les scintillements
          alpha: false, 
          powerPreference: 'high-performance',
          // Utiliser un renderer WebGL plus simple peut aider avec les problèmes de rendu
          outputEncoding: THREE.LinearEncoding,
        }}
        // Configurer la caméra de façon plus stable
        onCreated={({ gl, camera }) => {
          gl.setClearColor('#121212');
          camera.updateProjectionMatrix();
        }}
      >
        {/* Wrapper avec Suspense pour améliorer le chargement et réduire les glitches */}
        <Suspense fallback={null}>
          {/* Système de cycle jour/nuit et météo */}
          <Environment 
            autoChangeTime={true}
            initialTimeOfDay="day"
            initialWeather="clear"
            timeSpeedFactor={0.2} // Beaucoup plus lent pour transitions plus douces
          />

          {/* Fenêtre avec vue sur l'extérieur */}
          <Window 
            position={[0, 2, -5]} 
            scale={[1.5, 1.5, 1.5]} 
            weather={weather}
            timeOfDay={timeOfDay}
          />

          {/* Desk and environment */}
          <Desk />

          {/* Objets interactifs sur le bureau */}
          <DeskItems timeOfDay={timeOfDay} />

          {/* Calculator positioned on desk */}
          <Calculator />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          maxDistance={20}
          minDistance={3}
          enablePan={true}
          maxPolarAngle={Math.PI / 1.5} // Allow more viewing angles
          target={[0, 0.5, 0]} // Look at the middle of the scene
          enableDamping={true} // Ajoute un effet d'inertie pour des mouvements plus fluides
          dampingFactor={0.05} // Contrôle la vitesse d'inertie
        />
      </Canvas>
    </div>
  );
}

export default App;
