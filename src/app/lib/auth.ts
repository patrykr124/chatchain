import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        address: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature) {
          console.error("Brak adresu lub podpisu");
          return null; 
        }
        
       
        return { id: credentials.address, address: credentials.address };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/home",
    signOut:"/"
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log("JWT callback - token przed:", token);
      if (trigger === "signOut") {
        return {};
      }
      if (user) {
        token.user = { address: user.address };
        token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // Expiry
      }
      console.log("JWT callback - token po:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback:", session, token);
      if (token.user?.address) {
        session.user = {
          address: token.user.address,
          name: token.user.address, 
          email: null,             
          image: null,             
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url === '/auth/signout') return baseUrl;
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
};
