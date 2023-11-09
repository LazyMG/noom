import express from "express";
import { WebSocketServer } from "ws";
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

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const sockets = [];

wss.on("connection", (backSocket) => {
  sockets.push(backSocket);
  backSocket["nickname"] = "Anon";
  console.log("Connected to Browser");
  backSocket.on("close", () => console.log("Disconnected from the Browser"));
  backSocket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "newMessage":
        sockets.forEach((socket) => {
          const utfMessage = message.payload.toString("utf8");
          socket.send(`${backSocket.nickname} : ${utfMessage}`);
        });
        break;
      case "nickname":
        backSocket["nickname"] = message.payload.toString("utf8");
        break;
    }
  });
});

server.listen(3000, handleListen);
