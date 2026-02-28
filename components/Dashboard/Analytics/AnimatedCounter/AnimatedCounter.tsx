"use client";

import { useEffect, useState } from "react";

export const AnimatedCounter = ({
  value,
  prefix = "",
  duration = 1.5,
  className = "",
}: {
  value: string | number;
  prefix?: string;
  duration?: number;
  className?: string;
}) => {
  const [count, setCount] = useState(0);
  const numericValue =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Easing function for smooth deceleration
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
      setCount(numericValue * easeOutQuart(progress));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [numericValue, duration]);
  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
};

export const AnimatedInteger = ({
  value,
  duration = 1.5,
  className = "",
}: {
  value: number;
  duration?: number;
  className?: string;
}) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
      setCount(Math.floor(value * easeOutQuart(progress)));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  return <span className={className}>{count}</span>;
};
