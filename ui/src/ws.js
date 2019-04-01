const socket = new WebSocket("ws://localhost:8080/ws");
let isClosed = false;

let connect = () => {
    console.log("Attempting Connection...");

    socket.onopen = () => {
        console.log("Successfully Connected");
    };

    socket.onmessage = msg => {
        console.log(msg);
    };

    socket.onclose = event => {
        console.log("Socket Closed Connection: ", event);
        isClosed = true;
    };

    socket.onerror = error => {
        socket.close()
        isClosed = true;
        console.log("Socket Error: ", error);
    };
};

let sendMsg = msg => {
    if (isClosed) {
        return;
    }
    console.log("sending msg");
    socket.send(msg);
};

let closeSocket = () => {
    socket.close();
    isClosed = true;
};

export { connect, sendMsg, closeSocket };