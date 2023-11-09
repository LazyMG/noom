const ulEl = document.querySelector("ul");
const nickFormEl = document.querySelector("#nick");
const messageFormEl = document.querySelector("#message");
const frontSocket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
  const msg = { type, payload };
  return JSON.stringify(msg);
};

frontSocket.addEventListener("open", () => {
  console.log("Connected to Server");
});

frontSocket.addEventListener("message", (message) => {
  const liEl = document.createElement("li");
  liEl.innerText = message.data;
  ulEl.appendChild(liEl);
  console.log("New message: ", message.data);
});

frontSocket.addEventListener("close", () => {
  console.log("Disconnected from Server");
});

const handleSubmit = (event) => {
  event.preventDefault();
  const inputEl = messageFormEl.querySelector("input");
  frontSocket.send(makeMessage("newMessage", inputEl.value));
  inputEl.value = "";
};

const handleNickSubmit = (event) => {
  event.preventDefault();
  const inputEl = nickFormEl.querySelector("input");
  frontSocket.send(makeMessage("nickname", inputEl.value));
  inputEl.value = "";
};

messageFormEl.addEventListener("submit", handleSubmit);
nickFormEl.addEventListener("submit", handleNickSubmit);
