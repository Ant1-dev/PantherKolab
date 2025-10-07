import React from "react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Grid from "@mui/material/Grid";

//styles
import { sidebar } from "../../styles/Ichat.style";
function Sidebar() {
  return (
    <AppBar color="secondary" sx={sidebar}>
      <Toolbar>
        <Grid container spacing={1} alignItems="center"></Grid>
      </Toolbar>
    </AppBar>
  );
}

export default Sidebar;
