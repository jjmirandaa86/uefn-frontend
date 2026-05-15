import { useCallback, useEffect, useRef, useState } from 'react';

export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle');

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }

    try {
      setStatus('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStatus('ready');
    } catch {
      setStatus('denied');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus('idle');
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  return { videoRef, status, startCamera, stopCamera };
}
