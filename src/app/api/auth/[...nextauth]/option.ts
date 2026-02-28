import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { GetMe, Login, RefreshAccessToken } from "@/services/requests/auth";

import { AuthSession } from "../next-auth";
import { TIME_CONSTANTS } from "@/lib/constants";
import env from "@/lib/env";
import { instance } from "@/services/instance";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        code: {},
      },

      async authorize(credentials) {
        console.log("🚀 ~ file: option.ts:22 ~ credentials:", credentials);
        const code = credentials?.code as string;
        console.log("🚀 ~ file: option.ts:24 ~ code:", code);

        // Avval Confirm API orqali tasdiqlash tokenlarini olish
        let { data, request, status, headers, config } = await Login({ code });
        console.log("🚀 ~ file: option.ts:27 ~ status:", status);
        console.log("🚀 ~ file: option.ts:27 ~ request:", request);
        console.log("🚀 ~ file: option.ts:27 ~ data:", data);

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
            accessTokenExpires:
              Date.now() + TIME_CONSTANTS.ACCESS_TOKEN_EXPIRES,
            role: getMe.data.role as any,
          };
        } else {
          if (process.env.NODE_ENV === "development") {
            console.log(data);
          }
          throw new Error(JSON.stringify({ errors: false, status: false }));
        }
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!
    })
  ],
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {

        console.log("account and profile and user 😃", account, profile, user)

        // Google ID token
        const idToken = account.id_token;

        console.log(idToken)

        // Backendga yuborish
        const res = await instance.post('/api/v1/auth/google', {
          "id_token": idToken
        })

        const data = res.data

        console.log("response data", data)

        if (!data) return false;

        // keyin jwt callbackda ishlatish uchun userga qo'shish
        user.access = data.data.token.access;
        user.refresh = data.data.token.refresh;
      }

      return true;
    },


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
        token.accessTokenExpires =
          Date.now() + TIME_CONSTANTS.ACCESS_TOKEN_EXPIRES;
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
