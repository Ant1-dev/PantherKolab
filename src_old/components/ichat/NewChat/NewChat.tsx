import React from "react";

import UserListItem from "./UserListItem";
import useSearch from "../../../hooks/useSearch";

//mui
import { Box, TextField, Avatar, Typography, List } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";

//styles
import * as styles from "../../../styles/NewChat.style";

function NewChat({ username, setUsername, setSlide, setOpen }: any) {
  const searchResults = useSearch(username);

  return (
    <>
      <Typography component="h4" sx={styles.newChatHeader}>
        New Chat
      </Typography>

      <TextField
        type="text"
        placeholder="Type a username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={styles.usernameTextField}
        // inputProps={{}
      />

      {/*New group chat button*/}

      <Box sx={styles.groupChatButton} onClick={() => setSlide(1)}>
        <Avatar sx={styles.groupChatIcon}>
          <GroupIcon />
        </Avatar>
        <Typography> New group chat</Typography>
      </Box>
      {/* user results list */}
      <List sx={styles.userList} className="niceScrollbar">
        {searchResults.length > 0 ? (
          searchResults.map((user) => (
            <UserListItem
              user={user}
              isGroup={false}
              key={user.id}
              setOpen={setOpen}
            />
          ))
        ) : (
          <Typography component={"span"}>No results</Typography>
        )}
      </List>
    </>
  );
}
export default NewChat;
