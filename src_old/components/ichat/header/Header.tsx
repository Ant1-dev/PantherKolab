import * as React from "react";
import useAppContext from "../../../hooks/useAppContext";
import { UserContext } from "../../../contexts";

//models
import { User, Context } from "../../../models";
// mui
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";

//styles
import * as styles from "../../../styles/Header.style";

import Profile from "./Profile";

// const lightColor = "rgba(255, 255, 255, 0.7)";

export default function Header() {
  const [user] = useAppContext(UserContext) as Context<User>;
  const [profileOpen, setProfileOpen] = React.useState(false);

  return (
    <React.Fragment>
      <AppBar color="secondary" position="fixed" elevation={1} sx={styles.root}>
        <Toolbar sx={styles.toolbar}>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Box sx={styles.logoContainer}>
                <img
                  src="/chat.png"
                  width="30"
                  height="30"
                  alt=""
                  style={styles.logo}
                />{" "}
                Ichat
              </Box>
            </Grid>
            <Grid item xs />

            <Grid item>
              <IconButton
                color="inherit"
                sx={{ p: 0.5 }}
                onClick={() => setProfileOpen(true)}
              >
                <Avatar
                  src={user?.profilePicture}
                  alt="My Avatar"
                  sx={styles.profilePicture}
                >
                  {user?.name.charAt(0)}
                </Avatar>
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Profile open={profileOpen} setOpen={setProfileOpen} />
    </React.Fragment>
  );
}
