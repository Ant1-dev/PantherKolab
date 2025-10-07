import "./styles/globals.css";
import styles from "./styles/Home.module.css";
import React from "react";
import UnauthApp from "./components/unauthApp/UnauthApp";
import Ichat from "./components/ichat/Ichat";
import { UserContext, AuthContext } from "./contexts";
import { ThemeProvider } from "@mui/material/styles";
// hooks
import useAppContext from "./hooks/useAppContext";
import ContextProvider from "./components/providers/ContextProvider";
//styles
import theme from "./themes/ichat";
import { Context } from "./models";

export default function Home() {
  const [auth] = useAppContext(AuthContext) as Context<boolean>;

  return (
    <>
      <ThemeProvider theme={theme}>
        {auth ? (
          <ContextProvider context={UserContext}>
            <Ichat />
          </ContextProvider>
        ) : (
          <main className={styles.main}>
            {/* <div className={styles.header}>
              <h1>Ichat</h1>
            </div> */}
            <UnauthApp />
          </main>
        )}
      </ThemeProvider>
    </>
  );
}
