package gesture

import (
	"fmt"
	"image"
	"image/color"
	"math"

	"gocv.io/x/gocv"
)

func Detect(img gocv.Mat) gocv.Mat {

	imgGrey := gocv.NewMat()
	defer imgGrey.Close()

	imgBlur := gocv.NewMat()
	defer imgBlur.Close()

	imgThresh := gocv.NewMat()
	defer imgThresh.Close()

	hull := gocv.NewMat()
	defer hull.Close()

	defects := gocv.NewMat()
	defer defects.Close()

	green := color.RGBA{0, 255, 0, 0}

	gocv.CvtColor(img, &imgGrey, gocv.ColorBGRToGray)
	gocv.GaussianBlur(imgGrey, &imgBlur, image.Pt(35, 35), 0, 0, gocv.BorderDefault)
	gocv.Threshold(imgBlur, &imgThresh, 0, 255, gocv.ThresholdBinaryInv+gocv.ThresholdOtsu)

	contours := gocv.FindContours(imgThresh, gocv.RetrievalExternal, gocv.ChainApproxSimple)
	c := getBiggestContour(contours)

	gocv.ConvexHull(c, &hull, true, false)
	gocv.ConvexityDefects(c, hull, &defects)

	var angle float64
	defectCount := 0
	for i := 0; i < defects.Rows(); i++ {
		start := c[defects.GetIntAt(i, 0)]
		end := c[defects.GetIntAt(i, 1)]
		far := c[defects.GetIntAt(i, 2)]

		a := math.Sqrt(math.Pow(float64(end.X-start.X), 2) + math.Pow(float64(end.Y-start.Y), 2))
		b := math.Sqrt(math.Pow(float64(far.X-start.X), 2) + math.Pow(float64(far.Y-start.Y), 2))
		c := math.Sqrt(math.Pow(float64(end.X-far.X), 2) + math.Pow(float64(end.Y-far.Y), 2))

		// apply cosine rule here
		angle = math.Acos((math.Pow(b, 2)+math.Pow(c, 2)-math.Pow(a, 2))/(2*b*c)) * 57

		// ignore angles > 90 and highlight rest with dots
		if angle <= 90 {
			defectCount++
			gocv.Circle(&img, far, 10, green, 2)
		}
	}

	status := fmt.Sprintf("fingers: %d", defectCount+1)

	rect := gocv.BoundingRect(c)
	gocv.Rectangle(&img, rect, color.RGBA{255, 255, 255, 0}, 2)

	gocv.Flip(img, &img, 1)
	gocv.PutText(&img, status, image.Pt(10, 20), gocv.FontHersheyPlain, 1.2, green, 2)
	return img
}

func getBiggestContour(contours [][]image.Point) []image.Point {
	var area float64
	index := 0
	for i, c := range contours {
		newArea := gocv.ContourArea(c)
		if newArea > area {
			area = newArea
			index = i
		}
	}
	return contours[index]
}
