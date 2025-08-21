import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NuxtAuthHandler } from '#auth'
import { authenticateUser, findOrCreateOAuthUser, updateUserRole, getUserById } from '../../utils/users'
import type { JWT } from 'next-auth/jwt'
import type { User as NextAuthUser, Account, Session as NextAuthSession} from 'next-auth'

type ExtendedUser = NextAuthUser & {
  role?: string;
  username?: string;
  dbId?: string | number;
  profileCompleted?: boolean;
};

type ExtendedJWT = JWT & {
  role?: string;
  username?: string;
  dbId?: string | number;
  profileCompleted?: boolean;
};

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile'
        }
      }
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point  
    CredentialsProvider.default({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Record<string, unknown> | undefined) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const username = credentials.username as string
        const password = credentials.password as string

        const user = await authenticateUser(username, password)
        
        if (user) {
          return {
            id: user.id!.toString(),
            name: user.name || user.username,
            email: user.email,
            username: user.username,
            role: user.role
          }
        }
        
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 // 1 día (24hs)
  },
  callbacks: {
    async jwt({ token, user, account }: {
      token: ExtendedJWT;
      user?: ExtendedUser | null;
      account?: Account | null;
      profile?: unknown;
      isNewUser?: boolean;
      trigger?: string;
    }) {
  if (user) {
        // Para usuarios de Google OAuth
  if (account && account.provider === 'google') {
          const runtimeConfig = useRuntimeConfig();
          const adminEmail = runtimeConfig.adminEmail;
          // Buscar o crear usuario de OAuth en la base
          const dbUser = findOrCreateOAuthUser(
            user.email ?? '',
            user.name || 'OAuth User',
            user.image ?? undefined,
            'google',
            user.id
          );
          // Forzar rol admin al mail admin
          if (user.email && user.email === adminEmail && dbUser.role !== 'admin') {
            updateUserRole(dbUser.id!, 'admin');
            const updatedUser = getUserById(dbUser.id!);
            if (updatedUser) {
              token.role = updatedUser.role;
            }
          } else {
            token.role = dbUser.role;
          }
          token.username = dbUser.username || (user.email ? user.email.split('@')[0] : '');
          token.dbId = dbUser.id;
          token.profileCompleted = dbUser.profile_completed || false;
        } else {
          // Para usuarios nativos
          token.role = user.role ?? undefined;
          token.username = user.username ?? undefined;
          token.dbId = user.dbId ?? undefined;
          token.profileCompleted = true;
        }
      }
  return token
    },
    async session({ session, token }: {
      session: NextAuthSession;
      token: ExtendedJWT;
      user?: ExtendedUser | null;
      newSession?: unknown;
      trigger?: string;
    }) {
      if (token && session.user) {
        const user = session.user as ExtendedUser;
        user.id = String(token.sub);
        user.role = token.role;
        user.username = token.username;
        user.dbId = token.dbId;
        user.profileCompleted = token.profileCompleted;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
})
