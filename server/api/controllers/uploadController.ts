import { Response } from "express";
import { MulterRequest } from "../interfaces/upload";

export async function handleFileUpload(req: MulterRequest, res: Response) {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  console.log("Received file:", {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });

  res.json({ success: true, message: "File uploaded successfully" });
}
