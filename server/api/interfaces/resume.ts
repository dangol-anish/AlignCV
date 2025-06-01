export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  education?: {
    degree: string;
    institution: string;
    startDate?: string;
    endDate?: string;
  }[];
  experience?: {
    jobTitle: string;
    company: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string[];
  }[];
}
