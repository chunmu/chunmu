import React from 'react';
import Swipe, { defaultProps, AutoPlaySwipe, autoPlayDefaultProps } from 'chunmu-swipe';
import './App.css';

const styles = {
  slide: {
    padding: 15,
    minHeight: 100,
    color: '#fff',
  },
  slide1: {
    backgroundColor: '#FEA900',
  },
  slide2: {
    backgroundColor: '#B3DC4A',
  },
  slide3: {
    backgroundColor: '#6AC0FF',
  },
};

function App() {
  return (
    <div className="App">
      <AutoPlaySwipe {...{
        ...defaultProps,
        ...autoPlayDefaultProps,
        slideCount: 3,
        enableMouseEvents: true
      }}>
        <div style={Object.assign({}, styles.slide, styles.slide1)}>slide n°1</div>
        <div style={Object.assign({}, styles.slide, styles.slide2)}>slide n°2</div>
        <div style={Object.assign({}, styles.slide, styles.slide3)}>slide n°3</div>
      </AutoPlaySwipe>
    </div>
  );
}

export default App;
