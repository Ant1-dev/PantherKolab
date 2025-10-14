import { Socket } from "socket.io";
import axios from "../../lib/axios";
function messageReceivedHandler(socket: Socket, token: string) {
  return ({
    messageIds,
    chatId,
    sender,
  }: {
    messageIds: string[];
    chatId: string;
    sender: string;
  }) => {
    process.env.NODE_ENV !== "production" && console.log();
    console.log("Received messages-received event");
    socket.to(sender).emit("messages-received", { messageIds, chatId });

    messageIds.forEach((id) => {
      console.log("PUT", axios.defaults.baseURL);
      const request = axios.put(
        `/api/messages`,
        { message: { id, status: "delivered" } },
        { headers: { cookie: `accessToken=${token}` } }
      );

      request
        .then(
          ({ data }) => process.env.NODE_ENV !== "production" && console.log(data)
        )
        .catch((e) => {
          process.env.NODE_ENV !== "production" && console.log(e.response.data);
        });
    });
  };
}

export default messageReceivedHandler;
