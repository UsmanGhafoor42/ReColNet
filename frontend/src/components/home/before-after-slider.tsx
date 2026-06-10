"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

type BeforeAfterSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  altBefore: string;
  altAfter: string;
};

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  altBefore,
  altAfter,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, raw)));
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border/60 bg-muted/30 p-4 shadow-sm sm:p-6">
      <div
        ref={containerRef}
        className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-xl bg-muted/40 select-none"
        onPointerDown={(e) => {
          e.preventDefault();
          updateFromClientX(e.clientX);
          e.currentTarget.setPointerCapture(e.pointerId);
          setIsDragging(true);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            updateFromClientX(e.clientX);
          }
        }}
        onPointerUp={(e) => {
          setIsDragging(false);
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
        onPointerCancel={(e) => {
          setIsDragging(false);
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
        style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "ew-resize" }}
      >
        {/* Colorized — full frame, always aligned */}
        <Image
          src={afterSrc}
          alt={altAfter}
          fill
          priority
          className="pointer-events-none object-cover object-center"
          draggable={false}
          sizes="(min-width: 768px) 672px, 90vw"
        />

        {/* Grayscale — same frame, clipped to left of handle */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={beforeSrc}
            alt={altBefore}
            fill
            className="object-cover object-center"
            draggable={false}
            sizes="(min-width: 768px) 672px, 90vw"
          />
        </div>

        {/* Divider + handle */}
        <div
          className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-white"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div
            className={`absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/95 shadow-md transition-transform ${
              isDragging ? "scale-110" : "scale-100"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
