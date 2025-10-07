import React from "react";
import formatTime from "../../../utils/formatTime";
import { Box, SxProps, Theme } from "@mui/material";
import * as styles from "../../../styles/Chat.style";
import { Message } from "../../../models";
import getTextPixelWidth from "../../../utils/getTextPixelWidth";

interface MessageProps {
  message: Message;
  status: string;
  senderName: string;
  type: "sent" | "received";
}

function MessageBubble({ message, status, senderName, type }: MessageProps) {
  const messageWidth = getTextPixelWidth(
    message.content,
    "normal 14px Inter"
  ) as number;
  console.log(messageWidth);
  return (
    <Box
      sx={{ ...styles.message(messageWidth), ...styles[type] } as SxProps<Theme>}
    >
      {message.group && (
        <span className="senderName">{senderName?.slice(0, 20)}</span>
      )}
      <span className="format-emoji message">{message.content}</span>
      <Box sx={styles.messageInfo}>
        <span style={styles.time}>
          {" "}
          {message.timestamp ? formatTime(message.timestamp) : null}
        </span>
        {/*
          //TODO Update the message status feature to take in account group chat messages
           */}
        {type === "sent" && !message.group && (
          <span className={`status ${status}`}>
            {status === "sent" ? "\u2713" : "\u2713\u2713"}
          </span>
        )}
      </Box>
    </Box>
  );
}

export default MessageBubble;
