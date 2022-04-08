import express, { Express, Request, Response } from "express";

import dotenv from "dotenv";


import socket from "socket.io";


import router from './routes/index';




dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

let io = require("socket.io")(server);

io.on("connection",router.connections)

export default{
  io,socket
}





