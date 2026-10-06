import { supabase } from "../lib/supabase";

/* =========================
   LOGIN
========================= */

export async function loginUser(
  email: string,
  password: string
) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   REGISTER
========================= */

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const { data, error } =
    await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   LOGOUT
========================= */

export async function logoutUser() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/* =========================
   CURRENT USER
========================= */

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}