import React from "react";
//contexts & hooks
import useAppContext from "../../../hooks/useAppContext";
import {
  ChatContext,
  ChatMessagesContext,
  UserContext,
  ChatUsersContext,
} from "../../../contexts";
//utils
import formatEmoji from "../../../utils/formatEmoji";

//models
import {
  User,
  ChatMessagesContext as ChatMessagesContextType,
  Context,
  ChatContext as ChatContextType,
  ChatUsers,
} from "../../../models";

//mui
// import List from "@mui/material/List";
import { Box } from "@mui/material";

//components
import MessageBubble from "./MessageBubble";

//styles
import * as styles from "../../../styles/Chat.style";
import Spinner from "../../../components/Spinner";

function MessageList({ bottom }: any) {
  const [chatUsers] = useAppContext(ChatUsersContext) as Context<ChatUsers>;
  const [user] = useAppContext(UserContext) as Context<User>;
  const { currentChat } = useAppContext(ChatContext) as ChatContextType;
  const { chatMessages, isLoading, error } = useAppContext(
    ChatMessagesContext
  ) as ChatMessagesContextType;

  const currentChatId = currentChat?.id as string;

  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    //Scroll to the bottom of the message list
    // to the newest messages when rendered
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  });

  let currentChatUsers: any = {};

  chatUsers?.[currentChatId]?.forEach((user) => {
    currentChatUsers[user.id] = { name: user.name, username: user.username };
  });

  const messages = chatMessages[currentChatId]?.messages?.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  React.useEffect(() => {
    formatEmoji(document.body);
  }, [currentChatId, chatMessages]);

  return (
    <>
      {messages?.length ? (
        <Box
          sx={styles.messageList(bottom)}
          ref={listRef}
          className="niceScrollbar"
        >
          {messages.map((message, i) => {
            const type = user?.id === message.sender ? "sent" : "received";
            const status = message.status;
            const senderName =
              user?.id === message.sender
                ? ""
                : currentChatUsers[message.sender]?.name;

            return (
              <MessageBubble
                key={i}
                message={message}
                senderName={senderName}
                status={status}
                type={type}
              ></MessageBubble>
            );
          })}
        </Box>
      ) : isLoading ? (
        <Spinner loading={isLoading} />
      ) : error ? (
        <p>Error</p>
      ) : null}
    </>
  );
}

export default MessageList;
