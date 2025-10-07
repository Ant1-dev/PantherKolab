import React from "react";
//models

import { ChatContext as ChatContextType, Context, User } from "../../../models";
import {
  ListItemButton,
  IconButton,
  Typography,
  Avatar,
  Checkbox,
  Box,
} from "@mui/material";

//utils
import contentService from "../../../services/contentService";

//styles
import * as styles from "../../../styles/NewChat.style";
import useAppContext from "../../../hooks/useAppContext";
import { ChatContext, UserContext } from "../../../contexts";

function UserListItem({
  user,
  addUser,
  removeUser,
  isGroup,
  selected,
  setOpen,
}: any) {
  const [checked, setChecked] = React.useState(selected);
  const [currentUser] = useAppContext(UserContext) as Context<User>;
  const { setChats, setCurrentChat, chats } = useAppContext(
    ChatContext
  ) as ChatContextType;

  const handleClick = () => {
    if (isGroup) {
      setChecked(!checked);
      if (checked) {
        removeUser(user);
      } else addUser(user);
    } else {
      if (chats[user.id]) {
        setCurrentChat(chats[user.id]);
        setOpen(false);
      } else {
        contentService
          .createNewChat(
            {
              users: [user],
              currentUserId: currentUser?.id as string,
            },
            false
          )
          .then((chat) => {
            chat.secondaryId = user.id;
            setChats((prev) => ({ [user.id]: chat, ...prev }));
            setCurrentChat(chat);
            setOpen(false);
          })
          .catch((e) => process.env.NODE_ENV !== "production" && console.log(e));
        //TODO handle errors to display appropriate user-friendly messages
      }
    }
  };

  return (
    <ListItemButton sx={styles.userListItem} onClick={handleClick}>
      <IconButton color="inherit" sx={{ p: 0.5 }}>
        <Avatar alt={""} src={user.profilePicture}>
          {user.name[0].toUpperCase()}
        </Avatar>
      </IconButton>
      <Box sx={styles.userDetails}>
        <Box className={"text"}>
          <Typography component="span">{user.name} </Typography>
          <Typography component="span" sx={{ fontSize: "0.8rem" }}>
            @{user.username}{" "}
          </Typography>
        </Box>

        {isGroup && (
          <Checkbox sx={styles.userListItemCheckBox} checked={checked} />
        )}
      </Box>
    </ListItemButton>
  );
}

export default UserListItem;
