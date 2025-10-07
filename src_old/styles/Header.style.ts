import React from "react";
import { SxProps, Theme } from "@mui/material";

import { avatar } from "./Ichat.style";
// import theme from "@/themes/ichat";

export const root: SxProps<Theme> | undefined = {
  height: "3rem",
  boxShadow: "none",
  fontWeight: "bold",
};

export const toolbar: SxProps<Theme> = {
  paddingLeft: ".25rem !important",
};

export const logo: React.CSSProperties | undefined = {
  marginRight: "0.5rem",
  verticalAlign: "top",
};

export const logoContainer: SxProps<Theme> = {
  fontSize: 22,
  color: "#fff",
  padding: "1rem 0.5rem",
};

export const profilePicture = {
  ...avatar,
  height: 40,
  width: 40,
};
