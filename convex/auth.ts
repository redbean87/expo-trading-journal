import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';

import type { MutationCtx } from './_generated/server';

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password, Google],
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      // If updating existing user, return their ID
      if (args.existingUserId) {
        return args.existingUserId;
      }

      // Try to find existing user by email to link accounts
      const email = args.profile.email;
      if (email) {
        const existingUser = await ctx.db
          .query('users')
          .withIndex('by_email', (q) => q.eq('email', email))
          .first();

        if (existingUser) {
          return existingUser._id;
        }
      }

      // Create new user
      return ctx.db.insert('users', {
        name: args.profile.name as string | undefined,
        email: args.profile.email as string | undefined,
        image: args.profile.image as string | undefined,
      });
    },
  },
});

// Default export required by Convex
export default {
  providers: [Password, Google],
};
