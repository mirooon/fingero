import React, { Component } from 'react';
import './App.css';
import Webcam from "react-webcam";
import { socket, connect, sendMsg, closeSocket } from "./ws";
import Button from '@material-ui/core/Button';
import Canvas from './Canvas'


class App extends Component {
  constructor(props) {
    super(props);
    connect();
    this.state = {
      intervalID: null,
    };
    socket.onmessage = msg => {
      console.log(msg);
    };
  }



  startVideo = () => {
    console.log('starting');
    let intervalID = setInterval(() => {
      sendMsg(this.webcam.getScreenshot());
    }, 1000 / 10);
    this.setState({
      intervalID: intervalID,
    });
  };

  stopVideo = () => {
    console.log('stopping');
    closeSocket();
    if (this.state.intervalID) {
      clearInterval(this.state.intervalID);
    }
  };

  render() {
    return (
      <div className="App">
        <br /><br />
        <Button variant="contained" color="primary" onClick={this.startVideo}>Start video</Button>
        <Button variant="contained" color="primary" onClick={this.stopVideo}>Stop video</Button>
        <br /><br /><br />
        <Canvas />
        <br />
        <Webcam
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
