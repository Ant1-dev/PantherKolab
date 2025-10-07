import React from "react";

//models
import {
  ChatMessages,
  ChatContext as ChatContextType,
  Context,
  User,
} from "../../models";
import useAppContext from "../../hooks/useAppContext";
import { ChatContext, ChatMessagesContext, UserContext } from "../../contexts";
import contentService from "../../services/contentService";

function ChatMessagesProvider(props: any) {
  const { chats } = useAppContext(ChatContext) as ChatContextType;
  const [user] = useAppContext(UserContext) as Context<User>;
  // const currentChatId = currentChat?.id as string;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState();

  const [chatMessages, setChatMessages] = React.useState<ChatMessages>({});

  //Initializing
  React.useEffect(() => {
    //if we have no messages get them
    if (!Object.keys(chatMessages).length) {
      const initialChatMessages = {} as ChatMessages;
      setIsLoading(true);
      const chatArray = Object.entries(chats);

      const result = chatArray.map(async ([id, chat]) => {
        const messages = await contentService
          .getMessages(chat.id)
          .then((messages) => messages);
        //loop over the messages starting from the most recent one
        //to count the unread messages
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].status === "read" || messages[i].sender === user?.id)
            break;
          chat.unreadMessageCount++;
        }
        initialChatMessages[chat.id] = { messages };
      });

      Promise.all(result).then(() => {
        setChatMessages(initialChatMessages);
        setIsLoading(false);
      });
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats]);

  return (
    <ChatMessagesContext.Provider
      value={{ chatMessages, setChatMessages, isLoading, error, setError }}
      {...props}
    />
  );
}

export default ChatMessagesProvider;
