import React, { Component } from 'react';

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: props.width,
            height: props.height,
            prevX: 0,
            prevY: 0,
        };
    }

    // componentDidMount() {
    //     const canvas = this.refs.canvas
    //     const ctx = canvas.getContext("2d")
    //     const img = this.refs.image
    // }

    updateCanvas = (point) => {
        const ctx = this.refs.canvas.getContext('2d');

        ctx.beginPath();
        ctx.moveTo(point.prevX, point.prevY);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();

    }

    componentDidUpdate(props) {
        if (props.point) {
            console.log('got', props.point)
            this.updateCanvas(props.point);
        }
    }

    render() {
        return (
            <canvas ref="canvas" width={this.state.width} height={this.state.height} style={{ border: "1px solid #000000" }} />
        );
    }
}

export default Canvas