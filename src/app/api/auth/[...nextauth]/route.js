import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// In-memory users store - in a real app, replace with database
// This includes your existing test user and will allow new registrations
let users = [
  {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    // This is "password" hashed with bcrypt
    password: "$2a$10$tLH42ClDEoCgqkGFRxCKbu8uFLvbcMxcZZJnmH76j31vGGUy2wuyq", 
    createdAt: new Date()
  }
];

// Export a function to access users from other routes
export const getUsers = () => users;
export const setUsers = (newUsers) => {
  users = newUsers;
};

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
        
        // Special case for your original test user
        if (credentials.email === "test@example.com" && credentials.password === "password") {
          return {
            id: "1",
            name: "Test User",
            email: "test@example.com",
          };
        }
        
        // Find the user
        const user = users.find(user => user.email === credentials.email);
        
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
          id: user.id,
          name: user.name,
          email: user.email
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
    async session({ session, token }) {
      session.user.id = token.sub
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }