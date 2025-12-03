import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS, ANIMATION_CONFIG } from '../constants';
import { getChaosPosition, getTreePosition } from '../utils/treeMath';
import { TreeState } from '../types';

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  attribute vec3 aChaosPos;
  attribute vec3 aTargetPos;
  attribute float aRandom;
  
  varying float vAlpha;
  varying vec3 vColor;
  varying float vRandom;

  // Easing function for smooth transition (Cubic InOut)
  float cubicInOut(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    vRandom = aRandom;
    
    // Stagger effect: different particles move at slightly different times based on randomness
    // We clamp the staggered progress to 0.0 - 1.0
    float stagger = aRandom * 0.3; // 30% stagger variance
    float effectiveProgress = smoothstep(0.0 + stagger, 1.0, uProgress * (1.0 + stagger));
    
    float t = cubicInOut(effectiveProgress);
    
    // Interpolate position
    vec3 pos = mix(aChaosPos, aTargetPos, t);
    
    // Add subtle wind/sparkle movement when formed, more chaotic when loose
    float movementScale = mix(0.5, 0.05, t);
    pos.x += sin(uTime * 2.0 + aRandom * 100.0) * movementScale;
    pos.y += cos(uTime * 1.5 + aRandom * 50.0) * movementScale;
    pos.z += sin(uTime * 1.0 + aRandom * 25.0) * movementScale;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation: Particles are larger in Chaos, smaller/sharper in Tree
    float baseSize = mix(6.0, 4.0, t);
    gl_PointSize = (baseSize * aRandom + 2.0) * (20.0 / -mvPosition.z);
    
    // Alpha
    vAlpha = 0.6 + 0.4 * t;
  }
`;

const fragmentShader = `
  uniform vec3 uColor1; // Deep Emerald
  uniform vec3 uColor2; // Gold Highlight
  
  varying float vAlpha;
  varying float vRandom;

  void main() {
    // Circular particle soft edge
    vec2 coord = gl_PointCoord - vec2(0.5);
    float r = length(coord);
    if (r > 0.5) discard;
    
    // Soft glow falloff
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    // Color mixing: mostly emerald, but some random gold sparkles
    vec3 finalColor = mix(uColor1, uColor2, vRandom * 0.3); // 30% influence of gold
    
    // Extra sparkle for a few particles
    if (vRandom > 0.95) {
      finalColor = mix(finalColor, vec3(1.0, 1.0, 0.8), 0.5); // White/Gold sparkle
    }

    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  treeState: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Keep track of current progress for smooth animation
  const progressRef = useRef(0);

  // Generate geometry data once
  const { positions, chaosPos, targetPos, randoms } = useMemo(() => {
    const count = TREE_CONFIG.FOLIAGE_COUNT;
    const positions = new Float32Array(count * 3);
    const chaosPos = new Float32Array(count * 3);
    const targetPos = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Chaos position
      const cp = getChaosPosition(30);
      chaosPos[i * 3] = cp.x;
      chaosPos[i * 3 + 1] = cp.y;
      chaosPos[i * 3 + 2] = cp.z;

      // Tree position
      const tp = getTreePosition();
      targetPos[i * 3] = tp.x;
      targetPos[i * 3 + 1] = tp.y;
      targetPos[i * 3 + 2] = tp.z;

      // Random attribute
      randoms[i] = Math.random();
      
      // Initialize positions to 0 (handled by shader)
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }

    return { positions, chaosPos, targetPos, randoms };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColor1: { value: COLORS.EMERALD_DEEP },
    uColor2: { value: COLORS.GOLD_HIGH_GLOSS },
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Animate progress
      const target = treeState === TreeState.FORMED ? 1 : 0;
      const speed = delta / ANIMATION_CONFIG.TRANSITION_SPEED;
      
      if (Math.abs(progressRef.current - target) > 0.001) {
        if (progressRef.current < target) {
          progressRef.current = Math.min(progressRef.current + speed, target);
        } else {
          progressRef.current = Math.max(progressRef.current - speed, target);
        }
        materialRef.current.uniforms.uProgress.value = progressRef.current;
      }
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aChaosPos"
          count={chaosPos.length / 3}
          array={chaosPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          count={targetPos.length / 3}
          array={targetPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;