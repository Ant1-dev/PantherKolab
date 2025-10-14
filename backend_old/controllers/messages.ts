import clientPromise from "../../lib/mongodb";

import authorize from "../middlewares/authorize";
import authenticate from "../middlewares/authenticate";
import allowMethods from "../middlewares/allowMethods";
import { Collection } from "mongodb";
import { Message } from "../models";

async function handler(req, res) {
  const client = await clientPromise;
  const messages: Collection<Message> = client
    .db("ichat")
    .collection("test_messages");

  switch (req.method) {
    //Getting messages
    case "GET":
      let result: Message[];

      try {
        const { chatId, lastMessageId: lastClientMessageId } = req.query;

        //If last MessageId is not provided, return all message in the corresponding chat
        const allMessages = await messages.find({ chat: chatId }).toArray();

        if (lastClientMessageId === "undefined") {
          result = allMessages;
        }

        //else check whether the database and the client have the same value for the last message
        //if they don't, load the latest messages. If not do nothing
        else {
          const lastDBMessageId = allMessages[allMessages.length - 1]?.id;
          if (lastClientMessageId !== lastDBMessageId) {
            const lastClientMessageIndex = allMessages.findIndex(
              (item) => item.id === lastClientMessageId
            );
            result = allMessages.slice(lastClientMessageIndex);
          } else result = [];
        }

        return res.status(200).json(result);
      } catch (err) {
        process.env.NODE_ENV !== "production" && console.log(err);
        res.status(500).json({ message: "Something went wrong", error: err });
      }
      break;

    // Saving a message
    case "POST":
      const { message } = req.body;

      //set the timestamp back to a date object
      message.timestamp = new Date(message.timestamp);
      try {
        messages.insertOne(message);
      } catch (err) {
        process.env.NODE_ENV !== "production" && console.log(err);
        res.status(500).json({ message: "Something went wrong", error: err });
      }
      res.status(200).json({ message: "saved message!" });
      break;
    //updating a message
    case "PUT":
      try {
        const messageId: string = req.body.message.id;
        await messages.updateOne({ id: messageId }, { $set: req.body.message });

        res.status(201).json({ message: "message updated" });
      } catch (e) {
        process.env.NODE_ENV !== "production" && console.log(e);
        res.status(500).json({ message: "unable to update message" });
      }
  }
}

export default allowMethods(
  ["GET", "POST", "PUT"],
  authenticate(authorize(handler))
);
