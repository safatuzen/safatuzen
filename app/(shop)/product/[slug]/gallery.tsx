"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toBn } from "@/lib/utils";

export function Gallery({ images, name }: { images: { url: string }[]; name: string }) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl border border-hairline bg-gradient-to-br from-blush to-[#f6d3e2]">
        <span className="font-bserif text-8xl font-bold text-primary/50">{name.trim().charAt(0)}</span>
      </div>
    );
  }

  function prev() {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-3">
      {/* Main Preview */}
      <div className="group relative aspect-square overflow-hidden rounded-3xl border border-hairline bg-surface shadow-soft">
        <Image
          src={images[index].url}
          alt={`${name} — ছবি ${index + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 520px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Counter Badge */}
        <span className="absolute bottom-3 left-3 rounded-full bg-ink/75 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {toBn(index + 1)} / {toBn(images.length)}
        </span>

        {/* Prev / Next Controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="পূর্ববর্তী ছবি"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-ink shadow-soft transition-transform hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="পরবর্তী ছবি"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-ink shadow-soft transition-transform hover:scale-110 active:scale-95"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`ছবি ${i + 1} নির্বাচন করুন`}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                i === index
                  ? "border-primary shadow-soft scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
