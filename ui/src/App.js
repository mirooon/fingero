import React, { Component } from 'react';
import './App.css';
import Webcam from "react-webcam";
import Button from '@material-ui/core/Button';
import Canvas from './Canvas'
import { CirclePicker } from 'react-color';
import Save from './Save';
import * as handTrack from 'handtrackjs';
import Navbar from './Navbar';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      intervalID: null,
      intervalSocketID: null,
      width: 640,
      height: 360,
      point: { x: 0, y: 0, prevX: 0, prevY: 0 },
      mode: "brush",
      thickness: 8,
      color: "black",
      model: null,
      socket: null,
      reset: 0,
      pause: false,
    };
    handTrack.load({
      imageScaleFactor: 1,
      maxNumBoxes: 5,
      iouThreshold: 0.5,
      scoreThreshold: 0.9,
    }).then(model => {
      this.setState({ model: model });
    });
  }

  addSocketMethods = () => {
    const { socket } = this.state;
    socket.onopen = () => {
      console.log('connected');
    };

    socket.onmessage = msg => {
      let count = JSON.parse(msg.data).count;
      console.log(count);
      if (count === 0 || count === 1) {
        this.setPen();
      } else if (count === 2 || count === 3) {
        this.setBrush();
      } else {
        this.setEraser();
      }
    };
  }

  startVideo = () => {
    // this.setState({ socket: new WebSocket("ws://localhost:8080/ws") }, this.addSocketMethods);
    let id = setInterval(() => {
      if (this.state.pause) return;
      this.state.model.detect(this.webcam.getCanvas()).then(pred => {
        if (Array.isArray(pred) && pred.length) {
          let pos = pred[0].bbox;
          this.setState({
            point: {
              prevX: this.state.point.x,
              prevY: this.state.point.y,
              x: pos[0],
              y: pos[1],
            }
          });
        }
      });
    }, 1000 / 10);

    // let socketID = setInterval(() => {
    //   const { socket } = this.state;
    //   if (socket.readyState === WebSocket.OPEN) {
    //     socket.send(this.webcam.getScreenshot());
    //   }
    // }, 1000);

    this.setState({
      intervalID: id,
      // intervalSocketID: socketID,
    });
  };

  stopVideo = () => {
    this.state.intervalID && clearInterval(this.state.intervalID);
    this.state.intervalSocketID && clearInterval(this.state.intervalSocketID);
    const { socket } = this.state;
    if (socket) {
      socket.close();
    }
  };

  setEraser = () => { this.setState({ mode: 'eraser' }) };
  setPen = () => { this.setState({ mode: 'pen' }) };
  setBrush = () => { this.setState({ mode: 'brush' }) };
  clearCanvas = () => {
    this.setState({ reset: 1 }, () => {
      this.setState({ reset: 0 });
    });
  };
  pauseDraw = () => {
    this.setState({ pause: !this.state.pause });
  };

  thicknessUp = () => { this.setState({ thickness: this.state.thickness + 1 }) };
  thicknessDown = () => { this.setState({ thickness: this.state.thickness - 1 }) };

  changeColor = (color, event) => { this.setState({ color: color.hex }) };

  render() {
    return (
      <React.Fragment>
        <div className="App">
          <Navbar />
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-3">
                <br /><br />
                <h3>Tools</h3>
                <br></br>
                <Button variant="contained" color="primary" className="mr-3" onClick={this.setEraser}>Eraser</Button>
                <Button variant="contained" color="primary" className="mr-3" onClick={this.setPen}>Pencil</Button>
                <Button variant="contained" color="primary" className="mr-3" onClick={this.setBrush}>Brush</Button>
                {this.state.mode === "eraser" || this.state.mode === "brush"
                  ? <div>
                    <br /> <br /> <br />
                    <strong>Thickness</strong>
                    <br /> <br />
                    <Button variant="contained" color="primary" className="mr-3" onClick={this.thicknessUp}>+</Button>
                    <Button variant="contained" color="primary" className="mr-3" onClick={this.thicknessDown}>-</Button>
                  </div> : null
                }
              </div>
              <div className="col-md-6">
                <br /><br />
                <Button variant="contained" color="primary" className="mr-3" onClick={this.startVideo}>Start video</Button>
                <Button variant="contained" color="primary" className="mr-3" onClick={this.stopVideo}>Stop video</Button>
                <Button variant="contained" color="primary" className="mr-3" onClick={this.clearCanvas}>Clear</Button>
                <Button variant="contained" color="primary" className="mr-3" onClick={this.pauseDraw}>Pause</Button>
                <Save />
                <br /> <br /> <br />
                <Canvas
                  width={this.state.width}
                  height={this.state.height}
                  point={this.state.point}
                  mode={this.state.mode}
                  thickness={this.state.thickness}
                  color={this.state.color}
                  reset={this.state.reset}
                />
                <br />
                <Webcam
                  ref={webcam => this.webcam = webcam}
                  width={this.state.width}
                  height={this.state.height}
                  audio={false}
                  screenshotFormat="image/png"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
              <div className="col-md-3">
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
