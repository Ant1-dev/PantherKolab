// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { Request, Response } from "express";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import allowMethods from "../middlewares/allowMethods";
type Data = {
  name: string;
};

// export default authenticate(
//   authorize(function handler(req: Request, res:Response<Data>) {
//     res.status(200).json({ name: "John Doe" });
//   })
// );
export default allowMethods(["GET"], (req: Request, res: Response<Data>) => {
  // res.status(200).json({ name: "John Doe" });
  res.write("Here it works");
});
