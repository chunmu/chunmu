import React from 'react';

export interface SwipeProps {
  axis: string;
}


class Swipe extends React.Component {
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

  constructor(props: SwipeProps) {
    super(props);

  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default Swipe;