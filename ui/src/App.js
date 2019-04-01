import React, { Component } from 'react';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBriefcase } from '@fortawesome/free-solid-svg-icons'
import Webcam from "react-webcam";
import { connect, sendMsg, closeSocket } from "./ws";
import Button from '@material-ui/core/Button';


class App extends Component {
  constructor(props) {
    super(props);
    connect();
    library.add(faBriefcase)
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
        <Button variant="contained" color="primary" onClick={closeSocket}>
          Stop video
        </Button>
        <Webcam
          onUserMedia={this.stream}
          ref={webcam => this.webcam = webcam}
          screenshotFormat="image/png"
          width={960}
          height={540}
        />
      </div>
    );
  }
}

export default App;
