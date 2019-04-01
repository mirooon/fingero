package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/mirooon/fingero/api/finger"
	"gocv.io/x/gocv"
	"image"
	"image/png"
	"log"
	"net/http"
	"os"
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
	writer, err := gocv.VideoWriterFile(
		"a.avi",
		"MJPG",
		10,
		960,
		540,
		true,
	)
	if err != nil {
		log.Println(err)
		return
	}
	defer writer.Close()

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
		point := finger.Detect(imgMat)

		writer.Write(imgMat)

		// ignore error here because marshalling point can not fail
		body, _ := json.Marshal(point)
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

func main() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	fmt.Println("Serving on localhost:8080")
	http.HandleFunc("/ws", serveWs)
	http.ListenAndServe(":8080", nil)
}
