import React from 'react';
import { TreeState } from '../types';

interface OverlayProps {
  treeState: TreeState;
  setTreeState: (state: TreeState) => void;
}

const Overlay: React.FC<OverlayProps> = ({ treeState, setTreeState }) => {
  const isChaos = treeState === TreeState.CHAOS;

  const toggleState = () => {
    setTreeState(isChaos ? TreeState.FORMED : TreeState.CHAOS);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10 select-none">
      {/* Header */}
      <header className="text-center mt-4">
        <h1 className="luxury-text text-4xl md:text-6xl text-yellow-500 tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          The Grand
        </h1>
        <h2 className="serif-text text-2xl md:text-4xl text-white italic tracking-wide mt-2 opacity-90">
          Holiday Spectacular
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto mt-4" />
      </header>

      {/* Controls */}
      <div className="text-center mb-8 pointer-events-auto">
        <button
          onClick={toggleState}
          className={`
            relative group overflow-hidden px-12 py-4 
            border-2 border-yellow-600 
            bg-black/50 backdrop-blur-sm
            transition-all duration-500 ease-out
            hover:bg-yellow-900/30 hover:border-yellow-400
            hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]
          `}
        >
          {/* Button Text */}
          <span className="luxury-text text-xl md:text-2xl text-yellow-100 tracking-[0.2em] relative z-10 group-hover:text-white transition-colors">
            {isChaos ? 'ASSEMBLE' : 'SCATTER'}
          </span>
          
          {/* Shine Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent skew-x-12" />
        </button>
        
        <p className="mt-4 serif-text text-gray-400 text-sm italic">
          {isChaos ? 'Experience the magnificence' : 'Unleash the festive chaos'}
        </p>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-4 left-4 text-xs text-yellow-800/50 serif-text tracking-widest">
        EST. 2024 • GOLD EDITION
      </div>
    </div>
  );
};

export default Overlay;