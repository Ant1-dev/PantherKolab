import { ListItem, ListItemProps } from "@mui/material";
import React from "react";

interface CustomListItemProps extends Omit<ListItemProps, "title"> {
  title?: string;
}

const CustomListItem = (props: CustomListItemProps) => {
  return <ListItem title=" " {...props} />;
};

export default CustomListItem;
