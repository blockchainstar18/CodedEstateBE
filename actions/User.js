const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.post("/login", async (req, res) => {
  const user = await User.findOne({ walletAddress: req.body.account });
  if (!user) {
    await User.create({
      walletAddress: req.body.account,
      inbox: [],
    });
  }
  res.json(true);
});

router.post("/inbox", async (req, res) => {
  // console.log(req.body);
  const user = await User.findOne({ walletAddress: req.body.account });
  if(user)
  res.json(user.inbox);
  else
  res.json([])
});

router.post("/search", async (req, res) => {
  // console.log(req.body);
  if (req.body.mode == "account") {
    const user = await User.findOne({ walletAddress: req.body.searchValue });
    if (user)
      res.json({
        result: true,
        account: [user.walletAddress],
      });
  } else res.json({ result: false });
});
module.exports = router;
