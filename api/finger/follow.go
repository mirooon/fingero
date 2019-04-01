package finger

import (
	"gocv.io/x/gocv"
	"image"
	"image/color"
)

// Detect fingertip and draw it on img.
func Detect(img gocv.Mat) image.Point {
	handMask := makeHandMask(img)
	contour := getHandContour(&img, handMask)
	return drawMarker(img, contour)
}

func drawMarker(img gocv.Mat, points []image.Point) image.Point {
	point := image.Point{img.Rows(), img.Cols()}
	for _, p := range points {
		if p.Y < point.Y {
			point = p
		}
	}
	gocv.Circle(&img, point, 50, color.RGBA{255, 0, 0, 1}, 3)
	return point
}

func skinColorUpper(hue float64) gocv.Scalar {
	return gocv.NewScalar(hue, 0.8*255, 0.6*255, 200)
}

func skinColorLower(hue float64) gocv.Scalar {
	return gocv.NewScalar(hue, 0.1*255, 0.05*255, 200)
}

func makeHandMask(img gocv.Mat) gocv.Mat {
	imgHLS := gocv.NewMat()
	rangeMask := gocv.NewMat()
	gocv.CvtColor(img, &imgHLS, gocv.ColorBGRToHLS)

	gocv.InRangeWithScalar(imgHLS, skinColorLower(0), skinColorUpper(15), &rangeMask)
	gocv.Blur(rangeMask, &rangeMask, image.Point{10, 10})
	gocv.Threshold(rangeMask, &rangeMask, 220, 255, gocv.ThresholdBinary)

	return rangeMask
}

func getHandContour(img *gocv.Mat, handMask gocv.Mat) []image.Point {
	points := gocv.FindContours(handMask, gocv.RetrievalExternal, gocv.ChainApproxSimple)
	if len(points) == 0 {
		return []image.Point{}
	}
	ind, area := 0, gocv.ContourArea(points[0])
	for i, a := range points {
		tempArea := gocv.ContourArea(a)
		if tempArea > area {
			area = tempArea
			ind = i
		}
	}

	gocv.DrawContours(img, points, ind, color.RGBA{0, 255, 0, 1}, 5)
	return points[ind]
}
