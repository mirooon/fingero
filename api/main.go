package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"github.com/gorilla/websocket"
	"gocv.io/x/gocv"
	"image"
	"image/png"
	"log"
	"net/http"
	"os"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024 * 16,
	WriteBufferSize: 1024,

	CheckOrigin: func(r *http.Request) bool { return true },
}

var window *gocv.Window

var imgPrefix = []byte("data:image/png;base64,")

const deviceID = "0"

func reader(conn *websocket.Conn) {
	writer, err := gocv.VideoWriterFile(
		"a.avi",
		"MJPG",
		10,
		640,
		360,
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
		}

		img, err := png.Decode(bytes.NewReader(unbased))
		if err != nil {
			log.Println(err)
			return
		}

		imgMat, err := toRGB8(img)
		if err != nil {
			log.Println(err)
			return
		}
		err = writer.Write(imgMat)
		if err != nil {
			log.Println(err)
			return
		}

		err = conn.WriteMessage(messageType, []byte("Received frame"))
		if err != nil {
			log.Println(err)
			return
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
