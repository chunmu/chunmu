import React from 'react';
import warning from 'warning';
import { axisProperties, UNCERTAINTY_THRESHOLD, styles } from './constants';
import {
  addEventListener,
  applyRotationMatrix,
  computeIndex,
  getDomTreeShapes,
  adaptMouse,
  createTransition
} from './util';
import {
  SwipeProps,
  SwipeEventRes,
  SwipeEvent,
  SwipeState,
  ContainerStyle
} from './index.d';

let nodeWhoClaimedTheScroll: null | HTMLElement = null;

class Swipe extends React.Component<SwipeProps, SwipeState> {
  rootNode: null | HTMLElement = null;

  containerNode: null | HTMLElement = null;

  ignoreNextScrollEvents = false;

  viewLength = 0;

  startX = 0;


  lastX = 0;

  vx = 0;

  startY = 0;

  isSwiping: boolean | undefined = undefined;

  started = false;

  startIndex = 0;

  transitionListener: null | SwipeEventRes = null;

  touchMoveListener: null | SwipeEventRes = null;

  activeSlide: null | HTMLElement = null;

  indexCurrent: null | number = null;
  // eslint-disable-next-line
  firstRenderTimeout: any = null;

  constructor(props: SwipeProps) {
    super(props);

    this.state = {
      indexLatest: props.index,
      // Set to true as soon as the component is swiping.
      // It's the state counter part of this.isSwiping.
      isDragging: false,
      // Help with SSR logic and lazy loading logic.
      renderOnlyActive: !props.disableLazyLoading,
      heightLatest: 0,
      // Let the render method that we are going to display the same slide than previously.
      displaySameSlide: true,
    };
    this.setIndexCurrent(props.index);
  }

  getChildContext() {
    return {
      swipeableViews: {
        slideUpdateHeight: () => {
          this.updateHeight();
        },
      },
    };
  }

  componentDidMount() {
    // Subscribe to transition end events.
    if (this.containerNode !== null) {
      this.transitionListener = addEventListener(this.containerNode, 'transitionend', (event: Event) => {
        if (event.target !== this.containerNode) {
          return;
        }
  
        this.handleTransitionEnd();
      });
    }


    // Block the thread to handle that event.
    this.touchMoveListener = addEventListener(
      this.rootNode,
      'touchmove',
      (event: SwipeEvent) => {
        // Handling touch events is disabled.
        if (this.props.disabled) {
          return;
        }
        this.handleSwipeMove(event);
      },
      {
        passive: false,
      },
    );

    if (!this.props.disableLazyLoading) {
      this.firstRenderTimeout = setTimeout(() => {
        this.setState({
          renderOnlyActive: false,
        });
      }, 0);
    }

    // Send all functions in an object if action param is set.
    if (this.props.action) {
      this.props.action({
        updateHeight: this.updateHeight,
      });
    }
  }

  componentWillUnmount() {
    if (this.transitionListener) {
      this.transitionListener.remove()
    }
    if (this.touchMoveListener) {
      this.touchMoveListener.remove()
    }
    clearTimeout(this.firstRenderTimeout);
  }

  setIndexCurrent(indexCurrent: number) {
    if (!this.props.animateTransitions && this.indexCurrent !== indexCurrent) {
      this.handleTransitionEnd();
    }

    this.indexCurrent = indexCurrent;

    if (this.containerNode !== null) {
      const { axis } = this.props;
      const transform = axisProperties.transform[axis](indexCurrent * 100);
      this.containerNode.style.webkitTransform = transform;
      this.containerNode.style.transform = transform;
    }
  }

  setRootNode = (node: HTMLDivElement) => {
    this.rootNode = node;
  };

  setContainerNode = (node: HTMLDivElement) => {
    this.containerNode = node;
  };

  setActiveSlide = (node: HTMLDivElement) => {
    this.activeSlide = node;
    this.updateHeight();
  };

  handleSwipeStart = (event: SwipeEvent) => {
    const { axis } = this.props;
    let touch = null;
    if (event.isMouse) {
      touch = applyRotationMatrix(event.touches[0], axis)
    } else {
      touch = applyRotationMatrix(event.mouseTouches[0], axis)
    }
    
    if (this.rootNode !== null && this.containerNode !== null) {
      const domReact: DOMRect = this.rootNode.getBoundingClientRect();
      const x = axisProperties.length[axis]
      this.viewLength = domReact[x];
      this.startX = touch.pageX;
      this.lastX = touch.pageX;
      this.vx = 0;
      this.startY = touch.pageY;
      this.isSwiping = undefined;
      this.started = true;
  
      const computedStyle = window.getComputedStyle(this.containerNode);
      const transform =
        computedStyle.getPropertyValue('-webkit-transform') ||
        computedStyle.getPropertyValue('transform');
  
      if (transform && transform !== 'none') {
        const transformValues = transform
          .split('(')[1]
          .split(')')[0]
          .split(',');
        const rootStyle = window.getComputedStyle(this.rootNode);
  
        const tranformNormalized = applyRotationMatrix(
          {
            pageX: parseInt(transformValues[4], 10),
            pageY: parseInt(transformValues[5], 10),
          },
          axis,
        );
  
        this.startIndex =
          -tranformNormalized.pageX /
            (this.viewLength -
              parseInt(rootStyle.paddingLeft, 10) -
              parseInt(rootStyle.paddingRight, 10)) || 0;
      }
    }
  };

  handleSwipeMove = (event: SwipeEvent) => {
    // The touch start event can be cancel.
    // Makes sure we set a starting point.
    if (!this.started) {
      this.handleTouchStart(event);
      return;
    }

    // We are not supposed to hanlde this touch move.
    if (nodeWhoClaimedTheScroll !== null && nodeWhoClaimedTheScroll !== this.rootNode) {
      return;
    }

    const { axis, children, ignoreNativeScroll, onSwitching, resistance } = this.props;
    const touch = applyRotationMatrix(event.touches[0], axis);

    // We don't know yet.
    if (this.isSwiping === undefined) {
      const dx = Math.abs(touch.pageX - this.startX);
      const dy = Math.abs(touch.pageY - this.startY);

      const isSwiping = dx > dy && dx > UNCERTAINTY_THRESHOLD;

      // We let the parent handle the scroll.
      if (
        !resistance &&
        (axis === 'y' || axis === 'y-reverse') &&
        ((this.indexCurrent === 0 && this.startX < touch.pageX) ||
          (this.indexCurrent === React.Children.count(this.props.children) - 1 &&
            this.startX > touch.pageX))
      ) {
        this.isSwiping = false;
        return;
      }

      // We are likely to be swiping, let's prevent the scroll event.
      if (dx > dy) {
        event.preventDefault();
      }

      if (isSwiping === true || dy > UNCERTAINTY_THRESHOLD) {
        this.isSwiping = isSwiping;
        this.startX = touch.pageX; // Shift the starting point.

        return; // Let's wait the next touch event to move something.
      }
    }

    if (this.isSwiping !== true) {
      return;
    }

    // We are swiping, let's prevent the scroll event.
    event.preventDefault();

    // Low Pass filter.
    this.vx = this.vx * 0.5 + (touch.pageX - this.lastX) * 0.5;
    this.lastX = touch.pageX;

    const { index, startX } = computeIndex({
      children,
      resistance,
      pageX: touch.pageX,
      startIndex: this.startIndex,
      startX: this.startX,
      viewLength: this.viewLength,
    });

    // Add support for native scroll elements.
    if (nodeWhoClaimedTheScroll === null && !ignoreNativeScroll) {
      const domTreeShapes = getDomTreeShapes(event.target as HTMLElement, this.rootNode as HTMLElement);
      const hasFoundNativeHandler = findNativeHandler({
        domTreeShapes,
        startX: this.startX,
        pageX: touch.pageX,
        axis,
      });

      // We abort the touch move handler.
      if (hasFoundNativeHandler) {
        return;
      }
    }

    // We are moving toward the edges.
    if (startX) {
      this.startX = startX;
    } else if (nodeWhoClaimedTheScroll === null) {
      nodeWhoClaimedTheScroll = this.rootNode;
    }

    this.setIndexCurrent(index);

    const callback = () => {
      if (onSwitching) {
        onSwitching(index, 'move');
      }
    };

    if (this.state.displaySameSlide || !this.state.isDragging) {
      this.setState(
        {
          displaySameSlide: false,
          isDragging: true,
        },
        callback,
      );
    }

    callback();
  };

  handleSwipeEnd = () => {
    nodeWhoClaimedTheScroll = null;

    // The touch start event can be cancel.
    // Makes sure that a starting point is set.
    if (!this.started) {
      return;
    }

    this.started = false;

    if (this.isSwiping !== true) {
      return;
    }

    const indexLatest = this.state.indexLatest;
    const indexCurrent = this.indexCurrent as number;
    const delta = indexLatest - indexCurrent;
    // eslint-disable-next-line
    let indexNew: any;

    // Quick movement
    if (Math.abs(this.vx) > this.props.threshold) {
      if (this.vx > 0) {
        indexNew = Math.floor(indexCurrent);
      } else {
        indexNew = Math.ceil(indexCurrent);
      }
    } else if (Math.abs(delta) > this.props.hysteresis) {
      // Some hysteresis with indexLatest.
      indexNew = delta > 0 ? Math.floor(indexCurrent) : Math.ceil(indexCurrent);
    } else {
      indexNew = indexLatest;
    }

    const indexMax = React.Children.count(this.props.children) - 1;

    if (indexNew < 0) {
      indexNew = 0;
    } else if (indexNew > indexMax) {
      indexNew = indexMax;
    }

    this.setIndexCurrent(indexNew);
    this.setState(
      {
        indexLatest: indexNew,
        isDragging: false,
      },
      () => {
        if (this.props.onSwitching) {
          this.props.onSwitching(indexNew, 'end');
        }

        if (this.props.onChangeIndex && indexNew !== indexLatest) {
          this.props.onChangeIndex(indexNew, indexLatest, {
            reason: 'swipe',
          });
        }

        // Manually calling handleTransitionEnd in that case as isn't otherwise.
        if (indexCurrent === indexLatest) {
          this.handleTransitionEnd();
        }
      },
    );
  };

  handleTouchStart = (event: SwipeEvent) => {
    if (this.props.onTouchStart) {
      this.props.onTouchStart(event);
    }
    this.handleSwipeStart(event);
  };

  handleTouchEnd = (event: SwipeEvent) => {
    if (this.props.onTouchEnd) {
      this.props.onTouchEnd(event);
    }
    this.handleSwipeEnd();
  };

  handleMouseDown = (event: SwipeEvent) => {
    if (this.props.onMouseDown) {
      this.props.onMouseDown(event);
    }
    event.persist();
    this.handleSwipeStart(adaptMouse(event));
  };

  handleMouseUp = (event: SwipeEvent) => {
    if (this.props.onMouseUp) {
      this.props.onMouseUp(event);
    }
    this.handleSwipeEnd();
  };

  handleMouseLeave = (event: SwipeEvent) => {
    if (this.props.onMouseLeave) {
      this.props.onMouseLeave(event);
    }

    // Filter out events
    if (this.started) {
      this.handleSwipeEnd();
    }
  };

  handleMouseMove = (event: SwipeEvent) => {
    if (this.props.onMouseMove) {
      this.props.onMouseMove(event);
    }

    // Filter out events
    if (this.started) {
      this.handleSwipeMove(adaptMouse(event));
    }
  };

  handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (this.props.onScroll) {
      this.props.onScroll(event);
    }

    // Ignore events bubbling up.
    if (event.target !== this.rootNode) {
      return;
    }

    if (this.ignoreNextScrollEvents) {
      this.ignoreNextScrollEvents = false;
      return;
    }

    const indexLatest = this.state.indexLatest;
    const indexNew = Math.ceil((event.target as HTMLElement).scrollLeft / (event.target as HTMLElement).clientWidth) + indexLatest;

    this.ignoreNextScrollEvents = true;
    // Reset the scroll position.
    (event.target as HTMLElement).scrollLeft = 0;

    if (this.props.onChangeIndex && indexNew !== indexLatest) {
      this.props.onChangeIndex(indexNew, indexLatest, {
        reason: 'focus',
      });
    }
  };

  updateHeight = () => {
    if (this.activeSlide !== null) {
      const child = this.activeSlide.children[0] as HTMLElement;
      if (
        child !== undefined &&
        child.offsetHeight !== undefined &&
        this.state.heightLatest !== child.offsetHeight
      ) {
        this.setState({
          heightLatest: child.offsetHeight,
        });
      }
    }
  };

  handleTransitionEnd() {
    if (!this.props.onTransitionEnd) {
      return;
    }

    // Filters out when changing the children
    if (this.state.displaySameSlide) {
      return;
    }

    // The rest callback is triggered when swiping. It's just noise.
    // We filter it out.
    if (!this.state.isDragging) {
      this.props.onTransitionEnd();
    }
  }

  render() {
    const {
      animateHeight,
      animateTransitions,
      axis,
      children,
      containerStyle: containerStyleProp,
      disabled,
      enableMouseEvents,
      slideStyle: slideStyleProp,
      slideClassName,
      springConfig,
      style,
      // ...other
    } = this.props;

    const {
      displaySameSlide,
      heightLatest,
      indexLatest,
      isDragging,
      renderOnlyActive,
    } = this.state;
    const mouseEvents =
      !disabled && enableMouseEvents
        ? {
            onMouseDown: this.handleMouseDown,
            onMouseUp: this.handleMouseUp,
            onMouseLeave: this.handleMouseLeave,
            onMouseMove: this.handleMouseMove,
          }
        : {};

    // There is no point to animate if we are already providing a height.
    warning(
      !animateHeight || !containerStyleProp || !containerStyleProp.height,
      `react-swipeable-view: You are setting animateHeight to true but you are
also providing a custom height.
The custom height has a higher priority than the animateHeight property.
So animateHeight is most likely having no effect at all.`,
    );

    const slideStyle = Object.assign({}, styles.slide, slideStyleProp);

    let transition;
    let WebkitTransition;

    if (isDragging || !animateTransitions || displaySameSlide) {
      transition = 'all 0s ease 0s';
      WebkitTransition = 'all 0s ease 0s';
    } else {
      transition = createTransition('transform', springConfig);
      WebkitTransition = createTransition('-webkit-transform', springConfig);

      if (heightLatest !== 0) {
        const additionalTranstion = `, ${createTransition('height', springConfig)}`;
        transition += additionalTranstion;
        WebkitTransition += additionalTranstion;
      }
    }

    const containerStyle: ContainerStyle = {
      height: null,
      WebkitFlexDirection: axisProperties.flexDirection[axis],
      flexDirection: axisProperties.flexDirection[axis],
      WebkitTransition,
      transition,
    };

    // Apply the styles for SSR considerations
    if (!renderOnlyActive) {
      const transform = axisProperties.transform[axis](this.indexCurrent as number * 100);
      containerStyle.WebkitTransform = transform;
      containerStyle.transform = transform;
    }

    if (animateHeight) {
      containerStyle.height = heightLatest;
    }

    return (
      <div
        ref={this.setRootNode}
        style={Object.assign({}, axisProperties.root[axis], style)}
        onScroll={this.handleScroll}
        onTouchStart={!disabled ? this.handleTouchStart : undefined}
        onTouchEnd={!disabled ? this.handleTouchEnd : undefined}
        onMouseDown={!disabled && enableMouseEvents ? this.handleMouseDown : undefined}
        onMouseMove={!disabled && enableMouseEvents ? this.handleMouseMove : undefined}
        onMouseLeave={!disabled && enableMouseEvents ? this.handleMouseLeave : undefined}
        onMouseUp={!disabled && enableMouseEvents ? this.handleMouseUp : undefined}
        // {...other}
      >
        <div
          ref={this.setContainerNode}
          style={Object.assign({}, containerStyle, styles.container, containerStyleProp)}
          className="react-swipeable-view-container"
        >
          {React.Children.map(children, (child, indexChild) => {
            if (renderOnlyActive && indexChild !== indexLatest) {
              return null;
            }

            warning(
              React.isValidElement(child),
              `react-swipeable-view: one of the children provided is invalid: ${child}.
We are expecting a valid React Element`,
            );

            let ref: ((arg: HTMLDivElement) => void) | undefined;
            let hidden = true;

            if (indexChild === indexLatest) {
              hidden = false;

              if (animateHeight) {
                ref = this.setActiveSlide;
                slideStyle.overflowY = 'hidden';
              }
            }

            return (
              <div
                ref={ref}
                style={slideStyle}
                className={slideClassName}
                aria-hidden={hidden}
                data-swipeable="true"
              >
                {child}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

// eslint-disable-next-line
export function findNativeHandler(params: any) {
  const { domTreeShapes, pageX, startX, axis } = params;
  // eslint-disable-next-line
  return domTreeShapes.some((shape: any) => {
    // Determine if we are going backward or forward.
    let goingForward = pageX >= startX;
    if (axis === 'x' || axis === 'y') {
      goingForward = !goingForward;
    }

    // scrollTop is not always be an integer.
    // https://github.com/jquery/api.jquery.com/issues/608
    const scrollPosition = Math.round(shape[axisProperties.scrollPosition[axis]]);

    const areNotAtStart = scrollPosition > 0;
    const areNotAtEnd =
      scrollPosition + shape[axisProperties.clientLength[axis]] <
      shape[axisProperties.scrollLength[axis]];

    if ((goingForward && areNotAtEnd) || (!goingForward && areNotAtStart)) {
      nodeWhoClaimedTheScroll = shape.element;
      return true;
    }

    return false;
  });
}

export default Swipe;