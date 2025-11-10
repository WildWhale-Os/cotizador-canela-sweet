"use server";

import { auth } from "@/lib/auth";
import { LoginSchema, LoginInput } from "../schema";
import { headers } from "next/headers";

export type ActionResult = { ok: true } | { ok: false; message?: string };

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const result = LoginSchema(input);
  if (result instanceof Error) {
    return { ok: false, message: "Invalid input" };
  }

  try {
    await auth.api.signInEmail({
      body: { email: input.email, password: input.password },
    });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: "Las credenciales no son válidas" };
  }
}
