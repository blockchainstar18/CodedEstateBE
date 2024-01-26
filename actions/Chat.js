const express = require("express");
var ObjectId = require("mongodb").ObjectId;
const router = express.Router();
const Chat = require("../models/Chat");
// const { sockets_arr } = require("../socket/socket");
const User = require("../models/User");

const { sockets } = require("../socket/socket");

router.post("/sendMessage", async (req, res) => {
  const chattingSession = await Chat.findById(req.body.id);

  if (!chattingSession) {
    const newChatting = await Chat.create({
      personOne: req.body.sender,
      personTwo: req.body.receiver,
      messages: req.body.newMessage,
      nftId: req.body.nftId,
    });
    sockets.forEach((item) => {
      if (item.account == req.body.receiver)
        item.socket.emit("messageReceived", {
          id: newChatting._id,
          message: req.body.newMessage,
        });
    });
    const sender = await User.findOne({
      walletAddress: req.body.sender,
    });
    sender.inbox.push({
      chatId: newChatting._id,
      unreadMessages: 0,
    });
    await sender.save();
    const receiver = await User.findOne({
      walletAddress: req.body.receiver,
    });
    receiver.inbox.push({
      chatId: newChatting._id,
      unreadMessages: 1,
    });
    await receiver.save();
    res.json({
      isCreat: true,
      id: newChatting._id,
    });
  } else {
    chattingSession.messages.push(req.body.newMessage);
    await chattingSession.save();
    await User.findOneAndUpdate(
      {
        walletAddress: req.body.receiver,
        inbox: { $elemMatch: { chatId: new ObjectId(req.body.id) } },
      },
      {
        $inc: { "inbox.$.unreadMessages": 1 }, // increment unreadMessages by 1
      }
    );
    await User.findOneAndUpdate(
      {
        walletAddress: req.body.sender,
        inbox: { $elemMatch: { chatId: new ObjectId(req.body.id) } },
      },
      {
        $set: { "inbox.$.unreadMessages": 0 },
      }
    );

    res.json({
      isCreat: false,
    });
  }
});

router.post("/getMessages", async (req, res) => {
  const chattingSession = await Chat.findById(req.body.id);
  await User.findOneAndUpdate(
    {
      walletAddress: req.body.reader,
      inbox: { $elemMatch: { chatId: new ObjectId(req.body.id) } },
    },
    {
      $set: { "inbox.$.unreadMessages": 0 },
    }
  );

  if (chattingSession) {
    const receiverAccount =
      chattingSession.personOne == req.body.reader
        ? chattingSession.personTwo
        : chattingSession.personOne;

    sockets.forEach((item) => {
      if (item.account == receiverAccount)
        item.socket.emit("readingNow", {
          id: req.body.id,
        });
    });
    const receiver = await User.findOne({
      walletAddress: receiverAccount,
    });
    let unreadMessages = 0;
    for (let i = 0; i < receiver.inbox.length; i++) {
      if (receiver.inbox[i].chatId == req.body.id) {
        unreadMessages = receiver.inbox[i].unreadMessages;
        break;
      }
    }
    res.json({
      chattingSession: chattingSession,
      readingState: unreadMessages,
    });
  } else res.json(false);
});

router.post("/getChattingInfo", async (req, res) => {
  const chattingSession = await Chat.findById(req.body.id);
  const reader = await User.findOne({
    walletAddress: req.body.reader,
  });
  let unreadMessages = 0;
  for (let i = 0; i < reader.inbox.length; i++) {
    if (reader.inbox[i].chatId == req.body.id) {
      unreadMessages = reader.inbox[i].unreadMessages;
      break;
    }
  }
  const receiver =
    chattingSession.personOne == req.body.reader
      ? chattingSession.personTwo
      : chattingSession.personOne;
  res.json({
    receiver: receiver,
    latestMessageTime:
      chattingSession.messages[chattingSession.messages.length - 1]
        .generatedTime,
    unreadMessages: unreadMessages,
    nftId: chattingSession.nftId,
  });
});

module.exports = router;
