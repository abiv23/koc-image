import NextAuth from "next-auth";
import { authOptions } from "./authOptions";

// Create the handler using the authOptions
const handler = NextAuth(authOptions);

// Export the handler with the required HTTP methods
export { handler as GET, handler as POST };