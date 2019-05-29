import React, { Component } from 'react';

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            width: props.width,
            height: props.height,
            prevX: 0,
            prevY: 0,
        };
    }

    updateCanvas = (point, mode, thickness, color) => {
        const ctx = this.refs.canvas.getContext('2d');
        if (mode === "pen") {
            ctx.globalCompositeOperation = "source-over";
            ctx.beginPath();
            ctx.moveTo(point.prevX, point.prevY);
            ctx.lineTo(point.x, point.y);
            ctx.strokeStyle = color;
            ctx.stroke();
        } else if (mode === "brush") {
            ctx.globalCompositeOperation = "source-over";
            ctx.lineWidth = thickness;
            ctx.beginPath();
            ctx.moveTo(point.prevX, point.prevY);
            ctx.lineTo(point.x, point.y);
            ctx.strokeStyle = color;
            ctx.stroke();
        } else if (mode === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.arc(point.x, point.y, thickness, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    componentDidUpdate(props) {
        if (props.point && props.point.prevX) {
            this.updateCanvas(props.point, props.mode, props.thickness, props.color);
        }
    }

    render() {
        return (
            <canvas
                id="myCanvas"
                ref="canvas"
                width={this.state.width}
                height={this.state.height}
                style={{ border: "1px solid #000000" }}
            />
        );
    }
}

export default Canvas