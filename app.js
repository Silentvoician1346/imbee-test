import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { consumeMessages } from "./services/fmcService.js";

// load env
dotenv.config();

// initialize express
const app = express();
app.use(bodyParser.json());

// start the srvice
consumeMessages();

// listening on port 3000
app.listen(3000, () => {
  console.log("FCM Service is running on port 3000");
});
