import { ChatMessages, Message } from "../models";

interface messageReceivedHandlerType {
  chatMessages: { [id: string]: { messages: Message[] } };
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessages | undefined>>;
  userId: string;
}

export default function messageReceivedHandler({
  chatMessages,
  setChatMessages,
  userId,
}: messageReceivedHandlerType) {
  return ({ messageIds, chatId }: { messageIds: string[]; chatId: string }) => {
    const chat = chatMessages[chatId];
    const messageList = chat.messages;

    for (let i = messageList.length - 1; i >= 0; i--) {
      //if we get to a message marked "read" or a message that
      //was sent to us. It means We have looked at all the latest
      //messages we sent that did not yet reach the recipient so we break out of the loop
      if (messageList[i].status === "read" || messageList[i].sender !== userId)
        break;
      messageList[i].status = "delivered";
    }

    setChatMessages((prev: any) => ({ ...prev, [chatId]: chat }));
  };
}
