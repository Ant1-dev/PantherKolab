import React from "react";
import {
  ChatWithInterlocutor,
  ChatContext as ChatContextType,
  ChatMessagesContext as ChatMessagesContextType,
  Context,
  User,
} from "../../../models";
import type { Socket } from "socket.io-client";

import ListItemButton from "@mui/material/ListItemButton";
import { Avatar, IconButton, Typography, Box } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import * as styles from "../../../styles/ChatList.style";
import { avatar } from "../../../styles/Ichat.style";
import {
  ChatContext,
  ChatMessagesContext,
  SocketIoContext,
  UserContext,
} from "../../../contexts";
import useAppContext from "../../../hooks/useAppContext";

//styles
import formatTime from "../../../utils/formatTime";

function ChatListItem({ chat }: { chat: ChatWithInterlocutor }) {
  const { currentChat, setCurrentChat, setChatListOpen } = useAppContext(
    ChatContext
  ) as ChatContextType;

  const { chatMessages } = useAppContext(
    ChatMessagesContext
  ) as ChatMessagesContextType;
  const [user] = useAppContext(UserContext) as Context<User>;
  const [socket] = useAppContext(SocketIoContext) as Context<Socket>;
  const messageList = chatMessages[chat?.id]?.messages;
  const lastMessageIndex = messageList?.length - 1;
  const lastMessage = messageList?.[lastMessageIndex];
  const selected = currentChat?.secondaryId === chat?.secondaryId;

  //send a message received notification if there are messages
  // received that are not yet read because the client was disconnected
  const unreadMessages = [];

  for (let i = messageList?.length - 1; i >= 0; i--) {
    if (messageList?.[i].status !== "sent" || messageList?.[i].sender === user?.id)
      break;
    messageList[i].status = "delivered";
    unreadMessages.push(messageList?.[i].id);
  }

  if (unreadMessages.length) {
    socket?.emit("messages-received", {
      messageIds: unreadMessages,
      chatId: lastMessage.chat,
      sender: lastMessage.sender,
    });
  }
  const handleClick = () => {
    setCurrentChat?.(chat);
    setChatListOpen(false);
  };

  return (
    <Box sx={styles.chatListItem} onClick={handleClick}>
      <ListItemButton sx={styles.chat} selected={selected}>
        <IconButton color="inherit" sx={{ p: 0.5 }}>
          <Avatar src={chat?.chatPicture} alt={chat?.name} sx={avatar}>
            {chat?.group ? <GroupIcon /> : chat?.name?.charAt(0)}
          </Avatar>
        </IconButton>
        <Box sx={styles.chatInfo}>
          <Box>
            <Typography component="span">{chat?.name}</Typography>
            <div style={styles.lastMessageExcerpt}>
              {lastMessage?.content.length > 22
                ? lastMessage?.content.slice(0, 22) + "..."
                : lastMessage?.content}
            </div>
          </Box>
          <Box sx={styles.chatDetails}>
            <span style={styles.timestamp(chat.unreadMessageCount)}>
              {formatTime(lastMessage?.timestamp)}
            </span>
            {chat?.unreadMessageCount! > 0 && (
              <span className="unreadMessageCount">
                {chat?.unreadMessageCount}
              </span>
            )}
          </Box>
        </Box>
      </ListItemButton>
    </Box>
  );
}

export default ChatListItem;
