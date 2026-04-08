import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../service/AuthService.js"; // token kontrolü için

const authService = new AuthService();

export const securityMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const ticket = req.headers["authorization"];// http isteğinin header kısmından authorization bilgisini alır authorization:"Bearer <token>" şeklinde gelir
    if (!ticket) return res.status(403).send("Biletin yok, giremezsin!");

    const token = ticket.split(" ")[1];// Bearer <token> kısmından tokenı alır
    if (!token) return res.status(403).send("Biletin yok , giremezsin!");
    const verification = authService.CheckTicket(token); // tokenı doğrular
    // verification payload döndürür yada null payload döndürüyorsa yani null değilse 
    if (verification) {
        (req as any).user = verification;
        next();
    } else {
        res.status(401).send("Biletin sahte veya süresi dolmuş!");
    }
};
