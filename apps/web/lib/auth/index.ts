import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { EventSchema, getTag } from "@repo/utils";
import Credentials from "next-auth/providers/credentials";
import { nip19, validateEvent } from "nostr-tools";
import { unixTimeNowInSeconds } from "@/lib/utils/dates";
import { prisma } from "@repo/database";
import { PrismaClient } from "@repo/database";
import type * as _ from "@/node_modules/next-auth/lib/types";
import type * as __ from "@/node_modules/next-auth/lib";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

interface Session extends DefaultSession {
  user: {
    id: string;
    pubkey: string;
  } & DefaultSession["user"];
}

const authPrisma = {
  account: prisma.account,
  user: prisma.authUser,
  session: prisma.session,
  verificationToken: prisma.verificationToken,
} as unknown as PrismaClient;

export const { handlers, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(authPrisma),
  providers: [
    Credentials({
      name: "Event Auth",
      id: "nip-98",
      credentials: {
        event: {
          label: "Event",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        console.log("At authorize");
        if (!credentials?.event) {
          throw new Error("Missing Event");
        }
        const event = EventSchema.parse(
          JSON.parse(credentials?.event as string),
        );

        const currentTime = unixTimeNowInSeconds();

        if (
          getTag(event.tags, "u", 1) !== process.env.NEXT_PUBLIC_AUTH_REQ_URL ||
          event.kind !== 27235
        ) {
          throw new Error("Invalid Event");
        } else if (event.created_at < currentTime - 60) {
          throw new Error("Stale Event");
        } else if (!event.id || !event.sig || !event.kind) {
          throw new Error("Missing signature");
        }
        const validEvent = validateEvent({
          ...event,
          id: event.id as string,
          sig: event.sig as string,
          kind: event.kind as number,
        });
        if (validEvent) {
          const user = await prisma.user.findFirst({
            where: {
              pubkey: event.pubkey,
            },
          });
          if (!user) {
            await prisma.user.create({
              data: {
                name: "Unnamed",
                pubkey: event.pubkey,
              },
            });
          }
          return {
            id: event.pubkey,
            email: event.pubkey,
            npub: nip19.npubEncode(event.pubkey),
            pubkey: event.pubkey,
          };
        } else {
          throw new Error("Invalid Credentials");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const userToken = token as unknown as {
        user: {
          pubkey: string;
          npub: string;
        };
      };
      const pubkey: string = userToken.user?.pubkey ?? "";
      const npub = userToken.user?.npub ?? "";

      session.user = {
        ...session.user,
        // @ts-expect-error
        ...token.user,
        pubkey,
        npub,
        id: token.sub,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url;
    },
  },
  debug: !VERCEL_DEPLOYMENT,
});

// import { getServerSession } from "next-auth";
// import type { NextAuthOptions, DefaultSession } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { db, users } from "@repo/database";
// import { EventSchema, getTag } from "@repo/utils";
// import { nip19, validateEvent } from "nostr-tools";
// import signIn from "./signIn";
// import { unixTimeNowInSeconds } from "@/lib/utils/dates";

// /**
//  * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
//  * object and keep type safety.
//  *
//  * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
//  */
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//       pubkey: string;
//     } & DefaultSession["user"];
//   }
//   interface User {
//     // ...other properties
//   }
// }

// interface Session extends DefaultSession {
//   user: {
//     id: string;
//     pubkey: string;
//   } & DefaultSession["user"];
// }

// const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       // The name to display on the sign in form (e.g. 'Sign in with...')
//       name: "Email + Password auth",
//       id: "email-password",
//       // The credentials is used to generate a suitable form on the sign in page.
//       // You can specify whatever fields you are expecting to be submitted.
//       // e.g. domain, username, password, 2FA token, etc.
//       // You can pass any HTML attribute to the <input> tag through the object.
//       credentials: {
//         email: {
//           label: "Email",
//           type: "text",
//         },
//         password: {
//           label: "Password",
//           type: "password",
//         },
//       },
//       async authorize(credentials, req) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Missing Credentials");
//         }
//         const user = await signIn(credentials.email, credentials.password);
//         if (user) {
//           return { ...user, id: user.id.toString() };
//         } else {
//           throw new Error("Invalid Credentials");
//         }
//       },
//     }),
//     CredentialsProvider({
//       // The name to display on the sign in form (e.g. 'Sign in with...')
//       name: "Event Auth",
//       id: "nip-98",
//       // The credentials is used to generate a suitable form on the sign in page.
//       // You can specify whatever fields you are expecting to be submitted.
//       // e.g. domain, username, password, 2FA token, etc.
//       // You can pass any HTML attribute to the <input> tag through the object.
//       credentials: {
//         event: {
//           label: "Event",
//           type: "text",
//         },
//       },
//       async authorize(credentials, req) {
//         console.log("At authorize");
//         if (!credentials?.event) {
//           throw new Error("Missing Event");
//         }
//         const event = EventSchema.parse(JSON.parse(credentials.event));

//         const currentTime = unixTimeNowInSeconds();
//         if (
//           getTag(event.tags, "u", 1) !== process.env.NEXT_PUBLIC_AUTH_REQ_URL ||
//           event.kind !== 27235
//         ) {
//           throw new Error("Invalid Event");
//         } else if (event.created_at < currentTime - 60) {
//           throw new Error("Stale Event");
//         } else if (!event.id || !event.sig || !event.kind) {
//           throw new Error("Missing signature");
//         }
//         const validEvent = validateEvent({
//           ...event,
//           id: event.id as string,
//           sig: event.sig as string,
//           kind: event.kind as number,
//         });
//         if (validEvent) {
//           const user = await db.query.users.findFirst({
//             where: eq(users.pubkey, event.pubkey),
//           });
//           if (!user) {
//             await db.insert(users).values({
//               name: "Unnamed",
//               pubkey: event.pubkey,
//             });
//           }
//           return {
//             id: event.pubkey,
//             email: event.pubkey,
//             npub: nip19.npubEncode(event.pubkey),
//             pubkey: event.pubkey,
//           };
//         } else {
//           throw new Error("Invalid Credentials");
//         }
//       },
//     }),
//   ],
//   pages: {
//     signIn: `/`,
//     verifyRequest: `/login`,
//     error: "/login", // Error code passed in query string as ?error=
//   },
//   adapter: PrismaAdapter(prisma),
//   session: { strategy: "jwt" },
//   // cookies: {
//   //   sessionToken: {
//   //     name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
//   //     options: {
//   //       httpOnly: true,
//   //       sameSite: "lax",
//   //       path: "/",
//   //       // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
//   //       domain: VERCEL_DEPLOYMENT
//   //         ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
//   //         : undefined,
//   //       secure: VERCEL_DEPLOYMENT,
//   //     },
//   //   },
//   // },
//   callbacks: {
//     jwt: async ({ token, user }) => {
//       if (user) {
//         token.user = user;
//       }
//       return token;
//     },
//     session: async ({ session, token }) => {
//       const userToken = token as unknown as {
//         user: {
//           pubkey: string;
//           npub: string;
//         };
//       };
//       const pubkey: string = userToken.user?.pubkey ?? "";
//       const npub = userToken.user?.npub ?? "";

//       session.user = {
//         ...session.user,
//         // @ts-expect-error
//         ...token.user,
//         pubkey,
//         npub,
//         id: token.sub,
//       };
//       return session;
//     },
//     async redirect({ url, baseUrl }) {
//       return url;
//     },
//   },
//   debug: !VERCEL_DEPLOYMENT,
// };

export function getSession() {
  return auth() as Promise<Session | null>;
}

export async function getCurrentUserSession() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return null;
    }
    const currentUser = await prisma.user.findFirst({
      where: {
        pubkey: session.user.pubkey,
      },
    });

    return { ...session, user: currentUser };
  } catch (err) {
    console.log("Error");
    return null;
  }
}
export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return null;
    }
    const currentUser = await prisma.user.findFirst({
      where: {
        pubkey: session.user.pubkey,
      },
    });
    return currentUser;
  } catch (err) {
    console.log("Error");
    return null;
  }
}
