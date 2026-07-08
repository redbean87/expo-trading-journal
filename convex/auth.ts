import Google from '@auth/core/providers/google';
import { Email } from '@convex-dev/auth/providers/Email';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';

import type { MutationCtx } from './_generated/server';

const reset = Email({
  sendVerificationRequest: async (params) => {
    const { identifier: email, token } = params;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(
        'RESEND_API_KEY is not set — cannot send password reset email'
      );
      return;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:
          process.env.EMAIL_FROM ?? 'Trading Journal <onboarding@resend.dev>',
        to: email,
        subject: 'Your Password Reset Code',
        html: `<p>You requested a password reset. Use the code below to reset your password:</p>
<pre style="font-size:24px;letter-spacing:4px;text-align:center;padding:16px;background:#f4f4f4;border-radius:8px">${token}</pre>
<p>This code expires in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
      }),
    });

    if (!res.ok) {
      console.error('Failed to send password reset email:', await res.text());
    }
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password({ reset }), Google],
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

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
  providers: [Password({ reset }), Google],
};
