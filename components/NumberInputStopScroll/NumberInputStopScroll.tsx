"use client";

import { useEffect } from "react";

export default function NumberInputStopScroll() {
  useEffect(() => {
    const handleWheel = () => {
      if (
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.type === "number"
      ) {
        document.activeElement.blur();
      }
    };

    document.addEventListener("wheel", handleWheel);
    return () => document.removeEventListener("wheel", handleWheel);
  }, []);

  return null;
}
