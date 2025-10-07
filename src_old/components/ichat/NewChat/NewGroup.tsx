import React from "react";
import useSearch from "../../../hooks/useSearch";

//models
import { User } from "../../../models";
//mui
import { Box, Typography, List, Button, TextField } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
//styles
import * as styles from "../../../styles/NewChat.style";

//my components
import UserListItem from "./UserListItem";

interface NewGroupProps {
  username: string;

  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setSlide: React.Dispatch<React.SetStateAction<0 | 1 | 2>>;
  selectedUsers: User[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

function NewGroup({
  username,
  setUsername,
  setSlide,
  selectedUsers,
  setSelectedUsers,
}: NewGroupProps) {
  const addUser = (user: User) => setSelectedUsers((prev) => [...prev, user]);
  const removeUser = (user: User) =>
    setSelectedUsers((prev) => prev.filter((item) => item.id !== user.id));

  const searchResults = useSearch(username);

  return (
    <>
      <Box sx={styles.groupChatHeader}>
        <Button onClick={() => setSlide(0)}>
          <ArrowBackIcon />
        </Button>
        <Typography component={"h4"}>New group</Typography>
      </Box>

      <TextField
        type="text"
        placeholder="Type a username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={styles.usernameTextField}
      />

      {/* Next and Cancel buttons */}
      {/*Selected users list*/}
      {selectedUsers.length > 0 && (
        <>
          <Box sx={styles.nextCancelButtons}>
            <Button className="next" onClick={() => setSlide(2)}>
              Next
            </Button>
            <Button className="cancel" onClick={() => setSlide(0)}>
              Cancel
            </Button>
          </Box>

          <Box sx={styles.selectedUsers} className="niceScrollbar">
            {selectedUsers.map((user, i) => (
              <Button sx={styles.selectedUser} key={i}>
                {user.name}
              </Button>
            ))}
          </Box>
        </>
      )}

      {/* user results list */}
      <List sx={styles.userList} className="niceScrollbar">
        {searchResults.length > 0 ? (
          searchResults.map((user) => (
            <UserListItem
              user={user}
              isGroup={true}
              addUser={addUser}
              removeUser={removeUser}
              key={user.id}
              selected={selectedUsers.some((item) => item.id === user.id)}
            />
          ))
        ) : (
          <Typography component={"span"}>No results</Typography>
        )}
      </List>
    </>
  );
}

export default NewGroup;
