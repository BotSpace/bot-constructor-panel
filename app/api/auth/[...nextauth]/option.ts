import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { GetMe, Login, RefreshAccessToken } from "@/services/requests/auth";
import { AuthSession } from "../next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        code: {},
      },

      async authorize(credentials) {
        const code = credentials?.code as string;

        // Avval Confirm API orqali tasdiqlash tokenlarini olish
        let data = await Login({ code });

        if (!data) {
          throw new Error("Code hato");
        }

        const getMe = await GetMe({
          access: data?.token.access,
        });

        if (!getMe) {
          throw new Error("get me xatolik berdi");
        }

        if (data) {
          return {
            id: String(getMe.data.id),
            avatar: "",
            access: data.token.access,
            refresh: data.token.refresh,
            first_name: getMe.data.first_name,
            last_name: getMe.data.last_name,
            phone: data.user.phone,
            lang: "uz",
            accessTokenExpires: Date.now() + 5 * 60 * 1000,
            role: getMe.data.role,
          };
        } else {
          console.log(data);
          throw new Error(JSON.stringify({ errors: false, status: false }));
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, trigger, user, session: sessionUser }) {
      // Agar trigger update bo'lsa, tokenni yangilash
      if (trigger === "update" && sessionUser.user) {
        const session = sessionUser as AuthSession;

        token.id = session.id;
        token.access = session.access;
        token.refresh = session.refresh;
        token.first_name = session.first_name;
        token.last_name = session.last_name;
        token.phone = session.phone;
        token.lang = session.lang;
        token.accessTokenExpires = session.accessTokenExpires;
        token.role = session.role;

        return token;
      }

      // Foydalanuvchi mavjud bo'lsa, yangi token yaratish
      if (user) {
        token.id = user.id;
        token.access = user.access;
        token.refresh = user.refresh;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.phone = user.phone;
        token.lang = user.lang;
        token.role = user.role;

        // Access token muddati 5 daqiqa bo'lishi uchun
        token.accessTokenExpires = Date.now() + 5 * 60 * 1000; // 5 daqiqa
      }

      // Token muddati tugaganmi?
      if (Date.now() < token.accessTokenExpires) {
        return token; // Hali amal qilmoqda
      }

      // Token yangilash funksiyasini chaqirish
      return await RefreshAccessToken(token);
    },

    async session({ session, token }) {
      // Token sessionga qo'shish
      if (token) {
        session.user.id = token.id;
        session.user.access = token.access;
        session.user.refresh = token.refresh;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.phone = token.phone;
        session.user.lang = token.lang;
        session.user.accessTokenExpires = token.accessTokenExpires;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
