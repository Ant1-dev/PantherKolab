import React from "react";
import {
  ChatContext,
  ChatMessagesContext,
  SocketIoContext,
  UserContext,
} from "../../contexts";

import {
  User,
  ChatMessagesContext as ChatMessagesContextType,
  ChatContext as ChatContextType,
} from "../../models";
import useAppContext from "../../hooks/useAppContext";
import { Socket, io } from "socket.io-client";

//event handlers
import {
  messageReceivedHandler,
  messageReadHandler,
  newMessageHandler,
  chatsModifiedHandler,
} from "../../handlers";

function SocketIoProvider(props: any) {
  const [socket, setSocket] = React.useState<Socket | undefined>();
  const [user] = useAppContext(UserContext) as [User];
  const { setCurrentChat, chats, setChats, currentChat, revalidate } =
    useAppContext(ChatContext) as ChatContextType;
  const { chatMessages, setChatMessages } = useAppContext(
    ChatMessagesContext
  ) as ChatMessagesContextType;

  //Socket connection initializer
  React.useEffect(() => {
    let newSocket: Socket | null = null;

    //Complete the handshake with the socket.io server
    (async function () {
      if (user?.id) {
        const socketURL = (
          process.env.NODE_ENV === "production"
            ? process.env.REACT_APP_BACKEND_URL
            : "http://localhost:3001"
        ) as string;

        newSocket = io(socketURL, {
          query: {
            roomId: user?.id,
            backendUrl: `${process.env.REACT_APP_BACKEND_URL}/api`,
          },
          auth: { token: process.env.REACT_APP_API_ACCESS_TOKEN },
        });

        newSocket.on("connect", () => {
          setSocket?.(newSocket as Socket);
        });
      }
    })();

    return () => {
      newSocket?.close();
    };
  }, [user]);

  // event listeners
  React.useEffect(
    () => {
      const newMessageHandlerReturn = newMessageHandler({
        chatMessages,
        setChatMessages,
        setChats,
        chats,
        socket,
        currentChat,
        user,
      });

      const messageReadHandlerReturn = messageReadHandler({
        chatMessages,
        setChatMessages,
        user,
      });

      const messageReceivedHandlerReturn = messageReceivedHandler({
        chatMessages,
        setChatMessages,
        userId: user?.id,
      });

      socket?.on("new-message", newMessageHandlerReturn);
      socket?.on("messages-read", messageReadHandlerReturn);
      socket?.on("messages-received", messageReceivedHandlerReturn);
      socket?.on("chats-modified", chatsModifiedHandler(revalidate));
      return () => {
        socket?.off("messages-read", messageReadHandlerReturn);
        socket?.off("messages-received", messageReceivedHandlerReturn);
        socket?.off("new-message", newMessageHandlerReturn);
      };
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [
      chatMessages,
      chats,
      currentChat,
      setChatMessages,
      setChats,
      setCurrentChat,
      socket,
      user,
    ]
  );

  return <SocketIoContext.Provider value={[socket, setSocket]} {...props} />;
}

export default SocketIoProvider;
