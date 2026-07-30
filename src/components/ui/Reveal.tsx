"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Apariciones al hacer scroll. Antes cada Reveal/RevealItem era un componente
 * de framer-motion con su propio useInView: en /catalogo, con ~70 tarjetas,
 * eso son ~70 componentes animados por JS y ~70 observadores. Ahora la
 * animación la hace CSS y un único IntersectionObserver compartido decide
 * cuándo añadir la clase — mismo resultado visual, mismas props, sin
 * framer-motion en las páginas que solo usan esto.
 *
 * La animación se define en globals.css (.reveal / .reveal-in) y queda
 * desactivada automáticamente con prefers-reduced-motion.
 */

type Observed = { el: Element; onEnter: () => void };

let sharedObserver: IntersectionObserver | null = null;
const callbacks = new Map<Element, () => void>();
let visibilityHooked = false;

function inViewport(el: Element) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function release(el: Element) {
  const cb = callbacks.get(el);
  callbacks.delete(el);
  sharedObserver?.unobserve(el);
  cb?.();
}

/**
 * Red de seguridad: una pestaña en segundo plano no ejecuta el ciclo de
 * renderizado, así que IntersectionObserver no entrega nada. Si se ha hecho
 * scroll mientras estaba oculta, al volver el contenido seguiría invisible.
 * Al recuperar visibilidad se recomprueban las posiciones pendientes.
 */
function hookVisibility() {
  if (visibilityHooked) return;
  visibilityHooked = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    for (const el of [...callbacks.keys()]) {
      if (inViewport(el)) release(el);
    }
  });
}

function observe({ el, onEnter }: Observed) {
  if (typeof IntersectionObserver === "undefined") {
    onEnter();
    return () => {};
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) release(entry.target);
        }
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.01 }
    );
  }
  callbacks.set(el, onEnter);
  sharedObserver.observe(el);
  hookVisibility();
  return () => {
    callbacks.delete(el);
    sharedObserver?.unobserve(el);
  };
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    // Si ya está en pantalla al montar (contenido sobre el pliegue), no esperes
    if (inViewport(el)) {
      setShown(true);
      return;
    }
    return observe({ el, onEnter: () => setShown(true) });
  }, [shown]);

  return { ref, shown };
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export function Reveal({ children, className, delay = 0, duration = 0.8, y = 28 }: RevealProps) {
  const { ref, shown } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal${shown ? " reveal-in" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-duration": `${duration}s`,
          "--reveal-y": `${y}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
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
  const { ref, shown } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal${shown ? " reveal-in" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--reveal-delay": `${_staggerDelay}s`,
          "--reveal-duration": "0.65s",
          "--reveal-y": "20px",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
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
  const [current, setCurrent] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || startedRef.current) return;

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      // Quien pide menos movimiento ve la cifra final directamente
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCurrent(value);
        return;
      }

      const startTime = performance.now();
      const totalMs = duration * 1000;
      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / totalMs, 1);
        setCurrent((1 - Math.pow(1 - progress, 3)) * value);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (inViewport(el)) {
      run();
      return;
    }
    return observe({ el, onEnter: run });
  }, [value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {current.toFixed(decimals)}
      {suffix}
    </span>
  );
}
