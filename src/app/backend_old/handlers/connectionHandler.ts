import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import sendMessageHandler from "./sendMessageHandler";
import messagesReadHandler from "./messagesReadHandler";
import messageReceivedHandler from "./messageReceivedHandler";

function connectionHandler(socket: Socket) {
  const {
    query: { roomId },
    auth: { token },
  } = socket.handshake;

  process.env.NODE_ENV !== "production" && console.log("joined room ", roomId);
  //each room contains all the clients where
  //one user is connected
  try {
    if (!global.socket) global.socket = socket;
    verifyAccessToken(token);
    socket.join(roomId as string);
    socket.on("send-message", sendMessageHandler(socket, token));
    socket.on("messages-received", messageReceivedHandler(socket, token));
    socket.on("messages-read", messagesReadHandler(socket, token));
  } catch (err) {
    socket.disconnect();
    process.env.NODE_ENV !== "production" && console.log(err.data);
  }
}

export default connectionHandler;
