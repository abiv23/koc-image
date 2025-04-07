import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null;
        }
        
        // Find the user in the database
        const user = await getUserByEmail(credentials.email);
        
        // If no user found, return null
        if (!user) {
          return null;
        }
        
        // Verify password
        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        
        if (!passwordMatch) {
          return null;
        }
        
        // Return the user without the password
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          isAdmin: user.is_admin === true // Include the admin flag
        };
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add the isAdmin flag to the JWT token when first signing in
      if (user) {
        token.isAdmin = user.isAdmin || false;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID and isAdmin flag to the session
      session.user.id = token.sub;
      session.user.isAdmin = token.isAdmin || false;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};