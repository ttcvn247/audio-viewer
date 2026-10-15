import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user?.email;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isApi = nextUrl.pathname.startsWith('/api/auth') || 
                    nextUrl.pathname.startsWith('/api/license') || 
                    nextUrl.pathname.startsWith('/api/settings/public');
      
      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      if (isApi) {
        return true;
      }

      if (!isLoggedIn) return false;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        const isRemember = (user as any).rememberMe;
        const maxAge = isRemember ? 30 * 24 * 60 * 60 : 2 * 60 * 60; // 30 days vs 2 hours
        token.customExp = Math.floor(Date.now() / 1000) + maxAge;
      }
      
      // Check expiration
      if (token.customExp && Math.floor(Date.now() / 1000) > (token.customExp as number)) {
        return {};
      }
      
      return token;
    },
    async session({ session, token }) {
      if (!token || !token.email) {
        return { ...session, user: undefined } as any;
      }
      if (token && session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
