import React from 'react';
import Swipe from './Swipe';
import { mod } from './util';
import { AutoPlaySwipeProps } from './index.d'

export default class AutoPlaySwipe extends React.Component<AutoPlaySwipeProps, { index: number }> {
  // eslint-disable-next-line
  timer: any = null;

  constructor(props: AutoPlaySwipeProps) {
    super(props);

    this.state = {
      index: props.index || 0,
    };
  }


  componentDidMount() {
    this.startInterval();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: AutoPlaySwipeProps) {
    const { index } = nextProps;

    if (typeof index === 'number' && index !== this.props.index) {
      this.setState({
        index,
      });
    }
  }

  componentDidUpdate(p: AutoPlaySwipeProps) {
    if (
      p.index !== this.props.index ||
      p.interval !== this.props.interval ||
      p.autoplay !== this.props.autoplay) {
      this.startInterval();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  handleInterval = () => {
    
    const { children, direction, onChangeIndex, slideCount } = this.props;

    const indexLatest = this.state.index;
    let indexNew = indexLatest;

    if (direction === 'incremental') {
      indexNew += 1;
    } else {
      indexNew -= 1;
    }
    console.log(indexNew, 'indexNew', indexLatest)
    if (slideCount || children) {
      indexNew = mod(indexNew, slideCount || React.Children.count(children));
    }

    // Is uncontrolled
    if (this.props.index === undefined) {
      this.setState({
        index: indexNew,
      });
    }

    if (onChangeIndex) {
      onChangeIndex(indexNew, indexLatest, {});
    }
  };

  // eslint-disable-next-line
  handleChangeIndex = (index: number, indexLatest: number, meta: any) => {
    // Is uncontrolled
    if (this.props.index === undefined) {
      this.setState({
        index,
      });
    }

    if (this.props.onChangeIndex) {
      this.props.onChangeIndex(index, indexLatest, meta);
    }
  };

  handleSwitching = (index: number, type: string) => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    } else if (type === 'end') {
      this.startInterval();
    }

    if (this.props.onSwitching) {
      this.props.onSwitching(index, type);
    }
  };

  // eslint-disable-next-line
  handleVisibilityChange = (e: any) => {
    if (e && e.target && e.target.hidden) {
      clearInterval(this.timer);
    } else {
      this.startInterval();
    }
  };

  startInterval() {
    const { autoplay, interval } = this.props;

    clearInterval(this.timer);

    if (autoplay) {
      this.timer = setInterval(this.handleInterval, interval);
    }
  }

  render() {
    const {
      autoplay,
      // eslint-disable-next-line
      index: indexProp,
      onChangeIndex,
      // eslint-disable-next-line
      onSwitching: onSwitchingProp,
      ...other
    } = this.props;

    const { index } = this.state;

    if (!autoplay) {
      return <Swipe index={index} onChangeIndex={onChangeIndex} {...other} />;
    }

    return (
      <Swipe
        index={index}
        onChangeIndex={this.handleChangeIndex}
        onSwitching={this.handleSwitching}
        {...other}
      />
    );
  }
}
