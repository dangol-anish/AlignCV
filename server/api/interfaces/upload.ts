import { Request } from "express";

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
