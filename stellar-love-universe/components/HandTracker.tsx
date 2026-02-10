
import React, { useEffect, useRef, useState } from 'react';
import { GestureState } from '../types';

interface HandTrackerProps {
  onGestureChange: (gesture: GestureState) => void;
}

declare const Hands: any;
declare const Camera: any;

const HandTracker: React.FC<HandTrackerProps> = ({ onGestureChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Detect fist: if distance between fingertips and palm base is small
        // Landmarks: 0 (wrist), 4 (thumb tip), 8 (index tip), 12 (middle tip), 16 (ring tip), 20 (pinky tip)
        const wrist = landmarks[0];
        const tips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
        
        const distances = tips.map(tip => {
          return Math.sqrt(
            Math.pow(tip.x - wrist.x, 2) + 
            Math.pow(tip.y - wrist.y, 2)
          );
        });

        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        
        // Threshold for closed fist (0.2 is usually a good heuristic for MediaPipe normalized coords)
        const isFist = avgDistance < 0.18;
        onGestureChange(isFist ? GestureState.CLOSED : GestureState.OPEN);
      } else {
        onGestureChange(GestureState.OPEN);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start()
      .then(() => setIsActive(true))
      .catch((err: any) => {
        console.error("Camera access failed", err);
        setError("Por favor permite el acceso a la cámara para interactuar con el universo.");
      });

    return () => {
      camera.stop();
      hands.close();
    };
  }, [onGestureChange]);

  return (
    <div className="fixed bottom-4 right-4 z-20 overflow-hidden rounded-xl border-2 border-pink-500/30 shadow-2xl bg-black/50 group hover:scale-105 transition-transform">
      <video
        ref={videoRef}
        className="w-32 md:w-48 h-auto grayscale mirror opacity-80 group-hover:opacity-100 transition-opacity"
        autoPlay
        playsInline
      />
      {!isActive && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-center p-2">
          Cargando tracking...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-center p-2 bg-red-900/40 text-red-200">
          {error}
        </div>
      )}
      <div className="absolute top-0 left-0 bg-pink-600 text-[10px] px-2 py-0.5 rounded-br-lg font-bold">
        CAMERA INTERACTION
      </div>
      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default HandTracker;
