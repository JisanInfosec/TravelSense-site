"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from "lucide-react";
import type { DestinationImage } from "@/lib/types";
import { cn, sizedImage } from "@/lib/utils";

export function Gallery({ images, name }: { images: DestinationImage[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  const go = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  if (!images.length) {
    return (
      <div className="grid aspect-[16/7] place-items-center rounded-3xl border border-dashed border-line bg-surface text-center text-muted">
        <div>
          <ImageOff className="mx-auto mb-2 size-8" />
          <p className="text-sm">No photos available yet</p>
        </div>
      </div>
    );
  }

  const [first, ...rest] = images;
  return (
    <>
      {/* Mobile: swipeable carousel */}
      <div className="relative -mx-4 sm:mx-0 md:hidden">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none sm:rounded-3xl"
          onScroll={(e) => {
            const el = e.currentTarget;
            setMobileIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((img, i) => (
            <button key={i} className="aspect-[4/3] w-full shrink-0 snap-center" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sizedImage(img.url, 960)} alt={img.caption ?? `${name} photo ${i + 1}`} className="size-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full bg-white transition-all", i === mobileIndex ? "w-5" : "w-1.5 opacity-60")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: mosaic */}
      <div className={cn("hidden gap-3 md:grid", rest.length ? "h-[30rem] grid-cols-4 grid-rows-2" : "h-[28rem]")}>
        <Tile img={first} name={name} className={rest.length ? "col-span-2 row-span-2" : ""} onClick={() => setOpen(0)} width={1280} />
        {rest.slice(0, 4).map((img, i) => (
          <Tile
            key={i}
            img={img}
            name={name}
            onClick={() => setOpen(i + 1)}
            className={cn(rest.length === 1 && "col-span-2 row-span-2", rest.length === 2 && "col-span-2", rest.length === 3 && i === 2 && "col-span-2")}
            more={i === 3 && images.length > 5 ? images.length - 5 : 0}
          />
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label={`${name} photos`}>
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm text-white/70">
              {open + 1} / {images.length}
            </span>
            <button onClick={() => setOpen(null)} className="rounded-full p-2 hover:bg-white/10" aria-label="Close gallery">
              <X className="size-6" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sizedImage(images[open].url, 1920)} alt={images[open].caption ?? name} className="max-h-full max-w-full rounded-lg object-contain" />
            {images.length > 1 && (
              <>
                <button onClick={() => go(-1)} className="absolute left-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-6" aria-label="Previous photo">
                  <ChevronLeft className="size-6" />
                </button>
                <button onClick={() => go(1)} className="absolute right-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6" aria-label="Next photo">
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>
          {(images[open].caption || images[open].credit) && (
            <p className="px-4 pb-6 text-center text-xs text-white/60">
              {images[open].caption && <span className="mr-2 text-white/85">{images[open].caption}</span>}
              {images[open].credit &&
                (images[open].sourceUrl ? (
                  <a href={images[open].sourceUrl!} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                    Photo: {images[open].credit}
                  </a>
                ) : (
                  <>Photo: {images[open].credit}</>
                ))}
            </p>
          )}
        </div>
      )}
    </>
  );
}

function Tile({
  img,
  name,
  onClick,
  className,
  width = 640,
  more = 0,
}: {
  img: DestinationImage;
  name: string;
  onClick: () => void;
  className?: string;
  width?: number;
  more?: number;
}) {
  return (
    <button onClick={onClick} className={cn("group relative overflow-hidden rounded-2xl bg-leaf", className)} aria-label="Open photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sizedImage(img.url, width)} alt={img.caption ?? name} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      {more > 0 ? (
        <span className="absolute inset-0 grid place-items-center bg-black/45 text-lg font-semibold text-white">+{more} photos</span>
      ) : (
        <Expand className="absolute bottom-3 right-3 size-5 text-white opacity-0 drop-shadow transition group-hover:opacity-100" />
      )}
    </button>
  );
}
