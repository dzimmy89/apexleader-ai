"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

interface SignaturePadProps {
  value: string | null;
  onChange: (dataUri: string | null) => void;
}

const INK = "#1a1814";

function prepare(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width * ratio));
  canvas.height = Math.max(1, Math.round(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = INK;
}

// Canvas-based signature capture with mouse, touch, and stylus support
// via Pointer Events. Keyboard-only users fall back to typing their name
// on the parent form (the typed name is always required regardless).
export function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(Boolean(value));

  // Size the canvas once for the screen's pixel ratio. Resizing a canvas
  // wipes it, so this never re-runs on a value change (which used to erase
  // the signature the moment the first stroke was saved).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    prepare(canvas);
  }, []);

  useEffect(() => {
    if (!value) setHasInk(false);
  }, [value]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const point = getPoint(e);
    const last = lastPointRef.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    lastPointRef.current = point;
    if (!hasInk) setHasInk(true);
  }

  function handlePointerUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function handleClear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    onChange(null);
    setHasInk(false);
  }

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="h-44 w-full touch-none border border-[var(--color-border-strong-on-parchment)] bg-white"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Signature drawing area"
          role="img"
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-[family-name:var(--font-ui)] text-[15px] text-muted-on-parchment">
            Sign here with your mouse, finger or stylus
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="field-hint">Optional. Your typed name is your signature either way.</p>
        <button type="button" onClick={handleClear} className="btn btn-ghost btn-sm">
          <Eraser size={14} aria-hidden /> Clear
        </button>
      </div>
    </div>
  );
}
