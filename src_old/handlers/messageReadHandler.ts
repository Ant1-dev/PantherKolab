import { ChatMessages, Message, User } from "../models";

interface messageReadHandlerType {
  chatMessages: { [id: string]: { messages: Message[] } };
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessages | undefined>>;
  user: User;
}

export default function messageReadHandler({
  user,
  chatMessages,
  setChatMessages,
}: messageReadHandlerType) {
  return ({ messages, chatId }: { messages: string[]; chatId: string }) => {
    let messageList = chatMessages[chatId].messages;

    for (let i = messageList.length - 1; i >= 0; i--) {
      //if we get to a message marked "read" or a message that
      //was sent to us. It means We have looked at all the latest
      //messages we sent that were unread so we break out of the loop
      if (messageList[i].status === "read" || messageList[i].sender !== user?.id)
        break;
      else if (messageList[i].status !== "read") messageList[i].status = "read";
    }
    const newMessages = { messages: messageList };

    setChatMessages?.((prev: any) => ({ ...prev, [chatId]: newMessages }));
  };
}
