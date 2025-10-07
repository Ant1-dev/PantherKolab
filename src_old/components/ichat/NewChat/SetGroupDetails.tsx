import React from "react";

import useAppContext from "../../../hooks/useAppContext";
import { ChatContext, UserContext } from "../../../contexts";

//utils
import contentService from "../../../services/contentService";
//mui
import { Button, Typography, Box, TextField } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
// import red from "@mui/material/colors/red";

//models
import { ChatContext as ChatContextType, User } from "../../../models";

//styles
import * as styles from "../../../styles/NewChat.style";

interface SetGroupDetailsProps {
  selectedUsers: User[];
  setSlide: React.Dispatch<React.SetStateAction<0 | 1 | 2>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose: () => void;
}

function SetGroupDetails({
  setSlide,
  selectedUsers,
  setOpen,
  handleClose,
}: SetGroupDetailsProps) {
  const [groupName, setGroupName] = React.useState("");
  const { setCurrentChat, setChats } = useAppContext(
    ChatContext
  ) as ChatContextType;
  const currentUserId = useAppContext(UserContext)?.[0]?.id as string;

  //todo: Save new chats to database
  async function createGroupHandler() {
    if (groupName) {
      let chatData = {
        name: groupName,
        users: selectedUsers,
        currentUserId,
        chatPicture: "",
      };

      contentService
        .createNewChat(chatData, true)
        .then((chat) => {
          chat.secondaryId = chat.id;
          setChats((prev) => ({ [chat.id]: chat, ...prev }));
          setCurrentChat(chat);

          handleClose();
        })
        .catch(() => {
          //todo handle create chat errors
        });
    }
  }

  return (
    <>
      <Box sx={styles.groupChatHeader}>
        <Button onClick={() => setSlide(0)}>
          <ArrowBackIcon />
        </Button>
        <Typography component={"h4"}>New group</Typography>
      </Box>

      {/*Selected users list*/}
      <Box sx={styles.selectedUsers} className="niceScrollbar">
        {selectedUsers.map((user, i) => (
          <Button sx={styles.selectedUser} key={i}>
            {user.name}
          </Button>
        ))}
      </Box>

      {/* Add group chat icon */}
      <Box sx={styles.addGroupChatIcon}>
        <Button>
          <CameraIcon />
        </Button>
        <Typography component="span">
          Add group icon{" "}
          <Typography component={"span"} sx={{ opacity: "0.7" }}>
            (optional)
          </Typography>
        </Typography>
      </Box>

      {/* Group name */}
      <Typography>Provide a group name</Typography>
      <TextField
        required
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Enter a group name"
        sx={styles.usernameTextField}
      ></TextField>

      {/* {!groupName && false && (
        <Typography color={red[400]} sx={{display: submitted}}>
          Please provide a name for your group
        </Typography>
      )} */}

      {/* cancel or create group chat */}
      <Box sx={{ ...styles.nextCancelButtons, marginTop: "1rem" }}>
        <Button className="next" onClick={createGroupHandler}>
          Create
        </Button>
        <Button className="cancel" onClick={() => setSlide(0)}>
          Cancel
        </Button>
      </Box>
    </>
  );
}

export default SetGroupDetails;
