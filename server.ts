/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
console.log("Loading env from:", envPath);

dotenv.config({ path: envPath });

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import {
  authenticateSocket,
  getAuthenticatedUserId,
} from "./src/lib/socket/socketAuthMiddleware.js";

declare global {
  // attach io to global to allow access throughout the app

  var io: Server | undefined;
}

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "pantherkolab.com";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || "/", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: [
        "https://pantherkolab.com",
        "https://www.pantherkolab.com",
        dev ? `http://${hostname}:${port}` : undefined,
      ].filter(Boolean) as string[],
      methods: ["GET", "POST"],
    },
  });

  global.io = io;

  // Apply authentication middleware to all connections
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = getAuthenticatedUserId(socket);
    console.log(`✅ Client connected: ${socket.id} (user: ${userId})`);

    // Join user to their personal room (supports multiple devices)
    socket.join(`user:${userId}`);
    console.log(`📱 User ${userId} joined room: user:${userId}`);

    //Dynamically importing these because we want to make sure the .env variables load first
    //from dotenv()
    import("@/lib/socket/callSocket.js").then((module) =>
      module.initializeCallSocket(socket, io)
    );
    import("@/lib/socket/messageSocket.js").then((module) =>
      module.initializeMessageSocket(socket, io)
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log("> Socket.IO initialized");
  });

  server.on("error", (err: any) => {
    console.error("Server error:", err);
    process.exit(1);
  });
});
