import { type } from "arktype";

export const LoginSchema = type({
  email: "email",
  password: "string & minLength<8>",
});

export const ResetSchema = type({
  email: "email",
});

export const InvitationSchema = type({
  email: "email",
});

export type LoginInput = typeof LoginSchema.infer;
export type ResetInput = typeof ResetSchema.infer;
export type InvitationInput = typeof InvitationSchema.infer;
