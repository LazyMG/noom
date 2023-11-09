const frontSocket = io();

const welcome = document.getElementById("welcome");
const enterForm = welcome.querySelector("#enter");
const nameForm = welcome.querySelector("#name");
const room = document.getElementById("room");
const nicknameInput = welcome.querySelector("#name input");

room.hidden = true;

let roomName;

const addMessage = (message) => {
  const messageDiv = document.querySelector("#room");
  const ulEl = messageDiv.querySelector("ul");
  const liEl = document.createElement("li");
  liEl.innerText = message;
  ulEl.appendChild(liEl);
};

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const inputEl = room.querySelector("#msg input");
  const value = inputEl.value;
  frontSocket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  inputEl.value = "";
};

const handleNicknameSubmit = (event) => {
  event.preventDefault();
  frontSocket.emit("nickname", nicknameInput.value);
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3El = room.querySelector("h3");
  h3El.innerText = "Room " + roomName;
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  if (nicknameInput.value === "") {
    if (!window.confirm("Are you Anon?")) {
      nicknameInput.focus();
      return;
    }
  }
  const inputEl = enterForm.querySelector("input");
  frontSocket.emit("enter_room", inputEl.value, showRoom);
  roomName = inputEl.value;
  inputEl.value = "";
};

enterForm.addEventListener("submit", handleRoomSubmit);
nameForm.addEventListener("submit", handleNicknameSubmit);

frontSocket.on("welcome", (user) => {
  addMessage(`${user} arrived!`);
});

frontSocket.on("bye", (left) => {
  addMessage(`${left} left!`);
});

frontSocket.on("new_message", addMessage);
