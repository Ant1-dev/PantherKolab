import React from "react";

// hooks, utils, context
import useAppContext from "../../hooks/useAppContext";
import { AuthContext } from "../../contexts";

// models
import { Context } from "../../models";
//material ui

import Button from "@mui/material/Button";
import { Typography, Box } from "@mui/material";
import Alert from "@mui/material/Alert";
import FormLogin from "./FormLogin";
import Spinner from "../../components/Spinner";

// services  & utils
import autoLogin from "../../utils/autoLogin";
import * as styles from "../../styles/UnauthApp.style";

function UnauthApp() {
  const [create, setCreate] = React.useState(false);
  const [error, setError] = React.useState<Error>();
  const [status, setStatus] = React.useState<"fetching" | "done" | "idle">("idle");
  const [, setAuth] = useAppContext(AuthContext) as Context<boolean>;

  //try login in directly with refresh token
  React.useEffect(() => {
    setStatus("fetching");
    autoLogin()
      .then(() => {
        setAuth?.(true);
      })
      .catch(
        (err: any) => process.env.NODE_ENV !== "production" && console.log(err)
      )
      .finally(() => {
        setStatus("done");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = create ? "Signup" : "Login";

  return (
    <div>
      <img src="chat.png" alt="Ichat logo" style={styles.logo} className="logo" />

      <Box sx={styles.dialog}>
        <Typography id="alert-dialog-title" variant="h5" color="primary">
          {label}
        </Typography>

        <Box sx={styles.dialogContent}>
          <FormLogin create={create} setError={setError} setStatus={setStatus} />
          {error ? (
            <Alert severity="error">
              <>
                Error :{" "}
                {error.message ||
                  "Oops an error occurred please refresh the page."}
              </>
            </Alert>
          ) : null}
        </Box>
        <Box sx={styles.dialogActions}>
          {!create ? (
            <Button onClick={() => setCreate(true)} color="primary">
              New on Ichat ? {<Spinner isLoading={status === "fetching"} />}
            </Button>
          ) : (
            <Button onClick={() => setCreate(false)} autoFocus color="primary">
              Already have an account ?{" "}
              {<Spinner isLoading={status === "fetching"} />}
            </Button>
          )}
        </Box>
      </Box>
    </div>
  );
}
export default UnauthApp;
