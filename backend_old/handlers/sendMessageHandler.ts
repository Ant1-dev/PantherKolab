import { Socket } from "socket.io";
import { Message } from "../models";
import axios from "../../lib/axios";

const sendMessageHandler =
  (socket: Socket, token: string) =>
  (message: Message & { recipients: string[] }) => {
    //for each recipients send the message to their room
    console.log(message.recipients);

    message.recipients.forEach((id) => {
      socket.to(id).emit("new-message", message);
    });

    delete message.recipients;
    console.log("POST", axios.defaults.baseURL);
    // axxios
    //   .post("http://localhost:10000/api/test")
    //   .then(({ data }) => console.log({ data }))
    //   .catch((e) => console.log(e));
    const request = axios.post(
      `/api/messages`,
      { message },
      { headers: { cookie: `accessToken=${token}` } }
    );
    request
      .then(({ data }) => console.log(data.message))
      .catch((e) => console.log(e));
  };

export default sendMessageHandler;
