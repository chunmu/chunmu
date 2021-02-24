import { SwipeProps, AxisProperties, AutoPlayProps } from './index.d'

export const RESISTANCE_COEF = 0.5;
export const UNCERTAINTY_THRESHOLD = 3;

export const defaultProps: SwipeProps = {
  animateHeight: false,
  animateTransitions: true,
  axis: 'x',
  disabled: false,
  disableLazyLoading: false,
  enableMouseEvents: false,
  hysteresis: 0.6,
  ignoreNativeScroll: false,
  index: undefined,
  threshold: 5,
  springConfig: {
    duration: '0.35s',
    easeFunction: 'cubic-bezier(0.15, 0.3, 0.25, 1)',
    delay: '0s',
  },
  resistance: false,
  action: undefined,
  onSwitching: undefined,
}

export const styles = {
  container: {
    direction: 'ltr',
    display: 'flex',
    willChange: 'transform',
  },
  slide: {
    width: '100%',
    WebkitFlexShrink: 0,
    flexShrink: 0,
    overflow: 'auto',
  },
};

export const autoPlayDefaultProps: AutoPlayProps = {
  autoplay: true,
  direction: 'incremental',
  interval: 3000,
}

export const axisProperties: AxisProperties = {
  root: {
    x: {
      overflowX: 'hidden',
    },
    'x-reverse': {
      overflowX: 'hidden',
    },
    y: {
      overflowY: 'hidden',
    },
    'y-reverse': {
      overflowY: 'hidden',
    },
  },
  flexDirection: {
    x: 'row',
    'x-reverse': 'row-reverse',
    y: 'column',
    'y-reverse': 'column-reverse',
  },
  transform: {
    x: (translate: string) => `translate(${-translate}%, 0)`,
    'x-reverse': (translate: string) => `translate(${translate}%, 0)`,
    y: (translate: string) => `translate(0, ${-translate}%)`,
    'y-reverse': (translate: string) => `translate(0, ${translate}%)`,
  },
  length: {
    x: 'width',
    'x-reverse': 'width',
    y: 'height',
    'y-reverse': 'height',
  },
  rotationMatrix: {
    x: {
      x: [1, 0],
      y: [0, 1],
    },
    'x-reverse': {
      x: [-1, 0],
      y: [0, 1],
    },
    y: {
      x: [0, 1],
      y: [1, 0],
    },
    'y-reverse': {
      x: [0, -1],
      y: [1, 0],
    },
  },
  scrollPosition: {
    x: 'scrollLeft',
    'x-reverse': 'scrollLeft',
    y: 'scrollTop',
    'y-reverse': 'scrollTop',
  },
  scrollLength: {
    x: 'scrollWidth',
    'x-reverse': 'scrollWidth',
    y: 'scrollHeight',
    'y-reverse': 'scrollHeight',
  },
  clientLength: {
    x: 'clientWidth',
    'x-reverse': 'clientWidth',
    y: 'clientHeight',
    'y-reverse': 'clientHeight',
  },
};
