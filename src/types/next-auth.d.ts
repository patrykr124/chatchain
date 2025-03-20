import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    address: string;
  }

  interface Session {
    user: {
      address: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    address: string;
  }
}
