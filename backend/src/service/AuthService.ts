import jwt from "jsonwebtoken"; //dijital imzalı tokenlar oluşturmak için

// token içerisnde taşınan bilgiler
interface JwtPayload {
    id: string;
    user: string;

}
// env den okunan kullanıcı yapısı

interface EnvUser {
    id: string;
    email: string;
    password: string;
    name: string;
}
// jwt secret kontrolü

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET ortam değişkeni tanımlı değil! .env dosyasını kontrol et");

}

//kullanıcıları .env den getir

function EnvGetUsers(): EnvUser[] {
    const users: EnvUser[] = [];
    let index = 1;

    while (process.env[`USER${index}_EMAIL`]) {
        users.push({
            id: process.env[`USER${index}_ID`]!,
            email: process.env[`USER${index}_EMAIL`]!,
            password: process.env[`USER${index}_PASSWORD`]!,
            name: process.env[`USER${index}_NAME`]!,

        })
        index++;
    }

    if (users.length === 0) {
        console.warn("uyarı: env de hiç kullanıcı tanımlı değil");
    }

    return users;


}


// AUTH SERVICE 

export class AuthService {

    public async login(email: string, password: string): Promise<string | null> {
        const users = EnvGetUsers();
        const user = users.find(
            (k) => k.email === email && k.password === password
        );

        if (!user) return null;
        return this.generateToken(user);


    }

    // token doğrulama (middleware tarafından kullanılır)
    public CheckTicket(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, JWT_SECRET) as JwtPayload;
        } catch {
            return null;
        }
    }

    //token üretme
    private generateToken(user: EnvUser): string {
        const payload: JwtPayload = {
            id: user.id,
            user: user.name
        };

        return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    }
}


