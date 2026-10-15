import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import db from "./lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(credentials.email) as any;
        if (!user) return null;

        const isValid = bcrypt.compareSync(credentials.password as string, user.password_hash);
        
        if (isValid) {
          return { 
            id: String(user.id), 
            name: user.email, 
            email: user.email, 
            rememberMe: credentials.rememberMe === 'true' 
          };
        }
        return null;
      },
    }),
  ],
});
