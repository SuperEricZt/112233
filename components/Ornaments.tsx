import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { TREE_CONFIG, COLORS, ANIMATION_CONFIG } from '../constants';
import { getChaosPosition, getTreeSurfacePosition } from '../utils/treeMath';

interface OrnamentsProps {
  treeState: TreeState;
}

// Reusable logic for both Baubles and Gifts
const OrnamentGroup = ({
  count,
  geometry,
  material,
  type,
  treeState,
}: {
  count: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  type: 'bauble' | 'gift';
  treeState: TreeState;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Store instance data: chaos pos, target pos, color, speed factor, currentProgress
  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // Weight: Gifts are heavier (move slower), Baubles lighter
      const weight = type === 'gift' ? 0.8 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5;
      
      const chaos = getChaosPosition(35); // Slightly wider scatter than foliage
      
      let target: THREE.Vector3;
      let scale: number;
      
      if (type === 'gift') {
        // Gifts at the base
        const r = Math.sqrt(Math.random()) * (TREE_CONFIG.RADIUS_BOTTOM * 1.2);
        const theta = Math.random() * Math.PI * 2;
        target = new THREE.Vector3(
          r * Math.cos(theta),
          (-TREE_CONFIG.HEIGHT / 2) + 0.5 + Math.random(), // Just above floor
          r * Math.sin(theta)
        );
        scale = 0.5 + Math.random() * 0.5;
      } else {
        // Baubles on surface
        target = getTreeSurfacePosition();
        scale = 0.2 + Math.random() * 0.2;
      }

      // Assign luxury colors
      const palette = [
        COLORS.GOLD_HIGH_GLOSS,
        COLORS.GOLD_ROSE,
        COLORS.SILVER,
        COLORS.RED_VELVET
      ];
      const color = palette[Math.floor(Math.random() * palette.length)];

      return {
        chaos,
        target,
        color,
        scale,
        speed: 1.0 / weight, // Heavier = lower speed multiplier
        progress: 0,
        rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
      };
    });
  }, [count, type]);

  // Initial setup for colors
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    data.forEach((d, i) => {
      meshRef.current!.setColorAt(i, d.color);
    });
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const baseSpeed = delta / ANIMATION_CONFIG.TRANSITION_SPEED;
    const targetState = treeState === TreeState.FORMED ? 1 : 0;

    data.forEach((d, i) => {
      // Calculate individual progress based on speed/weight
      // Move towards targetState
      if (d.progress < targetState) {
        d.progress = Math.min(d.progress + baseSpeed * d.speed, targetState);
      } else if (d.progress > targetState) {
        d.progress = Math.max(d.progress - baseSpeed * d.speed, targetState);
      }
      
      // Easing
      const t = d.progress < 0.5
          ? 4.0 * d.progress * d.progress * d.progress
          : 1.0 - Math.pow(-2.0 * d.progress + 2.0, 3.0) / 2.0;

      // Position
      dummy.position.lerpVectors(d.chaos, d.target, t);
      
      // Add slight floating motion
      if (type === 'bauble') {
          dummy.position.y += Math.sin(state.clock.elapsedTime + i) * 0.02;
      }

      // Rotation
      dummy.rotation.set(
        d.rotationAxis.x * state.clock.elapsedTime * (1 - t), // Spin fast in chaos
        d.rotationAxis.y * state.clock.elapsedTime, 
        d.rotationAxis.z * state.clock.elapsedTime * (1 - t)
      );

      dummy.scale.setScalar(d.scale);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
};

const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  // Geometries
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);
  const boxGeo = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    // Bevel logic could be added here, but Box is fine for now
    return geo;
  }, []);

  // Materials - Physical for maximum luxury reflection
  const baubleMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    metalness: 1.0,
    roughness: 0.15,
    envMapIntensity: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  }), []);

  const giftMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMapIntensity: 1.0,
    sheen: 1.0,
    sheenColor: new THREE.Color('#ffffff'),
  }), []);

  return (
    <group>
      {/* Baubles */}
      <OrnamentGroup
        count={TREE_CONFIG.ORNAMENT_COUNT}
        geometry={sphereGeo}
        material={baubleMaterial}
        type="bauble"
        treeState={treeState}
      />
      
      {/* Gifts */}
      <OrnamentGroup
        count={TREE_CONFIG.GIFT_COUNT}
        geometry={boxGeo}
        material={giftMaterial}
        type="gift"
        treeState={treeState}
      />
    </group>
  );
};

export default Ornaments;