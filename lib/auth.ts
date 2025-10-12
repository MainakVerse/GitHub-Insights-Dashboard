import { type NextAuthOptions, type DefaultSession, type DefaultUser } from "next-auth"
import GitHubProvider from "next-auth/providers/github"

// ✅ --- Inline Type Augmentation ---
declare module "next-auth" {
  interface Session {
    accessToken?: string
    user?: DefaultSession["user"] & {
      login?: string
    }
  }

  interface User extends DefaultUser {
    login?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}
// ✅ --- End of Type Augmentation ---

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
