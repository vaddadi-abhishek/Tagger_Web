import React, { useRef } from 'react';
import {
  motion,
  MotionValue,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import type { HTMLMotionProps, UseScrollOptions } from 'framer-motion';

/* ══════════════════════════════════════════════════════════════════
   21st.dev animated-scroll-gallery (by @youcefbnm)
   https://21st.dev/@youcefbnm/components/animated-gallery/animated-scroll-gallery
══════════════════════════════════════════════════════════════════ */

interface ScrollAnimationRotateContextValue {
  scrollProgress: MotionValue<number>;
}

const ScrollAnimationRotateContext = React.createContext<
  ScrollAnimationRotateContextValue | undefined
>(undefined);

export function useScrollAnimationRotateContext() {
  const context = React.useContext(ScrollAnimationRotateContext);
  if (!context) {
    throw new Error(
      'useScrollAnimationRotateContext must be used within a ScrollAnimationRotate provider',
    );
  }
  return context;
}

interface ScrollAnimationRotateProps {
  spacerClass?: string;
  offset?: UseScrollOptions['offset'];
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const ScrollAnimationRotate = ({
  spacerClass,
  offset = ['start 85%', 'center center'],
  children,
  className,
  style,
}: ScrollAnimationRotateProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 400,
    restDelta: 0.001,
  });

  const reducedMotion = useReducedMotion();
  const scrollProgress = reducedMotion ? scrollYProgress : smoothProgress;

  return (
    <ScrollAnimationRotateContext.Provider value={{ scrollProgress }}>
      <div
        ref={scrollRef}
        className={`relative ${className || ''}`}
        style={{
          perspective: '1200px',
          perspectiveOrigin: 'center top',
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
          ...style,
        }}
      >
        {children}
        {spacerClass !== 'none' && (
          <div className={`w-full ${spacerClass || 'h-16 sm:h-24'}`} />
        )}
      </div>
    </ScrollAnimationRotateContext.Provider>
  );
};
ScrollAnimationRotate.displayName = 'ScrollAnimationRotate';

interface ScrollAnimationRotateContainerProps extends HTMLMotionProps<'div'> {
  yRange?: [number, number];
  rotateRange?: [number, number];
  scaleRange?: [number, number];
  rotationDirection?: 'x' | 'y' | 'z';
}

export const ScrollAnimationRotateContainer = React.forwardRef<
  HTMLDivElement,
  ScrollAnimationRotateContainerProps
>(
  (
    {
      yRange = [0, 120],
      rotateRange = [55, 0],
      scaleRange = [0.88, 1],
      className,
      rotationDirection = 'x',
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { scrollProgress } = useScrollAnimationRotateContext();

    const y = useTransform(scrollProgress, [0, 1], yRange);
    const rotate = useTransform(scrollProgress, [0, 0.55], rotateRange);
    const scale = useTransform(scrollProgress, [0.35, 0.85], scaleRange);
    const transform = useMotionTemplate`rotate${rotationDirection.toUpperCase()}(${rotate}deg) scale(${scale}) translateY(${y}px)`;

    return (
      <motion.div
        ref={ref}
        className={`relative w-full flex justify-center ${className || ''}`}
        style={{
          transform,
          transformOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          ...style,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
ScrollAnimationRotateContainer.displayName = 'ScrollAnimationRotateContainer';

/* ─── High-Level Wireframe Container Wrapper ─── */
interface ContainerScrollProps {
  titleComponent?: React.ReactNode;
  children: React.ReactNode;
}

export function ContainerScroll({
  titleComponent,
  children,
}: ContainerScrollProps) {
  return (
    <ScrollAnimationRotate
      offset={['start 85%', 'center center']}
      className="w-full flex flex-col items-center px-4 sm:px-8 md:px-12 lg:px-16"
      spacerClass="h-20 sm:h-32"
    >
      {titleComponent && (
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 px-4">
          {titleComponent}
        </div>
      )}

      <ScrollAnimationRotateContainer
        yRange={[-30, 40]}
        rotateRange={[48, 0]}
        scaleRange={[0.86, 1]}
        className="max-w-5xl mx-auto"
      >
        <div
          style={{
            boxShadow:
              '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
          }}
          className="w-full border-4 border-neutral-300/60 dark:border-neutral-700/60 p-2 md:p-3.5 bg-neutral-100 dark:bg-neutral-900 rounded-[30px] shadow-2xl overflow-hidden"
        >
          <div className="h-auto w-full overflow-hidden rounded-2xl bg-white dark:bg-neutral-950 isolate">
            {children}
          </div>
        </div>
      </ScrollAnimationRotateContainer>
    </ScrollAnimationRotate>
  );
}

