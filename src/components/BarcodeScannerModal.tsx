import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
};

export function BarcodeScannerModal({ isOpen, onClose, onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const startScanning = async () => {
      if (!videoRef.current) return;

      try {
        setError(null);
        setScanning(true);
        const reader = new BrowserMultiFormatReader();

        const devices = await reader.listVideoInputDevices();
        const videoDevice = devices[0]?.deviceId;

        const controls = await reader.decodeFromVideoDevice(
          videoDevice || undefined,
          videoRef.current,
          (result, _err, controls) => {
            if (result) {
              const code = result.getText();
              if (code && code.length >= 8) {
                controls.stop();
                onScan(code);
                onClose();
              }
            }
          }
        );
        controlsRef.current = controls;
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'Could not access camera. Ensure you have granted permission.'
        );
      } finally {
        setScanning(false);
      }
    };

    startScanning();

    return () => {
      controlsRef.current?.stop();
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-slate-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="aspect-square w-full bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
        </div>

        <div className="bg-slate-900 px-4 py-3 text-center">
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : (
            <p className="text-sm text-slate-300">
              {scanning ? 'Point your camera at a barcode' : 'Starting camera...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
