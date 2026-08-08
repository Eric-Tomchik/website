'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Animation variant */
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade' | 'scale' | 'blur';
  /** Delay in ms before animation starts */
  delay?: number;
  /** Duration in ms */
  duration?: number;
  /** How much of the element must be visible (0-1) */
  threshold?: number;
  /** Extra CSS classes */
  className?: string;
  /** Animate only once or every time it enters viewport */
  once?: boolean;
}

const animationStyles: Record<string, { hidden: React.CSSProperties; visible: React.CSSProperties }> = {
  'fade-up': {
    hidden: { opacity: 0, transform: 'translateY(30px)' },
    visible: { opacity: 1, transform: 'translateY(0)' },
  },
  'fade-down': {
    hidden: { opacity: 0, transform: 'translateY(-30px)' },
    visible: { opacity: 1, transform: 'translateY(0)' },
  },
  'fade-left': {
    hidden: { opacity: 0, transform: 'translateX(-30px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
  },
  'fade-right': {
    hidden: { opacity: 0, transform: 'translateX(30px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, transform: 'scale(0.95)' },
    visible: { opacity: 1, transform: 'scale(1)' },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(8px)' },
    visible: { opacity: 1, filter: 'blur(0)' },
  },
};

export function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.15,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion — skip animations entirely
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    // `threshold` is a fraction of the ELEMENT, not of the viewport, so an
    // element taller than the viewport can never reach a fraction like 0.15
    // and would stay permanently hidden. Fall back to 0 in that case.
    const effectiveThreshold = el.offsetHeight > window.innerHeight * threshold * 2 ? 0 : threshold;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: effectiveThreshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);

    // Last-resort safety net: never let content stay invisible.
    const failsafe = window.setTimeout(() => setIsVisible(true), 1200);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, [threshold, once]);

  const anim = animationStyles[animation] || animationStyles['fade-up'];
  const style: React.CSSProperties = {
    ...(isVisible ? anim.visible : anim.hidden),
    transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms, filter ${duration}ms ease-out ${delay}ms`,
    willChange: 'opacity, transform',
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}

/** Stagger children with incremental delays */
export function ScrollRevealGroup({
  children,
  animation = 'fade-up',
  stagger = 100,
  duration = 600,
  threshold = 0.1,
  className = '',
  childClassName = '',
}: {
  children: ReactNode[];
  animation?: ScrollRevealProps['animation'];
  stagger?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  childClassName?: string;
}) {
  return (
    <div className={className}>
      {(Array.isArray(children) ? children : [children]).map((child, i) => (
        <ScrollReveal
          key={i}
          animation={animation}
          delay={i * stagger}
          duration={duration}
          threshold={threshold}
          className={childClassName}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
