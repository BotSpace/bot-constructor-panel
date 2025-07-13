import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { RefreshAccessToken } from "./requests/auth";

export const instanceAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
});

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
});

// interceptors
instanceAuth.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    config.headers["Authorization"] = `Bearer ${session?.user.access}`;

    //   {
    //     "id": "2",
    //     "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyMzQ2MDY0LCJpYXQiOjE3NTIzNDQ2MjQsImp0aSI6IjUyYjlhMDRiYzIzYjRhY2FhNDlkYjk0YzYxYWM4YjNkIiwidXNlcl9pZCI6Mn0.3WhCatOC0yjEdnaRi7ixNUl35dqU6NHCMcSqqRP1Kwo",
    //     "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1NDkzNjYyNCwiaWF0IjoxNzUyMzQ0NjI0LCJqdGkiOiJjZWJiZWVlMjFiOGQ0MGIwYjBmYzViYWVlMjM3OWIyNSIsInVzZXJfaWQiOjJ9.WsefKCp0x_oRytTadgBLo6SXXgWsr2UD2liOv3gw4Hc",
    //     "first_name": "Muhiddin",
    //     "last_name": "Kabraliev (D)",
    //     "phone": "998905650213",
    //     "lang": "uz",
    //     "accessTokenExpires": 1752344925337,
    //     "role": "user"
    // }

    return config;
  },
  (error: any) => Promise.reject(error)
);

instanceAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config;
    const session = await getSession();

    if (
      error?.response?.status === 401 &&
      !prevRequest?.sent &&
      session?.user
    ) {
      prevRequest.sent = true;

      const user = await RefreshAccessToken(session.user);

      prevRequest.headers["Authorization"] = `Bearer ${session.user.access}`;

      session.user = user;

      return instanceAuth(prevRequest);
    }

    // log out if user is not authenticated
    // await signOut();

    return Promise.reject(error);
  }
);
