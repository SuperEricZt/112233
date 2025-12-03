import * as THREE from 'three';

// Visual Style
export const COLORS = {
  EMERALD_DEEP: new THREE.Color('#004225'),
  EMERALD_LIGHT: new THREE.Color('#0B6623'),
  GOLD_HIGH_GLOSS: new THREE.Color('#FFD700'),
  GOLD_ROSE: new THREE.Color('#E6BE8A'),
  SILVER: new THREE.Color('#C0C0C0'),
  RED_VELVET: new THREE.Color('#800020'),
};

// Tree Dimensions
export const TREE_CONFIG = {
  HEIGHT: 14,
  RADIUS_BOTTOM: 5,
  FOLIAGE_COUNT: 25000,
  ORNAMENT_COUNT: 400,
  GIFT_COUNT: 50,
};

// Animation
export const ANIMATION_CONFIG = {
  TRANSITION_SPEED: 1.5, // Seconds to transition
  BLOOM_THRESHOLD: 0.8,
  BLOOM_INTENSITY: 1.2,
};