import React from "react";
//models
import { Context, User } from "../../../models";
//mui
import { Modal, Box, Avatar, Typography, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
//styles

import * as styles from "../../../styles/Profile.style";
import useAppContext from "../../../hooks/useAppContext";
import { UserContext } from "../../../contexts";
import userService from "../../../services/userService";

type UpdatedInfo = Partial<User & { updated: boolean }>;

function Profile({ open, setOpen }: any) {
  const [user, setUser] = useAppContext(UserContext) as Context<User>;
  const [updatedInfo, setUpdatedInfo] = React.useState<UpdatedInfo>({
    name: "",
    about: "",
    updated: false,
  });

  React.useEffect(() => {
    setUpdatedInfo({
      name: user?.name,
      about: user?.about,
    });
  }, [user]);

  const nameRef = React.useRef<HTMLInputElement>(null);
  const aboutRef = React.useRef<HTMLTextAreaElement>(null);

  const handleClose = React.useCallback(async () => {
    if (updatedInfo.updated) {
      userService.setUser({ ...(user as User), ...updatedInfo });
      setUser?.((user) => ({ ...(user as User), ...updatedInfo }));
    }
    setOpen(false);
  }, [user, updatedInfo, setUser, setOpen]);

  const handleEdit = React.useCallback(
    (ref: React.RefObject<HTMLElement>) => () => {
      //set the corresponding field's disabled attribute
      //and focus that field.
      setUpdatedInfo((prev) => ({ ...prev, updated: true }));
      ref.current?.removeAttribute("disabled");
      ref.current?.focus();
    },
    []
  );

  return (
    <Modal
      open={open}
      sx={styles.userProfileModal}
      onClose={handleClose}
      slots={{ backdrop: Backdrop }}
    >
      <Box sx={styles.profileBox}>
        <Avatar src={user?.profilePicture} alt="My Avatar" sx={styles.avatar}>
          {user?.name.charAt(0)}
        </Avatar>

        {/*name section */}
        <Box sx={styles.textEditable}>
          <input
            type="text"
            value={updatedInfo.name}
            onChange={(e) =>
              setUpdatedInfo((prev) => ({ ...prev, name: e.target.value }))
            }
            ref={nameRef}
            disabled
            style={{ fontSize: "20px" }}
          />
          <EditIcon onClick={handleEdit(nameRef)} />
        </Box>

        {/*About section */}
        <Box sx={styles.info}>
          <Typography component={"span"}>About</Typography>
          <Box sx={styles.textEditable}>
            <TextField
              multiline
              maxRows={4}
              value={updatedInfo?.about}
              onChange={(e) =>
                setUpdatedInfo((prev) => ({ ...prev, about: e.target.value }))
              }
              onBlur={(e) => e.target.setAttribute("disabled", "")}
              //   onKeyDown={handleEnter}
              disabled
              inputRef={aboutRef}
              variant="standard"
              sx={styles.textField}
            />
            <EditIcon onClick={handleEdit(aboutRef)} />
          </Box>
        </Box>

        {/*username section*/}
        <Box sx={styles.info}>
          <Typography component={"span"}>Username</Typography>
          <Typography>{user?.username}</Typography>
        </Box>
      </Box>
    </Modal>
  );
}

function Backdrop(props: any) {
  const { ownerState, ...rest } = props;
  return <Box style={styles.modalBackdrop} {...rest} />;
}
export default Profile;
