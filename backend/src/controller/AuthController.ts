import type { Request, Response } from "express";
import { AuthService } from "../service/AuthService.js";

const authService = new AuthService();

export class AuthController {
    public async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;

        //validasyon eksik alan var mı
        if (!email || !password) {
            res.status(400).json({ success: false, message: "eksik alan" })
            return;
        }

        // service soralım bu kullanıcı var mı diye

        const token = await authService.login(email, password);

        if (!token) {
            res.status(401).json({ success: false, message: "yanlış email veya şifre" })
            return;
        }

        // başarılı tokenı dön
        res.json({
            success: true,
            message: "login başarılı",
            token,
        });

    }

}