import * as THREE from 'three';
import { TREE_CONFIG } from '../constants';

const { HEIGHT, RADIUS_BOTTOM } = TREE_CONFIG;

// Generate a random point inside a large sphere (Chaos state)
export const getChaosPosition = (radius: number = 25): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius; // Cubic root for uniform distribution
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

// Generate a point on the volume of a cone (Tree state)
export const getTreePosition = (yRatioInput?: number): THREE.Vector3 => {
  // y goes from 0 (bottom) to HEIGHT (top)
  // Or we can center it. Let's make base at y = -HEIGHT/2
  
  const h = HEIGHT;
  const rBase = RADIUS_BOTTOM;
  
  // Random height along the cone
  // We want more needles at the bottom, so use sqrt or linear depending on desired density
  const yRatio = yRatioInput ?? Math.sqrt(Math.random()); 
  const y = yRatio * h; 
  
  // Radius at this height
  const rAtHeight = rBase * (1 - yRatio);
  
  // Random angle
  const theta = Math.random() * Math.PI * 2;
  
  // Random distance from center (volume, not just surface)
  // Use sqrt for uniform disk distribution
  const r = Math.sqrt(Math.random()) * rAtHeight;
  
  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);
  
  // Offset y to center the tree vertically
  const finalY = y - h / 2;
  
  return new THREE.Vector3(x, finalY, z);
};

export const getTreeSurfacePosition = (): THREE.Vector3 => {
   const h = HEIGHT;
   const rBase = RADIUS_BOTTOM;
   
   const yRatio = Math.random();
   const y = yRatio * h;
   const rAtHeight = rBase * (1 - yRatio);
   const theta = Math.random() * Math.PI * 2;
   
   const x = rAtHeight * Math.cos(theta);
   const z = rAtHeight * Math.sin(theta);
   const finalY = y - h / 2;
   
   return new THREE.Vector3(x, finalY, z);
}