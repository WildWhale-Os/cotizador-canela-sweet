"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
// Note: arktype resolver adapter may need to be implemented or use setError mapping
import { LoginSchema, LoginInput } from "../schema";
import { loginAction } from "./actions";

export function LoginForm() {
  const { register, handleSubmit, formState } = useForm<LoginInput>();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const res = await loginAction(data as LoginInput);
    if (!res.ok) {
      setServerError(res.message ?? "Login failed");
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>
        Email
        <input type="email" {...register("email")} autoComplete="email" />
      </label>
      <label>
        Password
        <input type="password" {...register("password")} autoComplete="current-password" />
      </label>
      {serverError && <p role="alert">{serverError}</p>}
      <button type="submit" disabled={formState.isSubmitting}>Iniciar sesión</button>
    </form>
  );
}

export default LoginForm;
