import { SxProps, Theme } from "@mui/material";
import theme from "../themes/ichat";

export const sidebar: SxProps<Theme> = {
  width: "3rem",
  height: "100rem",
  left: 0,
  zIndex: 1,
  boxShadow: "none",
  justifyContent: "space-around",
  alignItems: "center",

  //mobile phone style
  [theme.breakpoints.down(616)]: {
    display: "none",
  },
};

export const chat = (chatListOpen: boolean): SxProps<Theme> => {
  return {
    flex: 1,

    position: "relative",
    //change background position to "cover" on smaller devices
    background: `url(background.png)  fixed`,

    [theme.breakpoints.down(786)]: {
      backgroundSize: "cover",
    },
    [theme.breakpoints.down(615)]: {
      width: "100vw",
      height: "calc(100vh - 3rem)",
      position: chatListOpen ? "relative" : "fixed",
      bottom: 0,
    },
  };
};

export const main: SxProps = {
  display: "flex",
  overflow: "hidden",
  marginTop: "3rem",
  marginLeft: "3rem",
  height: "calc(100vh - 3rem)",

  [theme.breakpoints.down(616)]: {
    display: "block",
    marginLeft: 0,
  },
};

export const avatar: SxProps<Theme> = {
  textTransform: "uppercase",
  background: "#444",
  height: 48,
  width: 48,
};

export const emptyChatArea: SxProps<Theme> = {
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  justifyContent: "center",
  alignItems: "center",
  color: "#d7d7d7",
  textAlign: "center",

  background: "var(--light_gray)",
  "& h3": {
    color: "white",
    fontWeight: "bold",
  },
  "& p": {
    margin: "0 10px",
  },
  userSelect: "none",
  pointerEvents: "none",
};
