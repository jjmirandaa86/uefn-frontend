import { useCallback, useEffect, useRef, useState } from 'react';

export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(false);
  const [status, setStatus] = useState('idle');

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const el = videoRef.current;
    if (el) {
      el.srcObject = null;
    }
    setStatus('idle');
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const el = videoRef.current;
      if (el) {
        el.srcObject = null;
      }
    };
  }, []);

  /** Si el stream ya existe y el video monta despues, asegura srcObject + play. */
  useEffect(() => {
    if (status !== 'ready') return;
    const el = videoRef.current;
    const stream = streamRef.current;
    if (!el || !stream) return;
    if (el.srcObject !== stream) {
      el.srcObject = stream;
      void el.play().catch(() => {});
    }
  }, [status]);

  const startCamera = useCallback(async () => {
    if (typeof globalThis !== 'undefined' && !globalThis.isSecureContext) {
      setStatus('insecure');
      return;
    }

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

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const el = videoRef.current;
      if (!el) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStatus('idle');
        return;
      }

      el.srcObject = stream;
      try {
        await el.play();
      } catch {
        /* algunos navegadores tras async; autoPlay en el tag suele cubrir */
      }

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        el.srcObject = null;
        return;
      }

      setStatus('ready');
    } catch {
      if (mountedRef.current) {
        setStatus('denied');
      }
    }
  }, []);

  return { videoRef, status, startCamera, stopCamera };
}
