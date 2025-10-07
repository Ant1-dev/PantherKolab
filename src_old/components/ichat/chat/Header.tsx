import * as React from "react";
import useAppContext from "../../../hooks/useAppContext";
import { ChatContext } from "../../../contexts";

//models
import { ChatContext as ChatContextType } from "../../../models";
// mui
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import { Typography } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBack from "@mui/icons-material/ArrowBack";
//styles
import * as styles from "../../../styles/Chat.style";
import { avatar } from "../../../styles/Ichat.style";
import ChatProfile from "./chatProfile";

export default function ChatHeader() {
  const { currentChat, setChatListOpen } = useAppContext(
    ChatContext
  ) as ChatContextType;
  const [chatProfileOpen, setChatProfileOpen] = React.useState(false);

  return (
    <React.Fragment>
      <AppBar elevation={1} sx={styles.header}>
        <Toolbar sx={styles.toolbar}>
          <Grid container spacing={1} alignItems="center">
            <ArrowBack
              sx={styles.backButton}
              onClick={() => setChatListOpen(true)}
            />
            <Grid item onClick={() => setChatProfileOpen(true)}>
              <IconButton color="inherit">
                <Avatar
                  src={currentChat?.chatPicture}
                  alt={currentChat?.name}
                  sx={avatar}
                >
                  {currentChat?.group ? (
                    <GroupIcon />
                  ) : (
                    currentChat?.name?.charAt(0)
                  )}
                </Avatar>
              </IconButton>
              <Typography component={"span"} textTransform={"capitalize"}>
                {currentChat?.name}
              </Typography>
            </Grid>
            <Grid item xs />

            <Grid item></Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <ChatProfile open={chatProfileOpen} setOpen={setChatProfileOpen} />
    </React.Fragment>
  );
}
