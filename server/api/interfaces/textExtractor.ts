export type SupportedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/msword"
  | "text/plain"
  | "application/rtf"
  | "image/jpeg"
  | "image/png";

export interface ExtractedFileInfo {
  name: string;
  type: SupportedMimeType;
  size: number;
  text: string;
}
