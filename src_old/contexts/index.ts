import React from "react";
import {
  User,
  Context,
  ChatUsers,
  ChatContext as ChatContextType,
  ChatMessagesContext as ChatMessagesContextType,
} from "../models";
import { Socket } from "socket.io-client";
export const AuthContext = React.createContext<Context<boolean> | null>(null);
export const ChatContext = React.createContext<ChatContextType | null>(null);

export const ChatMessagesContext =
  React.createContext<ChatMessagesContextType | null>(null);

export const UserContext = React.createContext<Context<User> | null>(null);

export const ChatUsersContext = React.createContext<Context<ChatUsers> | null>(
  null
);

export const SocketIoContext = React.createContext<Context<Socket> | null>(null);
