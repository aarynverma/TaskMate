// src/pages/api/auth/[...nextauth].ts

export const runtime = "nodejs";

import NextAuth from "next-auth";
import { authOptions } from "@/server/auth";

export default NextAuth(authOptions);
