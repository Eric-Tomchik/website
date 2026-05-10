'use client';

import { useEffect, useRef } from 'react';

/**
 * Traps keyboard focus within a container element while active.
 * Returns a ref to attach to the container.
 *
 * - Tab / Shift+Tab cycle through focusable elements inside the container
 * - Focus is moved to the first focusable element on mount
 * - On unmount, focus returns to the previously focused element
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(active = true) {
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusFirst = () => {
      const elements = container.querySelectorAll<HTMLElement>(focusableSelector);
      if (elements.length > 0) {
        elements[0].focus();
      }
    };

    // Small delay to ensure the modal is rendered
    const timerId = setTimeout(focusFirst, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to the element that was focused before the trap
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);

  return containerRef;
}
