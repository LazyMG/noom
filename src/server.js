import express from "express";
import { Server } from "socket.io";
//import { WebSocketServer } from "ws";
import http from "http";
import path from "path";
const __dirname = path.resolve();

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

const publicRooms = () => {
  const { sids, rooms } = wsServer.sockets.adapter;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

wsServer.on("connection", (backSocket) => {
  backSocket["nickname"] = "Anon";
  backSocket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event: ${event}`);
  });
  backSocket.on("enter_room", (roomName, done) => {
    backSocket.join(roomName);
    done();
    backSocket.to(roomName).emit("welcome", backSocket.nickname);
    wsServer.sockets.emit("room_change", publicRooms());
  });
  backSocket.on("disconnecting", () => {
    backSocket.rooms.forEach((room) =>
      backSocket.to(room).emit("bye", backSocket.nickname)
    );
  });
  backSocket.on("new_message", (msg, room, done) => {
    backSocket.to(room).emit("new_message", `${backSocket.nickname}: ${msg}`);
    done();
  });
  backSocket.on("nickname", (nickname) => {
    if (nickname !== "") backSocket["nickname"] = nickname;
  });
});

// const sockets = [];
// const wss = new WebSocketServer({ server });
// wss.on("connection", (backSocket) => {
//   sockets.push(backSocket);
//   backSocket["nickname"] = "Anon";
//   console.log("Connected to Browser");
//   backSocket.on("close", () => console.log("Disconnected from the Browser"));
//   backSocket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "newMessage":
//         sockets.forEach((socket) => {
//           const utfMessage = message.payload.toString("utf8");
//           socket.send(`${backSocket.nickname} : ${utfMessage}`);
//         });
//         break;
//       case "nickname":
//         backSocket["nickname"] = message.payload.toString("utf8");
//         break;
//     }
//   });
// });

httpServer.listen(3000, handleListen);
