const express = require("express");
const router = express.Router();
const { handleChat, postData, getData } = require("./controller");

router.post("/chat", handleChat);
router.post("/data", postData);
router.get("/data", getData);

module.exports = router;
