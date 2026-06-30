import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Keyboard, Camera, AlertTriangle, Check } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
};

const MIN_BARCODE_LENGTH = 6;
/** How long the green "Detected!" overlay stays up before the modal closes. */
const DETECTED_FLASH_MS = 350;

export function BarcodeScannerModal({ isOpen, onClose, onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualValue, setManualValue] = useState('');
  const [detected, setDetected] = useState(false);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  const submittedRef = useRef(false);

  useBodyScrollLock(isOpen);

  // Keep refs in sync without retriggering camera on every parent re-render.
  useEffect(() => {
    onScanRef.current = onScan;
    onCloseRef.current = onClose;
  }, [onScan, onClose]);

  // Reset state when reopened.
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setScanning(false);
    setCameraReady(false);
    setManualValue('');
    setMode('camera');
    setDetected(false);
    submittedRef.current = false;
  }, [isOpen]);

  /**
   * Confirms a successful read with a brief green "Detected!" flash and a
   * haptic tap so the user knows the scan registered, *then* fires the
   * callback. Without this the user gets no feedback between the scan
   * and a slow downstream lookup.
   */
  const finalizeScan = useCallback((code: string) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    controlsRef.current?.stop();
    controlsRef.current = null;
    setDetected(true);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        (navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean })
          .vibrate?.(50);
      } catch {
        // Some browsers throw on vibrate() in insecure contexts; ignore.
      }
    }
    setTimeout(() => {
      onScanRef.current(code);
      onCloseRef.current();
    }, DETECTED_FLASH_MS);
  }, []);

  // Start the camera reader. Falls back to manual mode automatically on failure.
  // Note: previously this called getUserMedia() once as a "probe" and then
  // again inside decodeFromVideoDevice — iOS Safari sometimes refuses the
  // second acquisition, leaving the modal stuck on "Starting camera…".
  // We now let zxing acquire the camera directly and surface its errors.
  useEffect(() => {
    if (!isOpen || mode !== 'camera') return;

    let cancelled = false;
    const startScanning = async () => {
      if (!videoRef.current) return;
      try {
        setError(null);
        setScanning(true);

        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (!result) return;
            const code = result.getText();
            if (code && code.length >= MIN_BARCODE_LENGTH) {
              finalizeScan(code);
            }
          },
        );
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setCameraReady(true);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg || 'Could not access camera.');
        setMode('manual');
        // Focus the manual input on the next tick so the user can scan/type.
        setTimeout(() => manualInputRef.current?.focus(), 50);
      } finally {
        if (!cancelled) setScanning(false);
      }
    };

    startScanning();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [isOpen, mode, finalizeScan]);

  const submitManual = useCallback(
    (raw: string) => {
      const code = raw.trim();
      if (code.length < MIN_BARCODE_LENGTH) return;
      finalizeScan(code);
    },
    [finalizeScan],
  );

  // Listen for fast typing from a USB barcode scanner anywhere in the modal.
  useEffect(() => {
    if (!isOpen) return;
    let buffer = '';
    let lastTime = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      const now = performance.now();
      if (now - lastTime > 80) buffer = '';
      lastTime = now;
      if (e.key === 'Enter') {
        if (buffer.length >= MIN_BARCODE_LENGTH) {
          e.preventDefault();
          submitManual(buffer);
        }
        buffer = '';
        return;
      }
      if (e.key.length === 1) buffer += e.key;
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, submitManual]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors touch-manipulation"
          aria-label="Close scanner"
        >
          <X className="w-5 h-5" />
        </button>

        {detected && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-emerald-500/85 text-white pointer-events-none animate-pulse"
            role="status"
            aria-live="polite"
          >
            <div className="rounded-full bg-white/20 p-4 mb-2">
              <Check className="w-10 h-10" strokeWidth={3} />
            </div>
            <p className="text-lg font-semibold">Detected!</p>
          </div>
        )}

        {mode === 'camera' && (
          <>
            <div className="aspect-square w-full bg-black relative">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted
              />
              {!cameraReady && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2">
                  <Camera className="w-8 h-8 animate-pulse" />
                  <p className="text-sm">{scanning ? 'Starting camera…' : 'Loading…'}</p>
                </div>
              )}
              {cameraReady && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-1/3 border-2 border-white/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                </div>
              )}
            </div>
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-300">
                {cameraReady ? 'Point your camera at a barcode' : 'Preparing scanner…'}
              </p>
              <button
                type="button"
                onClick={() => {
                  controlsRef.current?.stop();
                  controlsRef.current = null;
                  setMode('manual');
                  setTimeout(() => manualInputRef.current?.focus(), 50);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Keyboard className="w-3.5 h-3.5" />
                Type instead
              </button>
            </div>
          </>
        )}

        {mode === 'manual' && (
          <div className="bg-slate-900 px-5 py-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/15 text-blue-300 flex-shrink-0">
                <Keyboard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-semibold text-base">Enter or scan barcode</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type a barcode and press Enter, or use a USB barcode scanner.
                </p>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-200 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Camera unavailable: {error}. You can still scan with a USB scanner or type the
                  barcode manually.
                </p>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitManual(manualValue);
              }}
              className="flex gap-2"
            >
              <input
                ref={manualInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                placeholder="e.g. 0123456789012"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-sm font-mono tracking-wide"
              />
              <button
                type="submit"
                disabled={manualValue.trim().length < MIN_BARCODE_LENGTH}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium"
              >
                Search
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('camera');
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white"
            >
              <Camera className="w-3.5 h-3.5" />
              Try camera again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
