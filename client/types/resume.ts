export interface Education {
  degree: string;
  institution: string;
  startDate?: string;
  endDate?: string;
}

export interface Experience {
  jobTitle: string;
  company: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: string[];
}

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
}
