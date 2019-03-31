import React, { Component } from 'react';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBriefcase } from '@fortawesome/free-solid-svg-icons'
import Webcam from "react-webcam";
import { connect, sendMsg } from "./ws";
library.add(faBriefcase)

class App extends Component {
  constructor(props) {
    super(props);
    connect();
  }

  stream = () => {
    setInterval(() => {
      sendMsg(this.webcam.getScreenshot());
    }, 1000 / 10);
  };

  render() {
    return (
      <div className="App">
        <FontAwesomeIcon icon="briefcase" />
        <p>Work in progress</p>
        <Webcam
          onUserMedia={this.stream}
          ref={webcam => this.webcam = webcam}
          screenshotFormat="image/png"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user"
          }}
        />
      </div>
    );
  }
}

export default App;
