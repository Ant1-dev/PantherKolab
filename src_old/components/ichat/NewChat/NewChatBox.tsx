import React from "react";
//models
import { User } from "../../../models";
//mui
import { Modal, Box } from "@mui/material";

//styles
import * as styles from "../../../styles/NewChat.style";

import NewChat from "./NewChat";
import NewGroup from "./NewGroup";
import SetGroupDetails from "./SetGroupDetails";

function NewChatBase({ open, setOpen }: any) {
  const [username, setUsername] = React.useState("");

  const [slide, setSlide] = React.useState<0 | 1 | 2>(0);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);

  const handleClose = () => {
    setSelectedUsers([]);
    setUsername("");
    setSlide(0);
    setOpen(false);
  };

  const slides = [
    <NewChat
      key={0}
      username={username}
      setUsername={setUsername}
      setSlide={setSlide}
      setOpen={setOpen}
    />,
    <NewGroup
      key={1}
      username={username}
      setUsername={setUsername}
      setSlide={setSlide}
      selectedUsers={selectedUsers}
      setSelectedUsers={setSelectedUsers}
    />,
    <SetGroupDetails
      key={2}
      selectedUsers={selectedUsers}
      setSlide={setSlide}
      setOpen={setOpen}
      handleClose={handleClose}
    />,
  ];

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={styles.newChatBox}>{slides[slide]}</Box>
    </Modal>
  );
}

export default NewChatBase;
