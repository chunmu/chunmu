import React from 'react';
import warning from 'warning';
import { kNoop } from 'chunmu-base';
import { axisProperties, RESISTANCE_COEF } from './constants';
import { SpringConfig, SwipeEvent, MatrixyPageXY, RotationMatrixXY } from './index.d';

// eslint-disable-next-line
export function addEventListener(node: HTMLElement | null, event: string, handler: any, options?: any) {
  if (node === null) {
    return {
      remove: kNoop
    }
  }
  node.addEventListener(event, handler, options);
  // node.addEventListener(event, handler, options);
  return {
    remove() {
      node.removeEventListener(event, handler, options);
    },
  };
}

/**
 * @desc 获取
*/
export function mod(n: number, m: number): number {
  const q = n % m;
  return q < 0 ? q + m : q;
}

// eslint-disable-next-line
export function getDisplaySameSlide (props: any, nextProps: any) {
  let displaySameSlide = false;
  const getChildrenKey = (child: React.ReactElement) => (child ? child.key : 'empty');

  if (props.children.length && nextProps.children.length) {
    const oldKeys = React.Children.map(props.children, getChildrenKey);
    const oldKey = oldKeys[props.index];

    if (oldKey !== null && oldKey !== undefined) {
      const newKeys = React.Children.map(nextProps.children, getChildrenKey);
      const newKey = newKeys[nextProps.index];

      if (oldKey === newKey) {
        displaySameSlide = true;
      }
    }
  }

  return displaySameSlide;
}

// eslint-disable-next-line
export function computeIndex(params: any) {
  const { children, startIndex, startX, pageX, viewLength, resistance } = params;

  const indexMax = React.Children.count(children) - 1;
  let index = startIndex + (startX - pageX) / viewLength;
  let newStartX;

  if (!resistance) {
    // Reset the starting point
    if (index < 0) {
      index = 0;
      newStartX = (index - startIndex) * viewLength + pageX;
    } else if (index > indexMax) {
      index = indexMax;
      newStartX = (index - startIndex) * viewLength + pageX;
    }
  } else if (index < 0) {
    index = Math.exp(index * RESISTANCE_COEF) - 1;
  } else if (index > indexMax) {
    index = indexMax + 1 - Math.exp((indexMax - index) * RESISTANCE_COEF);
  }

  return {
    index,
    startX: newStartX,
  };
}


// eslint-disable-next-line
export function checkIndexBounds (props: any) {
  const { index, children } = props;

  const childrenCount = React.Children.count(children);

  warning(
    index >= 0 && index <= childrenCount,
    `react-swipeable-view: the new index: ${index} is out of bounds: [0-${childrenCount}].`,
  );
}

// 构建动画描述
export function createTransition(property: string, options: SpringConfig) {
  const { duration, easeFunction, delay } = options;

  return `${property} ${duration} ${easeFunction} ${delay}`;
}

export function applyRotationMatrix(touch: MatrixyPageXY, axis: string) {
  const rotationMatrix: RotationMatrixXY = axisProperties.rotationMatrix[axis];

  return {
    pageX: rotationMatrix.x[0] * touch.pageX + rotationMatrix.x[1] * touch.pageY,
    pageY: rotationMatrix.y[0] * touch.pageX + rotationMatrix.y[1] * touch.pageY,
  };
}

export function adaptMouse(event: SwipeEvent): SwipeEvent {
  event.touches = [{ pageX: event.pageX, pageY: event.pageY }];
  return event;
}

export function getDomTreeShapes(element: HTMLElement, rootNode: HTMLElement) {
  let domTreeShapes = [];

  while (element && element !== rootNode && element !== document.body) {
    // We reach a Swipeable View, no need to look higher in the dom tree.
    if (element.hasAttribute('data-swipeable')) {
      break;
    }

    const style = window.getComputedStyle(element);

    if (
      // Ignore the scroll children if the element is absolute positioned.
      style.getPropertyValue('position') === 'absolute' ||
      // Ignore the scroll children if the element has an overflowX hidden
      style.getPropertyValue('overflow-x') === 'hidden'
    ) {
      domTreeShapes = [];
    } else if (
      (element.clientWidth > 0 && element.scrollWidth > element.clientWidth) ||
      (element.clientHeight > 0 && element.scrollHeight > element.clientHeight)
    ) {
      // Ignore the nodes that have no width.
      // Keep elements with a scroll
      domTreeShapes.push({
        element,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
      });
    }

    element = element.parentNode as HTMLElement;
  }

  return domTreeShapes;
}
