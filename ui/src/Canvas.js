import React, { Component } from 'react';

class Canvas extends Component {
    updateCanvas(x, y) {
        const ctx = this.refs.canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, 2 * Math.PI);
        ctx.stroke();
    }
    render() {
        return (
            <canvas ref="canvas" width={960} height={540} />
        );
    }
}

export default Canvas