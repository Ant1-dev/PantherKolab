// export interface AuthResponse {
//   accessToken: string;
// }

import { SxProps, Theme } from "@mui/material";

export interface Chat {
  id: string;
  secondaryId?: string;
  name?: string;
  chatPicture?: string;
  users: string[];
  group: boolean;
  unreadMessageCount: number;
}

export type ChatWithInterlocutor = Chat & { interlocutorId?: string };

export interface Message {
  id: string;
  sender: string;
  chat: string;
  group: boolean;
  content: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

export interface ChatMessages {
  [chat: string]: { messages: Message[] };
}

export interface User {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
  online: boolean;
  about: string;
}

export interface ChatUsers {
  [user: string]: User[];
}
export interface UserAuthInfo {
  username: string;
  password: string;
  cPassword?: string;
  name?: string;
  rememberUser?: boolean;
}

//an interlocutor is whichever user in a non-group chat
//that isn't the logged in user or current User

export type ChatContext = {
  chats: { [id: string]: ChatWithInterlocutor };
  setChats: React.Dispatch<
    React.SetStateAction<{ [id: string]: ChatWithInterlocutor }>
  >;
  currentChat: ChatWithInterlocutor | undefined;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>;
  isLoading: boolean;
  isError: boolean;
  revalidate: Function;
  chatListOpen: boolean;
  setChatListOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type ChatMessagesContext = {
  chatMessages: ChatMessages;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessages | undefined>>;
  isLoading: boolean;
  error: any;
  setError: React.Dispatch<React.SetStateAction<any>>;
};

export type Context<T> =
  | [T?, React.Dispatch<React.SetStateAction<T | undefined>>?];

export type StyleSheet = {
  [component: string]: React.CSSProperties | SxProps<Theme>;
};
