const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./DB");

const { sockets } = require("./socket/socket");

const chatRoutes = require("./actions/Chat");
const userRoutes = require("./actions/User");

const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

app.use(express.json());

app.use("/chat", chatRoutes);
app.use("/user", userRoutes);

connectDB();

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const pushSockettoSockets = (account, socket) => {
  const elementExists = sockets.some((obj) => obj.account === account);
  if (!elementExists)
    sockets.push({
      account: account,
      socket: socket,
    });
};

const popSocketfromSockets = (id) => {
  const Tsockets = sockets.filter((item) => item.socket.id !== id);
  sockets.length = 0;
  Tsockets.forEach((item) => {
    sockets.push(item);
  });
};

io.on("connection", (socket) => {
  socket.on("connectedAccount", (account) => {
    if (account) {
      pushSockettoSockets(account, socket);
      console.log(sockets.length);
      console.log(account);
    }
  });
  socket.on("disconnect", () => {
    console.log(socket.id);
    popSocketfromSockets(socket.id);
    console.log(sockets.length);
  });
  socket.on("sendMessage", (req) => {
    if(req.id)
    sockets.forEach((item) => {
      if (item.account == req.receiver)
        item.socket.emit("messageReceived", {
          id: req.id,
          message: req.newMessage,
        });
    });
  });
});

const port = 443;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
