import { UserAuthInfo, User, Chat, ChatWithInterlocutor } from "../models";
import axios, { axiosPrivate } from "../lib/axios";

import { validateInputs } from "../utils/validate";

class UserService {
  async login(input: UserAuthInfo): Promise<any> {
    if (!(input.username && input.password))
      return Promise.reject(new Error("Invalid Inputs"));

    const response = axios.post("/auth/login", input);

    return response
      .then(() => Promise.resolve())
      .catch((e) => Promise.reject(e.response.data));
  }

  async register(input: UserAuthInfo): Promise<any> {
    const { name, username, password, cPassword } = input;
    //Validate the user input
    try {
      validateInputs(name as string, username, password, cPassword as string);
    } catch (e) {
      return Promise.reject(e);
    }

    const response = axios.post("/auth/register", {
      name,
      username,
      password,
    });

    return response
      .then(({ data }) => data.accessToken)
      .catch((e) => Promise.reject(e.response.data));
  }

  async logout() {
    const { data } = await axios.post("/auth/logout", {});
    return data.accessToken;
  }

  async getUser(param?: string): Promise<User> {
    const response = axiosPrivate.get(`/users?param=${param}`);
    return response
      .then(({ data }) => Promise.resolve(data))
      .catch((err) => Promise.reject(err));
  }

  async setUser(user: User): Promise<any> {
    const response = axiosPrivate.post("/users", { updatedProfile: user });
    return response
      .then(({ data }) => Promise.resolve(data))
      .catch((err) => Promise.reject(err));
  }

  getChats(userId: string) {
    return async (url: string) => {
      // Get the chats
      const chats = await axiosPrivate.get<Chat[]>(url).then((res) => res.data);

      if (chats) {
        // if the isn't a group chat set the name and the chatPicture
        // properties of this chat to the name and profile picture
        // respectively of the user that is in the chat with the
        // app's current user
        const normalizedChats = chats.map(async (chat) => {
          if (!chat.group) {
            const otherUserId = chat.users.find((id) => id !== userId);
            const result = await userService
              .getUser(otherUserId)
              .then((otherUser) => ({
                ...chat,
                interlocutorId: otherUserId,
                name: otherUser.name,
                chatPicture: otherUser.profilePicture,
              }))
              .catch((err) => console.log(err));
            return result as ChatWithInterlocutor;
          } else return chat;
        });
        return await Promise.all(normalizedChats);
      }

      return Promise.resolve([]);
    };
  }

  async setChat(chat: Chat): Promise<string> {
    const id = await axiosPrivate
      .put<{ id: string }>("/chats", { chat })
      .then(({ data }) => data.id);
    return Promise.resolve(id);
  }
}

const userService = new UserService();
export default userService;
