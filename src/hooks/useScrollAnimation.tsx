import { useEffect, useRef, useState, RefObject } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: ScrollAnimationOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.15, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref as RefObject<T>, isVisible];
}

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-left' | 'slide-right';
}

export function ScrollReveal({ children, className = '', delay = 0, animation = 'fade-up' }: ScrollAnimationProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>();

  const animationStyles: Record<string, { hidden: string; visible: string }> = {
    'fade-up': {
      hidden: 'opacity-0 translate-y-8',
      visible: 'opacity-100 translate-y-0',
    },
    'fade-in': {
      hidden: 'opacity-0',
      visible: 'opacity-100',
    },
    'scale-in': {
      hidden: 'opacity-0 scale-95',
      visible: 'opacity-100 scale-100',
    },
    'slide-left': {
      hidden: 'opacity-0 -translate-x-8',
      visible: 'opacity-100 translate-x-0',
    },
    'slide-right': {
      hidden: 'opacity-0 translate-x-8',
      visible: 'opacity-100 translate-x-0',
    },
  };

  const anim = animationStyles[animation] || animationStyles['fade-up'];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? anim.visible : anim.hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
