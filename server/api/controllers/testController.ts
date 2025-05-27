import { Request, Response } from "express";
import { supabase } from "../../database";

export async function testSupabaseConnection(req: Request, res: Response) {
  try {
    const { data, error } = await supabase.from("users").select("*").limit(1);
    if (error) throw error;

    res.json({ success: true, sampleUser: data });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : err,
    });
  }
}
