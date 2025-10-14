import express from "express";
import messages from "../controllers/messages";
import chats from "../controllers/chats";
import users from "../controllers/users";
import searchUser from "../controllers/search/user";
import login from "../controllers/auth/login";
import logout from "../controllers/auth/logout";
import refresh from "../controllers/auth/refresh";
import register from "../controllers/auth/register";

import { PORT } from "..";
const router = express.Router();

//auth
router.get("/auth/login", (req, res) => {
  res.write(`<h1>THis is /auth/login test</h1>`);
  res.end();
});
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.post("/auth/refresh", refresh);
router.post("/auth/register", register);

router.get("/search/:user", searchUser);

//chats
router.use("/chats", chats);

//messages
router.use("/messages", messages);

//users
router.use("/users", users);

//tests
router.use("/test", (req, res) => {
  res.write("here boy");
  res.end();
});
router.get("/", (req, res) => {
  res.write(`<h1>Socket.io start on Port: ${PORT}</h1>`);
  res.end();
});

export default router;
