import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      district?: string;
      province?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    district?: string;
    province?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    district?: string;
    province?: string;
  }
}
