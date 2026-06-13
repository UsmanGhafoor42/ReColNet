"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type BeforeAfterSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  altBefore: string;
  altAfter: string;
  variant?: "default" | "hero" | "compact";
};

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  altBefore,
  altAfter,
  variant = "default",
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

  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "mx-auto w-full",
        !isCompact && "premium-card p-3 sm:p-4",
        isHero && "max-w-none",
        !isHero && !isCompact && "max-w-3xl"
      )}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative mx-auto w-full overflow-hidden rounded-2xl bg-neutral-100 select-none dark:bg-neutral-900",
          isHero ? "aspect-[4/3] max-h-[520px]" : isCompact ? "aspect-video" : "aspect-[4/3] max-w-2xl"
        )}
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
        <Image
          src={afterSrc}
          alt={altAfter}
          fill
          priority={isHero}
          className="pointer-events-none object-cover object-center"
          draggable={false}
          sizes="(min-width: 1024px) 560px, 90vw"
        />

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
            sizes="(min-width: 1024px) 560px, 90vw"
          />
        </div>

        <div
          className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-white/90"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div
            className={cn(
              "absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-md transition-transform",
              isDragging && "scale-110"
            )}
          />
        </div>

        {!isCompact && (
          <>
            <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
              Before
            </span>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
              After
            </span>
          </>
        )}
      </div>
    </div>
  );
}
