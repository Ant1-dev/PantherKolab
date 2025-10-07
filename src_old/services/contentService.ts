import { axiosPrivate } from "../lib/axios";
import { Message, User, Chat } from "../models";
import { v4 as uuid4 } from "uuid";
// interface key {
//   url: string;
//   chatId: string;
// }

interface CreateChatData {
  users: User[];
  name?: string;
  chatPicture?: string;
  currentUserId: string;
}
class ContentService {
  async getMessages(chatId: string, lastMessageId?: string): Promise<Message[]> {
    // Get the messages
    let messages: Message[] = [];
    await axiosPrivate
      .get<Message[]>(`/messages?chatId=${chatId}&lastMessageId=${lastMessageId}`)
      .then((res) => {
        messages = res.data;
      })
      .catch((e) => {
        process.env.NODE_ENV !== "production" && console.log(e);
      });

    return messages as Message[];
  }

  async createNewChat(data: CreateChatData, isGroup: boolean) {
    let chat: Partial<Chat> & { interlocutorId: string };
    const id = uuid4();
    const users = data.users.map((user) => user.id);

    chat = {
      id: id,
      users: [...users, data.currentUserId],
      group: isGroup,
      chatPicture: data.chatPicture || "",
      name: data.name || "",
      interlocutorId: !isGroup ? users[0] : "",
    };

    const result = axiosPrivate.post("/chats", { data: chat });
    return result
      .then(({ data }) => data)
      .catch((e) => {
        process.env.NODE_ENV !== "production" && console.log(e);
      });
  }
}

const contentService = new ContentService();
export default contentService;
