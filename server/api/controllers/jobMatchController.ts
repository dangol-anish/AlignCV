import { Request, Response } from "express";
import { supabase } from "../../database";

export async function getJobMatchesForUser(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const { data: matches, error } = await supabase
      .from("job_matches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      matches,
    });
  } catch (err: any) {
    console.error("Error fetching job matches:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch job matches",
      error: err,
    });
  }
}

export async function getJobMatchById(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const { data: match, error } = await supabase
      .from("job_matches")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Job match not found",
        });
      }
      throw error;
    }

    return res.json({
      success: true,
      match,
    });
  } catch (err: any) {
    console.error("Error fetching job match:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch job match",
      error: err,
    });
  }
}
