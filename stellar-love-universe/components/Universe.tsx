
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { GestureState } from '../types';

interface UniverseProps {
  gesture: GestureState;
}

const Universe: React.FC<UniverseProps> = ({ gesture }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const animationFrameRef = useRef<number>();

  const starCount = 6000;
  
  // Generate "TE odio" points using a hidden canvas
  const targetPoints = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    
    canvas.width = 400;
    canvas.height = 100;
    ctx.fillStyle = 'green';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TE AMO', 200, 50);
    
    const imageData = ctx.getImageData(0, 0, 400, 100).data;
    const points: { x: number; y: number }[] = [];
    
    for (let y = 0; y < 100; y += 1.5) {
      for (let x = 0; x < 400; x += 1.5) {
        const index = (Math.floor(y) * 400 + Math.floor(x)) * 4;
        if (imageData[index] > 128) {
          // Normalize to -1 to 1 range approximately
          points.push({
            x: (x - 200) / 20,
            y: (50 - y) / 20
          });
        }
      }
    }
    return points;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const originPositions = new Float32Array(starCount * 3);
    const targetPositions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Random universe positions
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originPositions[i * 3] = x;
      originPositions[i * 3 + 1] = y;
      originPositions[i * 3 + 3] = z;

      // Assign target positions
      if (i < targetPoints.length) {
        targetPositions[i * 3] = targetPoints[i].x;
        targetPositions[i * 3 + 1] = targetPoints[i].y;
        targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // Flat word
      } else {
        // Extra stars drift behind
        targetPositions[i * 3] = (Math.random() - 0.5) * 80;
        targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
        targetPositions[i * 3 + 2] = -30 - Math.random() * 20;
      }

      // Colors: varied blues, whites, and slight pinks
      const r = 0.8 + Math.random() * 0.2;
      const g = 0.8 + Math.random() * 0.2;
      const b = 0.9 + Math.random() * 0.1;
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const lerpFactor = gesture === GestureState.CLOSED ? 0.08 : 0.03;

      for (let i = 0; i < starCount; i++) {
        const tx = gesture === GestureState.CLOSED ? targetPositions[i * 3] : originPositions[i * 3];
        const ty = gesture === GestureState.CLOSED ? targetPositions[i * 3 + 1] : originPositions[i * 3 + 1];
        const tz = gesture === GestureState.CLOSED ? targetPositions[i * 3 + 2] : originPositions[i * 3 + 2];

        // Smooth transition
        posAttr.array[i * 3] += (tx - posAttr.array[i * 3]) * lerpFactor;
        posAttr.array[i * 3 + 1] += (ty - posAttr.array[i * 3 + 1]) * lerpFactor;
        posAttr.array[i * 3 + 2] += (tz - posAttr.array[i * 3 + 2]) * lerpFactor;

        // Subtle floating movement if open
        if (gesture === GestureState.OPEN) {
          originPositions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.002;
          originPositions[i * 3 + 1] += Math.cos(Date.now() * 0.001 + i) * 0.002;
        }
      }

      posAttr.needsUpdate = true;
      
      // Gentle rotation
      points.rotation.y += 0.0005;
      if (gesture === GestureState.OPEN) {
        points.rotation.x += 0.0002;
      } else {
        // Reset rotation slowly to show text clearly
        points.rotation.x += (0 - points.rotation.x) * 0.05;
        points.rotation.y += (0 - points.rotation.y) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.innerHTML = '';
      }
    };
  }, [gesture, targetPoints, starCount]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default Universe;
