import React, { Suspense } from 'react';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { TreeState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import { COLORS } from '../constants';

interface ExperienceProps {
  treeState: TreeState;
}

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 25]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minDistance={10} 
        maxDistance={40}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={treeState === TreeState.FORMED}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
      />

      {/* Lighting: Trump Style = Gold, Warm, Bright */}
      <ambientLight intensity={0.5} color="#ffffff" />
      <spotLight
        position={[10, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={1000}
        color={COLORS.GOLD_HIGH_GLOSS}
        castShadow
        shadow-bias={-0.0001}
      />
      <pointLight position={[-10, -5, -10]} intensity={500} color={COLORS.RED_VELVET} />
      <pointLight position={[0, 10, 0]} intensity={200} color="#ffffff" />

      {/* Environment - Switched to city to ensure reliable loading */}
      <Environment preset="city" background={false} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Floor Mirror Effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#050505" 
          roughness={0.1} 
          metalness={0.8}
        />
      </mesh>

      <group position={[0, -2, 0]}>
        <Suspense fallback={null}>
            <Foliage treeState={treeState} />
            <Ornaments treeState={treeState} />
        </Suspense>
      </group>

      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Experience;