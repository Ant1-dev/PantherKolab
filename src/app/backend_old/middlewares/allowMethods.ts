import { Handler, Request, Response } from "express";
export default function allowMethods(allowedMethods: string[], next) {
  return async function (req: Request, res: Response) {
    if (allowedMethods.includes(<string>req.method)) await next(req, res);
    else {
      res.status(405).json({
        message: `Method ${req.method} not allowed. Allowed metthods are ${allowedMethods}`,
      });
    }
  };
}
