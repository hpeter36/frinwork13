import NextAuth from "next-auth"
import { authOptions } from "@/configs/init";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }