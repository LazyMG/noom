import express from "express";
import { Server } from "socket.io";
//import { WebSocketServer } from "ws";
import http from "http";
import path from "path";
import { instrument } from "@socket.io/admin-ui";
const __dirname = path.resolve();

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", (backSocket) => {
  backSocket.on("join_room", (roomName) => {
    backSocket.join(roomName);
    backSocket.to(roomName).emit("welcome");
  });
  backSocket.on("offer", (offer, roomName) => {
    backSocket.to(roomName).emit("offer", offer);
  });
  backSocket.on("answer", (answer, roomName) => {
    backSocket.to(roomName).emit("answer", answer);
  });
  backSocket.on("ice", (ice, roomName) => {
    backSocket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
