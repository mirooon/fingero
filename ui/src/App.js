import React, { Component } from 'react';
import './App.css';
import Webcam from "react-webcam";
import Button from '@material-ui/core/Button';
import Canvas from './Canvas'
import { CirclePicker } from 'react-color';
import Save from './Save';
import * as handTrack from 'handtrackjs';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      intervalID: null,
      width: 640,
      height: 360,
      point: { x: 0, y: 0, prevX: 0, prevY: 0 },
      mode: "pen",
      thickness: 4,
      color: "black",
      model: null,
    };
  }

  startVideo = () => {
    handTrack.load().then(model => {
      this.setState({ model: model });

      let id = setInterval(() => {
        model.detect(this.webcam.getCanvas()).then(predictions => {
          if (Array.isArray(predictions) && predictions.length) {
            let pos = predictions[0].bbox;
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

      this.setState({
        intervalID: id,
      });
    });
  };

  stopVideo = () => { this.state.intervalID && clearInterval(this.state.intervalID) };

  setEraser = () => { this.setState({ mode: 'eraser' }) };
  setPen = () => { this.setState({ mode: 'pen' }) };
  setBrush = () => { this.setState({ mode: 'brush' }) };

  thicknessUp = () => { this.setState({ thickness: this.state.thickness + 1 }) };
  thicknessDown = () => { this.setState({ thickness: this.state.thickness - 1 }) };

  changeColor = (color, event) => { this.setState({ color: color.hex }) };

  render() {
    return (
      <div className="App">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-2">
              <br /><br />
              <h3>Tools</h3>
              <br></br>
              <Button variant="contained" color="primary" onClick={this.setEraser}>Eraser</Button>
              <Button variant="contained" color="primary" onClick={this.setPen}>Pencil</Button>
              <Button variant="contained" color="primary" onClick={this.setBrush}>Brush</Button>
              {this.state.mode === "eraser" || this.state.mode === "brush"
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
              <Webcam
                ref={webcam => this.webcam = webcam}
                width={this.state.width}
                height={this.state.height}
                audio={false}
                style={{ transform: 'scaleX(-1)' }}
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
    );
  }
}
export default App;
