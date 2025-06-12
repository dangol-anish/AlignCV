export interface IResume {
  id: string;
  user_id: string | null;
  original_filename: string;
  mimetype: string;
  size: number;
  raw_text?: string;
  parsed_data?: any;
  uploaded_at: string;
}
