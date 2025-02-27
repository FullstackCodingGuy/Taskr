import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // Add more providers here
  ],
  // Optional: Add custom pages for sign-in, sign-out, etc.
  pages: {
    signIn: "/auth/signin",
  },
  // Optional: Add callbacks for session and JWT
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id,
      },
    }),
    // async session({ session, token }) {
    //   if(session && session.user && token) {
    //     session.user.id = token.id;
    //   }
    //   // console.log('>>>session user id: ', token.id)
    //   return session;
    // },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // console.log('>>>>jwt:token: ', token)
      return token;
    },
  },
});
export { handler as GET, handler as POST }