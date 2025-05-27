import { supabase } from "../database";
import { IUser } from "../api/interfaces/user";

const USERS_TABLE = "users";

export async function getAllUsers(): Promise<IUser[]> {
  const { data, error } = await supabase.from(USERS_TABLE).select("*");
  if (error) throw error;
  return data || [];
}

export async function getUserById(id: string): Promise<IUser | null> {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function createUser(user: IUser): Promise<IUser> {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert(user)
    .single();
  if (error) throw error;
  return data;
}
