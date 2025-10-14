import { Socket } from "socket.io";

function broadcastChatsModified(
  chatId: string,
  interlocutors: string[],
  created: boolean
) {
  const socket: Socket = global.socket;
  process.env.NODE_ENV !== "production" &&
    console.log(chatId, " with ", interlocutors, " modified.");
  //TODO Maybe do something different when the chat is just modified instead of created.
  interlocutors.forEach((i) => {
    socket.to(i).emit("chats-modified");
  });
}
export default broadcastChatsModified;
