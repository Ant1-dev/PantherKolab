import React from "react";

import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

//utils & hooks
import userService from "../../services/userService";
import { findExistingUsername } from "../../utils/findExistingUsername";
import useAppContext from "../../hooks/useAppContext";
import { AuthContext } from "../../contexts";
import * as styles from "../../styles/UnauthApp.style";
import { Context } from "../../models";
interface FormLoginProps {
  create: boolean;
  setStatus: Function;
  setError: Function;
}

function FormLogin({ create = false, setError, setStatus }: FormLoginProps) {
  const [, setAuth] = useAppContext(AuthContext) as Context<boolean>;
  const [checked, setChecked] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [cPassword, setCPassword] = React.useState("");
  const [name, setName] = React.useState("");

  const label = create ? "Signup" : "Login";

  const handleRegister = () => {
    setStatus("fetching");
    userService
      .register({
        name,
        username,
        cPassword,
        password,
      })
      .then(() => {
        setAuth?.(true);
        setError(null);
      })
      .catch((err: any) => {
        setError(err);
      })
      .finally(() => setStatus("done"));
  };

  const handleLogin = async () => {
    setStatus("fetching");
    userService
      .login({ username, password, rememberUser: checked })
      .then(() => {
        setAuth?.(true);
        setError(null);
      })
      .catch((err: any) => {
        setError(err);
      })
      .finally(() => {
        setStatus("done");
      });
  };

  //submit the form when user presses Enter
  const handleEnter = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (!/Enter|NumpadEnter/.test(e.key)) return;
    if (create) handleRegister();
    else handleLogin();
  };

  const handleUsernameChange = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (username && create && (await findExistingUsername(username)))
      setError({ message: "Username already exists" });
    else setError(null);
  };

  return (
    <form
      style={styles.root}
      noValidate
      autoComplete="off"
      onKeyDown={handleEnter}
    >
      {create ? (
        <TextField
          id="name"
          label="Name"
          variant="filled"
          color="primary"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      ) : null}
      <TextField
        id="username"
        label="Username"
        autoComplete="username"
        variant="filled"
        color="primary"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onBlur={handleUsernameChange}
      />
      <TextField
        id="password"
        type="password"
        autoComplete="current-password"
        label="Password"
        color="primary"
        variant="filled"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {create ? (
        <TextField
          id="password"
          type="password"
          color="primary"
          label="Confirm Password"
          variant="filled"
          value={cPassword}
          onChange={(e) => setCPassword(e.target.value)}
        />
      ) : null}
      {create ? (
        <>
          <Button
            style={styles.submit}
            variant="contained"
            color="primary"
            onClick={handleRegister}
          >
            {label}
          </Button>

          <small style={styles.small}>
            This page is protected by Google reCAPTCHA
          </small>
        </>
      ) : (
        <>
          <Button
            style={styles.submit}
            variant="contained"
            color="primary"
            onClick={handleLogin}
          >
            {label}
          </Button>
          <div>
            {" "}
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    name="checkedA"
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                  />
                }
                label={
                  <Typography
                    component={"span"}
                    color="secondary"
                    style={styles.checkBoxText}
                  >
                    Remember me
                  </Typography>
                }
              />
            </FormGroup>
          </div>
        </>
      )}
    </form>
  );
}

export default FormLogin;
