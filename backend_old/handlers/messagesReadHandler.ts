import { Socket } from "socket.io";

import axios from "../../lib/axios";

type StatusUpdatedMessages = {
  messageIds: string[];
  sender: string;
  chatId: string;
};

const messagesReadHandler =
  (socket: Socket, token: string) =>
  ({ messageIds, sender, chatId }: StatusUpdatedMessages) => {
    process.env.NODE_ENV !== "production" && console.log(messageIds);

    socket.to(sender).emit("messages-read", { messages: messageIds, chatId });

    messageIds.forEach((id) => {
      console.log("PUT", axios.defaults.baseURL);

      const request = axios.put(
        `/api/messages`,
        { message: { id, status: "read" } },
        { headers: { cookie: `accessToken=${token}` } }
      );

      request
        .then(
          ({ data }) => process.env.NODE_ENV !== "production" && console.log(data)
        )
        .catch((e) => {
          console.log(e?.response?.data);
        });
    });
  };

export default messagesReadHandler;
