import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@shared": path.resolve(__dirname, "../shared"),
        },
    },
    server: {
        port: 5173, // Frontend bu portta çalışacak
        proxy: {
            // Frontend'den gelen /api ile başlayan her şeyi Backend'e pasla
            '/api': {
                target: 'http://localhost:3000', // Backend portun (3000 yazıyordu sende)
                changeOrigin: true,
                secure: false,
            }
        }
    }
});