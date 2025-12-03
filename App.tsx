import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Experience from './components/Experience';
import Overlay from './components/Overlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]} // Support high pixel density
        gl={{ 
          antialias: false, // Postprocessing handles AA or we accept aliasing for performance
          toneMapping: 3, // ACESFilmic
          toneMappingExposure: 1.2
        }}
        className="w-full h-screen bg-[#050505]"
      >
        <Experience treeState={treeState} />
      </Canvas>
      
      <Overlay treeState={treeState} setTreeState={setTreeState} />
      
      <Loader 
        containerStyles={{ background: '#050505' }}
        innerStyles={{ width: '300px', height: '2px', background: '#333' }}
        barStyles={{ background: '#D4AF37', height: '2px' }}
        dataStyles={{ fontFamily: 'Cinzel', color: '#D4AF37', fontSize: '1rem' }}
      />
    </>
  );
};

export default App;