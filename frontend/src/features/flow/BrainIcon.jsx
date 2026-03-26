import { forwardRef, useImperativeHandle } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';

const createMicroTilt = (duration) => ({
  normal: { rotate: 0, scale: 1 },
  animate: {
    rotate: [0, -2.2, 1.2, 0],
    scale: [1, 1.015, 1],
    transition: {
      duration: 0.7 * duration,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 0.2 * duration,
    },
  },
});

const createSpinePulse = (duration) => ({
  normal: { pathLength: 1, opacity: 1 },
  animate: {
    pathLength: [0, 1],
    opacity: [0.55, 1],
    transition: {
      duration: 0.5 * duration,
      ease: 'easeInOut',
      delay: 0.06,
      repeat: Infinity,
      repeatDelay: 0.4 * duration,
      repeatType: 'loop',
    },
  },
});

const createLobeBreatheA = (duration) => ({
  normal: { pathLength: 1, opacity: 1, scale: 1 },
  animate: {
    pathLength: [0, 1],
    opacity: [0.6, 1],
    scale: [0.98, 1.02, 1],
    transition: {
      duration: 0.6 * duration,
      ease: 'easeInOut',
      delay: 0.12,
      repeat: Infinity,
      repeatDelay: 0.3 * duration,
      repeatType: 'loop',
    },
  },
});

const createLobeBreatheB = (duration) => ({
  normal: { pathLength: 1, opacity: 1, scale: 1 },
  animate: {
    pathLength: [0, 1],
    opacity: [0.6, 1],
    scale: [1.02, 0.98, 1],
    transition: {
      duration: 0.62 * duration,
      ease: 'easeInOut',
      delay: 0.18,
      repeat: Infinity,
      repeatDelay: 0.28 * duration,
      repeatType: 'loop',
    },
  },
});

const createSynapseSpark = (duration, delay) => ({
  normal: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1, 0],
    transition: {
      duration: 0.55 * duration,
      ease: 'easeInOut',
      delay,
      repeat: Infinity,
      repeatDelay: 0.6 * duration,
      repeatType: 'loop',
    },
  },
});

const MotionSpan = motion.span;
const MotionSvg = motion.svg;
const MotionGroup = motion.g;
const MotionPath = motion.path;

const BrainIcon = forwardRef(function BrainIcon(
  {
    size = 16,
    duration = 1,
    isAnimated = false,
    className,
    onMouseEnter,
    onMouseLeave,
    ...props
  },
  ref
) {
  const groupControls = useAnimationControls();
  const pulseControls = useAnimationControls();
  const sparkControlsL = useAnimationControls();
  const sparkControlsR = useAnimationControls();
  const reducedMotion = useReducedMotion();

  const startAnimation = () => {
    if (reducedMotion) {
      groupControls.start('normal');
      pulseControls.start('normal');
      sparkControlsL.start('normal');
      sparkControlsR.start('normal');
      return;
    }

    groupControls.start('animate');
    pulseControls.start('animate');
    sparkControlsL.start('animate');
    sparkControlsR.start('animate');
  };

  const stopAnimation = () => {
    groupControls.start('normal');
    pulseControls.start('normal');
    sparkControlsL.start('normal');
    sparkControlsR.start('normal');
  };

  useImperativeHandle(ref, () => ({
    startAnimation,
    stopAnimation,
  }));

  const handleMouseEnter = (event) => {
    if (!isAnimated) {
      startAnimation();
    }
    onMouseEnter?.(event);
  };

  const handleMouseLeave = (event) => {
    if (!isAnimated) {
      stopAnimation();
    }
    onMouseLeave?.(event);
  };

  const currentState = isAnimated && !reducedMotion ? 'animate' : 'normal';

  return (
    <MotionSpan
      className={className}
      initial={false}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <MotionSvg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-brain-icon lucide-brain"
      >
        <MotionGroup
          variants={createMicroTilt(duration)}
          initial="normal"
          animate={isAnimated ? currentState : groupControls}
        >
          <MotionPath
            d="M12 18V5"
            variants={createSpinePulse(duration)}
            initial="normal"
            animate={isAnimated ? currentState : pulseControls}
          />

          <MotionPath
            d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"
            variants={createLobeBreatheA(duration)}
            initial="normal"
            animate={isAnimated ? currentState : groupControls}
          />
          <MotionPath
            d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"
            variants={createLobeBreatheB(duration)}
            initial="normal"
            animate={isAnimated ? currentState : groupControls}
          />

          <MotionPath
            d="M17.997 5.125a4 4 0 0 1 2.526 5.77"
            variants={createLobeBreatheA(duration)}
            initial="normal"
            animate={isAnimated ? currentState : groupControls}
          />
          <MotionPath
            d="M18 18a4 4 0 0 0 2-7.464"
            variants={createLobeBreatheB(duration)}
            initial="normal"
            animate={isAnimated ? currentState : groupControls}
          />
          <MotionPath
            d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"
            variants={createLobeBreatheA(duration)}
            initial="normal"
            animate={isAnimated ? currentState : groupControls}
          />
          <MotionPath
            d="M6 18a4 4 0 0 1-2-7.464"
            variants={createLobeBreatheB(duration)}
            initial="normal"
            animate={isAnimated ? currentState : groupControls}
          />
          <MotionPath
            d="M6.003 5.125a4 4 0 0 0-2.526 5.77"
            variants={createLobeBreatheA(duration)}
            initial="normal"
            animate={isAnimated ? currentState : groupControls}
          />

          <MotionPath
            d="M8.5 11.6 10.2 10.4"
            stroke="currentColor"
            strokeWidth="1.4"
            variants={createSynapseSpark(duration, 0.26)}
            initial="normal"
            animate={isAnimated ? currentState : sparkControlsL}
          />
          <MotionPath
            d="M13.8 9.4 15.6 10.7"
            stroke="currentColor"
            strokeWidth="1.4"
            variants={createSynapseSpark(duration, 0.34)}
            initial="normal"
            animate={isAnimated ? currentState : sparkControlsR}
          />
        </MotionGroup>
      </MotionSvg>
    </MotionSpan>
  );
});

export default BrainIcon;
