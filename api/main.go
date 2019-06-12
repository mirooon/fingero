package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"log"
	"math"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
	"gocv.io/x/gocv"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024 * 16,
		WriteBufferSize: 1024,

		CheckOrigin: func(r *http.Request) bool { return true },
	}
	imgPrefix = []byte("data:image/png;base64,")
)

func reader(conn *websocket.Conn) {
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		p = bytes.Replace(p, imgPrefix, []byte{}, 1)
		unbased := make([]byte, len(p))
		_, err = base64.StdEncoding.Decode(unbased, p)
		if err != nil {
			log.Println("Cannot decode b64")
			return
		}

		img, err := png.Decode(bytes.NewReader(unbased))
		if err != nil {
			log.Println(err)
			continue
		}

		imgMat, err := toRGB8(img)
		if err != nil {
			log.Println(err)
			continue
		}
		fingersCount := countFingers(imgMat)

		// ignore error here because marshalling point can not fail
		body, _ := json.Marshal(map[string]int{
			"count": fingersCount,
		})
		err = conn.WriteMessage(messageType, body)
		if err != nil {
			log.Println(err)
			continue
		}
	}
}

func serveWs(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Connected with client")

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}
	reader(ws)
}

func toRGB8(img image.Image) (gocv.Mat, error) {
	bounds := img.Bounds()
	x := bounds.Dx()
	y := bounds.Dy()
	bytes := make([]byte, 0, x*y*3)

	//don't get surprised of reversed order everywhere below
	for j := bounds.Min.Y; j < bounds.Max.Y; j++ {
		for i := bounds.Min.X; i < bounds.Max.X; i++ {
			r, g, b, _ := img.At(i, j).RGBA()
			bytes = append(bytes, byte(b>>8), byte(g>>8), byte(r>>8))
		}
	}
	return gocv.NewMatFromBytes(y, x, gocv.MatTypeCV8UC3, bytes)
}

func countFingers(img gocv.Mat) int {

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

	return defectCount
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

func main() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	fmt.Println("Serving on localhost:8080")
	http.HandleFunc("/ws", serveWs)
	http.ListenAndServe(":8080", nil)
}
