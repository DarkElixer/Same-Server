import { useEffect, useState } from "react";

export function useScrollDirection({ threshold = 10, collapseThreshold = 40 } = {}) {
  const [scrollDirection, setScrollDirection] = useState("up");
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDir = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > collapseThreshold);

      if (Math.abs(currentScrollY - lastScrollY) >= threshold) {
        if (currentScrollY > lastScrollY && currentScrollY > collapseThreshold) {
          setScrollDirection("down");
        } else if (currentScrollY < lastScrollY) {
          setScrollDirection("up");
        }
        lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
      }
      setScrollY(currentScrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, collapseThreshold]);

  return { scrollDirection, isScrolled, scrollY };
}
