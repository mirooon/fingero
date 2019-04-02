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
      width: 640,
      height: 360,
      point: { x: 0, y: 0, prevX: 0, prevY: 0 },
    };

    socket.onopen = () => {
      console.log("Successfully Connected");
    };
    socket.onmessage = msg => {
      let data = JSON.parse(msg.data);
      this.setState({
        point: {
          prevX: this.state.point.x,
          prevY: this.state.point.y,
          x: data.X,
          y: data.Y,
        }
      });
    };
  }

  startVideo = () => {
    console.log('starting');
    let id = setInterval(() => {
      sendMsg(this.webcam.getScreenshot());
    }, 1000 / 10);
    this.setState({
      intervalID: id,
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
        <Canvas width={this.state.width} height={this.state.height} point={this.state.point} />
        <br />
        <Webcam
          ref={webcam => this.webcam = webcam}
          screenshotFormat="image/png"
          width={this.state.width}
          height={this.state.height}
        />
      </div>
    );
  }
}

export default App;
