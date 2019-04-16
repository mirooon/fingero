import React, { Component } from "react";
import Button from '@material-ui/core/Button';

class Save extends Component{
  saveCanvas() {
    const canvasSave = document.getElementById('myCanvas');
    const d = canvasSave.toDataURL('image/png').replace("image/png", "image/octet-stream");
    window.location.href = d;
    console.log('Saved!');
  }

  render(){
    return(
      <div>
       <Button variant="contained" color="primary"  onClick={ this.saveCanvas }>Save</Button>
      </div>
    )
  }
}

export default Save;