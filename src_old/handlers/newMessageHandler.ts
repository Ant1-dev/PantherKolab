import { ChatMessages, ChatWithInterlocutor, Message, User } from "../models";
import type { Socket } from "socket.io-client";

interface newMessageHandlerType {
  chatMessages: { [id: string]: { messages: Message[] } };
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessages | undefined>>;
  setChats: React.Dispatch<
    React.SetStateAction<{ [id: string]: ChatWithInterlocutor }>
  >;
  chats: {
    [id: string]: ChatWithInterlocutor;
  };
  socket?: Socket;
  currentChat?: ChatWithInterlocutor;
  user: User;
}

export default function newMessageHandler({
  chatMessages,
  setChatMessages,
  setChats,
  chats,
  socket,
  currentChat,
  user,
}: newMessageHandlerType) {
  return (message: Message & { recipients: string[] }) => {
    const newMessages = chatMessages[message.chat]
      ? {
          ...chatMessages[message.chat],
          messages: [...chatMessages[message.chat].messages, message],
        }
      : { messages: [message] };

    setChatMessages?.((chatMessages: any) => ({
      ...chatMessages,
      [message.chat]: newMessages,
    }));

    // console.log("the chats are", chats);
    // console.log("the chat Messages are", chatMessages);

    //If the message is sent to a group chat, use that chat's id to reference
    // the chat. Else, if the sender's id is different from the current user's id
    // choose the id of the sender to reference the corresponding chat.
    //Else, if this client is also the sender, meaning if it is another device
    //on which the sender of the message is also currently logged in, we find
    // the id that is not that of the current user from the recipients's list and
    // use it to reference the corresponding chat.
    const userIsSender = message.sender === user.id;
    const chatId = message.group
      ? message.chat
      : !userIsSender
      ? message.sender
      : (message.recipients.find((el) => el !== user.id) as string);

    const chat = chats[chatId];
    //SOmetimes a user will create a new chat and send a message right away
    // we need to prevent the chat state from being updated here because
    //the other users don't have the new chat yet
    if (chat) {
      chat.unreadMessageCount = chat.unreadMessageCount as number;
      //if the chat is already open then we consider the message read
      //no need to update the unread message count. Also, we check
      //whether the sender is the same as the current user. if so, we
      //don't do the update in that case either.
      const updateUnreadMessageCount =
        chat.id !== currentChat?.id && !userIsSender;
      updateUnreadMessageCount && chat.unreadMessageCount++;
      setChats((prev: any) => ({ [chatId]: chat, ...prev }));
    }

    if (!userIsSender) {
      socket?.emit("messages-received", {
        messageIds: [message.id],
        chatId: message.chat,
        sender: message.sender,
      });

      if (message.chat === currentChat?.id) {
        socket?.emit("messages-read", {
          messageIds: [message.id],
          chatId: message.chat,
          sender: message.sender,
        });
      }
    }
  };
}
