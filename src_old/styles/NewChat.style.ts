// import { Theme, SxProps } from "@mui/material";
import theme from "../themes/ichat";
import { alpha } from "@mui/material/styles";

export const newChatModal = {
  width: "5rem",
  height: "fit-content",
  maxHeight: "10rem",
  background: "white",
};

export const newChatBox = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  marginTop: "5rem",
  marginLeft: "300px",
  borderRadius: "20px",
  background: "var(--dark_gray)",
  width: "24rem",
  maxHeight: "30rem",
  height: "fit-content",
  padding: "10px 10px",
  boxShadow: "-1px 1px 10px #000",
  [theme.breakpoints.down(695)]: {
    margin: "6rem auto",
    width: "70%",
  },

  [theme.breakpoints.down(500)]: {
    width: "95%",
  },
};
export const newChatHeader = {
  marginLeft: "10px",
  fontWeight: "bold",
  fontSize: "1.2rem",
};

export const groupChatHeader = {
  display: "flex",
  gap: "5px",
  alignItems: "center",
  "& button": {
    padding: "6px",
    minWidth: "32px",
  },

  "& h4": {
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
};

export const usernameTextField = {
  paddingRight: "10px",
  marginBottom: "0.25rem",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d7d7d7 !important",
  },
  "& input": { height: "0.5rem", color: "#fff" },
};

export const groupChatButton = {
  display: "flex",
  gap: "1rem",
  alignItems: "center",
  padding: "0.5rem 0.5rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  "&:hover": {
    bgcolor: "rgba(255, 255, 255, 0.08)",
  },
};

export const groupChatIcon = {
  background: theme.palette.primary.main,
};

export const selectedUsers = {
  padding: "2px 2px 1px 2px",
  border: "1px solid #d7d7d7",
  minHeight: "2.5rem",
  maxHeight: "5rem",
  borderRadius: "4px",
  overflow: "auto",
};

export const selectedUser = {
  padding: "0.5px",
  margin: "0 3px 3px 1px",
  height: "1.75rem",
  borderRadius: "5px",
  position: "static",
  background: alpha(theme.palette.primary.main, 0.7),
  color: "#fff",

  "&:hover": {
    background: alpha(theme.palette.primary.main, 0.6),
  },
};

export const userList = {
  overflowY: "auto",
  paddingRight: "3px",
};

export const userListItem = {
  gap: "8px",
  paddingLeft: 0.5,

  "&:hover": { background: "rgba(255, 255, 255, 0.08)" },
};

export const userDetails = {
  width: "100%",
  display: "flex",
  gap: "1rem",
  alignItems: "center",
  justifyContent: "space-between",

  "& .text": {
    display: "flex",
    flexDirection: "column",
  },
};

export const userListItemCheckBox = {
  "& .MuiSvgIcon-root": { fontSize: 28 },
  color: "#fff8",
};

export const nextCancelButtons = {
  display: "flex",
  justifyContent: "center",
  gap: "1rem",
  marginBottom: "0.5rem",

  "& button": {
    padding: "1px 1rem",
    borderRadius: "5px",
  },
  "& .cancel": {
    color: "white",
    background: "#323232",
  },

  "& .next": {
    background: alpha(theme.palette.primary.main, 0.7),
    color: "white",
  },
};

export const addGroupChatIcon = {
  margin: "1rem 0 1rem 0.5rem",

  "& button": {
    padding: "6px",
    minWidth: "32px",
    marginRight: "0.5rem",
  },
};
