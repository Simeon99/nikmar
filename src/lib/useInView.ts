"use client";

import { useEffect, useRef, useState } from "react";

/**
 * true kad element prvi put uđe u ekran (IntersectionObserver, threshold 0.25,
 * kao u dizajnu). Posle toga ostaje true.
 */
export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, threshold]);

  return [ref, inView] as const;
}
