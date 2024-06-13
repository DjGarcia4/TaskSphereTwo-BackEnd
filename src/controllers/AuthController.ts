import { Request, Response } from "express";
import User from "../models/User";
import { hashPassword } from "../utils/auth";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const user = new User(req.body);
      const { password } = user;
      user.password = await hashPassword(password);
      await user.save();
      res.send("Cuenta registrada, revisa tu email para confirmarla");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
