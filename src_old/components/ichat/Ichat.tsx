import * as React from "react";
import type { User, Context } from "../../models";
//utils && hooks
import userService from "../../services/userService";
import useAppContext from "../../hooks/useAppContext";
import { ChatUsersContext, UserContext } from "../../contexts";
import ContextProvider from "../../components/providers/ContextProvider";
import ChatMessagesProvider from "../../components/providers/ChatMessagesProvider";

//mui
// import useMediaQuery from "@mui/material/useMediaQuery";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

//My Components
import ChatList from "./chatList/ChatList";
import Chat from "./chat/Chat";
import Header from "./header/Header";
// import Copyright from "./Copyright";

//styles
import { main } from "../../styles/Ichat.style";

import Sidebar from "./Sidebar";
import SocketIoProvider from "../providers/SocketIoProvider";
import ChatProvider from "../../components/providers/ChatProvider";

export default function Ichat() {
  // const [mobileOpen, setMobileOpen] = React.useState(false);
  // const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  // const handleDrawerToggle = () => {
  //   setMobileOpen(!mobileOpen);
  // };
  const [, setUser] = useAppContext(UserContext) as Context<User>;

  React.useEffect(() => {
    //get the user's info once he's logged in
    userService
      .getUser()
      .then((user) => {
        setUser?.(user);
      })
      .catch((err) => console.error("user not found", err)); //TODO set error state
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Main />
    </>
  );
}

function Main() {
  return (
    <>
      <ChatProvider>
        <ChatMessagesProvider>
          <ContextProvider context={ChatUsersContext}>
            <SocketIoProvider>
              <Box sx={main}>
                <ChatList />
                <Chat />
              </Box>
            </SocketIoProvider>
          </ContextProvider>
        </ChatMessagesProvider>
      </ChatProvider>
    </>
  );
}
