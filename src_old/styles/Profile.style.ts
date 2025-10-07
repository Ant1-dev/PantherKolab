import React from "react";
import { SxProps, Theme } from "@mui/material";
import theme from "../themes/ichat";

export const userProfileModal: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  margin: "2.5rem 2.5rem 0 0",
  [theme.breakpoints.down(500)]: {
    margin: "2.5rem auto",
  },
};

export const chatProfileModal: SxProps<Theme> = {
  margin: "2.5rem 2.5rem 0 0",
  [theme.breakpoints.down(800)]: {
    marginRight: 0,
  },

  "& .profileBox": {
    position: "absolute",
    top: "4.5rem",
    left: "25rem",
    [theme.breakpoints.down(800)]: {
      width: "calc(100vw - 300px - 4rem)",
      position: "absolute",
      top: "4.5rem",
      left: "calc(300px + 3rem)",
    },

    [theme.breakpoints.down(616)]: {
      width: "70%",
      position: "static",
      margin: "4.5rem auto",
    },

    [theme.breakpoints.down(500)]: {
      width: "95%",
    },
  },
};

export const profileBox: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  borderRadius: "20px",
  background: "var(--light_gray)",
  width: "25rem",
  minHeight: "20rem",
  height: "fit-content",
  padding: "10px 10px",
  boxShadow: "-1px 1px 10px #000",
  [theme.breakpoints.down(500)]: {
    width: "95%",
    margin: "0.5rem auto",
  },
};

export const modalBackdrop: React.CSSProperties = {
  zIndex: -1,
  position: "fixed",
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: "rgba(0, 0, 0, 0.1)",

  // "-webkit-tap-highlight-color": "transparent",
};

export const avatar: SxProps<Theme> = {
  width: "5rem",
  height: "5rem",
  cursor: "pointer",
  alignSelf: "center",
  marginBottom: "5px",
  textTransform: "capitalize",
};

export const info: SxProps<Theme> = {
  display: "flex",
  alignSelf: "flex-start",
  flexDirection: "column",
  justifyContent: "flex-start",
  width: "100%",
  "& span": {
    opacity: "0.6",
  },
  "& *": { wordWrap: "break-word", overflowWrap: "anywhere" },
};

export const textEditable: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "15px",

  "& input": {
    fontFamily: "inherit",
    border: "none",
    fontSize: "16px",
    height: "24px",
    background: "transparent",
    color: "white",
  },
};

export const textField: SxProps<Theme> = {
  border: "none",
  width: "100%",
  fontSize: "15px",
  marginRight: "15px",

  "& textarea:focus": {
    outline: "1px solid white",
    borderRadius: "5px",
    padding: "0 5px",
  },

  "& textarea.Mui-disabled": {
    color: "white",
    "-webkit-text-fill-color": "white",
  },

  "& textarea::-webkit-scrollbar": {
    width: "3px",
  },
  "& textarea::-webkit-scrollbar-thumb": {
    backgroundColor: "#9f9f9f",
    borderRadius: "20px",
    borderColor: "transparent",
  },

  "& div:before, & div:after": {
    border: "none!important",
  },
};

export const name: SxProps<Theme> = {
  fontSize: "20px",
  textTransform: "capitalize",
};
