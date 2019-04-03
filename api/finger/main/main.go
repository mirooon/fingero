package main

import (
	"fmt"
	"github.com/mirooon/fingero/api/finger"
	"gocv.io/x/gocv"
)

const (
	deviceID = "0"
)

var (
	isCalibrated = false
)

func main() {
	webcam, err := gocv.OpenVideoCapture(deviceID)
	if err != nil {
		fmt.Printf("Error opening video capture device: %v\n", deviceID)
		return
	}
	defer webcam.Close()
	window := gocv.NewWindow("Finger tracking")
	defer window.Close()

	img := gocv.NewMat()
	defer img.Close()
	for {
		if ok := webcam.Read(&img); !ok {
			fmt.Printf("Device closed: %v\n", deviceID)
			return
		}
		if img.Empty() {
			continue
		}
		gocv.Flip(img, &img, 1)
		finger.Detect(img)
		window.IMShow(img)
		if window.WaitKey(1) == 27 {
			break
		}
	}
}
