"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export function Reveal({ children, className, delay = 0, duration = 0.8, y = 28 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}

export function RevealGroup({ children, className, stagger = 0.06 }: RevealGroupProps) {
  const items = React.Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ _staggerDelay?: number }>, {
              _staggerDelay: i * stagger,
            })
          : child,
      )}
    </div>
  );
}

interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
  _staggerDelay?: number;
}

export function RevealItem({ children, className, _staggerDelay = 0 }: RevealItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: _staggerDelay, ease }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.8,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const [current, setCurrent] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now();
    const totalMs = duration * 1000;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * value);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {current.toFixed(decimals)}
      {suffix}
    </span>
  );
}
