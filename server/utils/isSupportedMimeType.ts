import { SupportedMimeType } from "../api/interfaces/textExtractor";

export function isSupportedMimeType(type: string): type is SupportedMimeType {
  const supportedTypes: SupportedMimeType[] = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
    "application/rtf",
    "image/jpeg",
    "image/png",
  ];

  return supportedTypes.includes(type as SupportedMimeType);
}
