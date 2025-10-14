import { Server } from "socket.io";
import http from "http";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import router from "./routes/routes";
import connectionHandler from "./handlers/connectionHandler";

const app = express();
app.use(
  cors({
    origin: [
      /\.vercel\.app$/,
      /\.jaemdessources\.com$/,
      "http://localhost:3000",
      /ichat-cra\.netlify\.app$/,
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", router);

const server = http.createServer(app);
export const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log("listening on port", PORT);
});

const io = new Server(server, {
  cors: {
    origin: [
      /\.vercel\.app$/,
      /\.jaemdessources\.com$/,
      "http://localhost:3000",

      /ichat-cra\.netlify\.app$/,
    ],
  },
});

// app.set("/socket.io", io);

io.on("connection", connectionHandler);
