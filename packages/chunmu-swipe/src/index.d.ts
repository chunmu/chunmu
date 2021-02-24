import React from 'react';
import Swipe from './Swipe';
import AutoPlaySwipe from './AutoPlay'

export const defaultProps: SwipeProps;

export const autoPlayDefaultProps: AutoPlayProps;

export interface SpringConfig {
  duration: string,
  easeFunction: string,
  delay: string,
}

export type xyKeys = 'x' | 'y' | 'x-reverse' | 'y-reverse';

export interface SwipeProps {
  slideCount?: number,
  animateHeight: boolean,
  animateTransitions: boolean,
  axis: xyKeys,
  disabled: boolean,
  disableLazyLoading: boolean,
  enableMouseEvents: boolean,
  hysteresis: number,
  ignoreNativeScroll: boolean,
  index: number | undefined,
  threshold: number,
  springConfig: SpringConfig,
  resistance: boolean,
  // eslint-disable-next-line
  action: any,
  // eslint-disable-next-line
  onSwitching?: any,
  // eslint-disable-next-line
  onChangeIndex?: (n: number, l: number, params: any) => void,
  onTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void,
  onTouchEnd?: (event: React.TouchEvent<HTMLDivElement>) => void,
  onMouseDown?: (event: SwipeEvent) => void,
  onMouseUp?: (event: SwipeEvent) => void,
  onMouseLeave?: (event: SwipeEvent) => void,
  onMouseMove?: (event: SwipeEvent) => void,
  onScroll?: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void,
  onTransitionEnd?: () => void,
  // eslint-disable-next-line
  containerStyle?: any,
  // eslint-disable-next-line
  slideStyle?: any,
  slideClassName?: string,
  // eslint-disable-next-line
  style?: any,
}

export interface AutoPlayProps {
  autoplay: boolean,
  direction: 'incremental' | 'decremental',
  interval: number,
}

export interface AutoPlaySwipeProps extends SwipeProps {
  autoplay: boolean,
  direction: 'incremental' | 'decremental',
  interval: number,
}

export interface SwipeState {
  displaySameSlide: boolean,
  indexLatest: number,
  isDragging: boolean,
  renderOnlyActive: boolean,
  heightLatest: number,
}

interface OverflowY {
  overflowY?: string,
  overflowX?: string,
}

export interface RotationMatrixXY {
  x: number[],
  y: number[],
}

interface AxisPropertiesRoot {
  [key: string]: OverflowY,
}

interface AxisPropertiesLength {
  [key: string]: 'width' | 'height',
}

export interface MatrixyPageXY {
  pageX: number,
  pageY: number,
}

export interface RotationMatrix {
  [key: string]: RotationMatrixXY,
}

export interface AxisProperties {
  root: AxisPropertiesRoot,
  rotationMatrix: RotationMatrix,
  // eslint-disable-next-line
  flexDirection?: any,
  // eslint-disable-next-line
  transform?: any,
  length: AxisPropertiesLength,
  // eslint-disable-next-line
  scrollPosition?: any,
  // eslint-disable-next-line
  scrollLength?: any,
  // eslint-disable-next-line
  clientLength?: any,
}

export interface SwipeMouseEvent extends React.MouseEvent {
  mouseTouches: MatrixyPageXY[],
  isMouse: boolean,
}
export type SwipeEvent = SwipeMouseEvent & React.TouchEvent<HTMLDivElement>

export interface SwipeEventRes {
  remove: () => void,
}

export interface ContainerStyle {
  height: number| null,
  WebkitFlexDirection: string,
  flexDirection: string,
  WebkitTransition: string,
  transition: string,
  WebkitTransform?: string,
  transform?: string,
}

export default Swipe;
export {
  AutoPlaySwipe
}
