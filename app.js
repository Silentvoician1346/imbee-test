const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fcmService = require("./services/fcmService");

// load env
dotenv.config();

// initialize express
const app = express();
app.use(bodyParser.json());

// start the srvice
fcmService.consumeMessages();

// listening on port 3000
app.listen(3000, () => {
  console.log("FCM Service is running on port 3000");
});
