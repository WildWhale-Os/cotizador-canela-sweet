// Minimal Better Auth bootstrap (skeleton)
// Install and configure Better Auth per docs before using in production

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  // TODO: add providers and configuration options
  plugins: [nextCookies()],
});

export default auth;
