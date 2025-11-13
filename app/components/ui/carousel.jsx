"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Carousel({ opts, className, children }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(opts);

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>
    </div>
  );
}

export function CarouselContent({ className, children }) {
  return (
    <div className={cn("flex", className)}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          className: cn("flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%]", child.props.className),
        })
      )}
    </div>
  );
}

export function CarouselItem({ className, children }) {
  return <div className={cn("p-2", className)}>{children}</div>;
}

export function CarouselPrevious({ className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute left-0 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black transition",
        className
      )}
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );
}

export function CarouselNext({ className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute right-0 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black transition",
        className
      )}
    >
      <ChevronRight className="w-6 h-6" />
    </button>
  );
}
