import React, { Component } from 'react';
import './App.css';
import Webcam from "react-webcam";
import { socket, connect, sendMsg, closeSocket } from "./ws";
import Button from '@material-ui/core/Button';
import Canvas from './Canvas'
import { CirclePicker } from 'react-color';
import Save from './Save';
import Navbar from './Navbar';

class App extends Component {
  constructor(props) {
    super(props);
    connect();
    this.state = {
      intervalID: null,
      width: 640,
      height: 360,
      point: { x: 0, y: 0, prevX: 0, prevY: 0 },
      mode: "pen",
      thickness: 4,
      color: "black"
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

  setEraser = () => {
    console.log("Set eraser")
    this.setState({
      mode: 'eraser'
    });
  }

  setPen = () => {
    console.log("Set pen")
    this.setState({
      mode: 'pen'
    });
  }

  setBrush = () => {
    console.log("Set brush")
    this.setState({
      mode: 'brush'
    })
  }

  thicknessUp = () => {
    console.log("Current thickness: " + this.state.thickness)
    this.setState({
      thickness: this.state.thickness + 1
    });
  }

  thicknessDown = () => {
    console.log("Current thickness: " + this.state.thickness)
    if (this.state.thickness > 0) {
      this.setState({
        thickness: this.state.thickness - 1
      })
    }
  }

  changeColor = (color, event) => {
    console.log("Color changed" + color.hex);
    this.setState({
      color: color.hex
    });
  }

  // download = () => {
  //   var download = document.getElementById("download");
  //   var image = document.getElementById("myCanvas");
  //   console.log(image);
  //   // download.setAttribute("href", image);
  // }

  stopVideo = () => {
    console.log('stopping');
    closeSocket();
    if (this.state.intervalID) {
      clearInterval(this.state.intervalID);
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="App">
          <Navbar />
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-2">
                <br /><br />
                <h3>Tools</h3>
                <br></br>
                <Button variant="contained" color="primary" onClick={this.setEraser}>Eraser</Button>
                <Button variant="contained" color="primary" onClick={this.setPen}>Pencil</Button>
                <Button variant="contained" color="primary" onClick={this.setBrush}>Brush</Button>
                {this.state.mode == "eraser" || this.state.mode == "brush"
                  ? <div>
                    <br /> <br /> <br />
                    <strong>Thickness</strong>
                    <br /> <br />
                    <Button variant="contained" color="primary" onClick={this.thicknessUp}>+</Button>
                    <Button variant="contained" color="primary" onClick={this.thicknessDown}>-</Button>
                  </div> : null
                }
              </div>
              <div className="col-md-8">
                <br /><br />
                <Button variant="contained" color="primary" onClick={this.startVideo}>Start video</Button>
                <Button variant="contained" color="primary" onClick={this.stopVideo}>Stop video</Button>
                <Save />
                <br /> <br /> <br />
                <Canvas
                  width={this.state.width}
                  height={this.state.height}
                  point={this.state.point}
                  mode={this.state.mode}
                  thickness={this.state.thickness}
                  color={this.state.color} />
                <br />
                <Webcam
                  ref={webcam => this.webcam = webcam}
                  screenshotFormat="image/png"
                  width={this.state.width}
                  height={this.state.height}
                />
              </div>
              <div className="col-md-2">
                <br /><br />
                <h3>Colors</h3>
                <br></br>
                <CirclePicker onChange={this.changeColor} />
              </div>
            </div>
          </div>
        </div >
      </React.Fragment>
    );
  }
}
export default App;
