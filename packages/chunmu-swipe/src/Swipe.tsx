import React from 'react';

export interface SwipeProps {
  children: React.ReactChildren
}


class Swipe extends React.Component<SwipeProps> {
  rootNode: Element | null = null;

  containerNode: Element | null = null;

  ignoreNextScrollEvents = false;

  viewLength = 0;

  startX = 0;

  lastX = 0;

  vx = 0;

  startY = 0;

  isSwiping = undefined;

  started = false;

  startIndex = 0;

  transitionListener = null;

  touchMoveListener = null;

  activeSlide = null;

  indexCurrent = null;

  firstRenderTimeout = null;

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default Swipe;