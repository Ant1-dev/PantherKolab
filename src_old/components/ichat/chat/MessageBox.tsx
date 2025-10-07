import React from "react";
import { v4 as uuid4 } from "uuid";
//mui
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
//models
import {
  Message,
  User,
  ChatMessagesContext as ChatMessagesContextType,
  ChatContext as ChatContextType,
  Context,
} from "../../../models";
import { Socket } from "socket.io-client";
//styles
import { messageBox, textField } from "../../../styles/Chat.style";
//hooks & contexts
import useAppContext from "../../../hooks/useAppContext";
import {
  ChatContext,
  ChatMessagesContext,
  SocketIoContext,
  UserContext,
} from "../../../contexts";

function MessageBox({ setBottom }: any) {
  const { currentChat, setChats } = useAppContext(ChatContext) as ChatContextType;
  const currentChatId = currentChat?.id as string;
  const [user] = useAppContext(UserContext) as Context<User>;
  const [socket] = useAppContext(SocketIoContext) as Context<Socket>;

  const { chatMessages, setChatMessages } = useAppContext(
    ChatMessagesContext
  ) as ChatMessagesContextType;

  const [message, setMessage] = React.useState("");

  const handleSendMessage = () => {
    if (message.length) {
      const data = {
        id: uuid4(),
        sender: user?.id as string,
        content: message,
        chat: currentChat?.id as string,
        group: !!currentChat?.group,
        timestamp: new Date(),
        status: "sent",
      };

      const newMessages = (
        chatMessages[currentChatId]
          ? {
              messages: [...chatMessages[currentChatId].messages, data],
            }
          : { messages: [data] }
      ) as { messages: Message[] };

      setChatMessages?.((prev) => ({
        ...prev,
        [currentChatId]: newMessages,
      }));

      socket?.emit("send-message", { ...data, recipients: currentChat?.users });

      //removing this chat from the list and replacing it at the top
      setChats((prev) => {
        const chat = prev[currentChat?.secondaryId as string];
        return {
          [currentChat?.secondaryId as string]: chat,
          ...prev,
        };
      });

      setMessage("");
      setBottom("50px");
      inputRef?.current?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  const handleEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
    //prevent a new line to be created and
    //Send the message when the Enter key is pressed
    if (!/Enter|NumpadEnter/.test(e.key)) return;
    else {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * UI Effects
   */
  //when the value of message changes, update the "bottom" state
  const messageBoxRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    if (message !== "")
      setBottom(getComputedStyle(messageBoxRef?.current as Element).height);
  }, [message, setBottom]);

  const inputRef = React.useRef<HTMLDivElement>();
  return (
    <Box component="div" sx={messageBox} ref={messageBoxRef}>
      <TextField
        id="textField"
        multiline
        maxRows={4}
        value={message}
        onChange={handleChange}
        onKeyDown={handleEnter}
        placeholder="Type something..."
        variant="standard"
        sx={textField}
        inputRef={inputRef}
      />
      <SendIcon sx={{ cursor: "pointer" }} onClick={handleSendMessage} />
    </Box>
  );
}

export default MessageBox;
