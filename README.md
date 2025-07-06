# 📘 AlignCV

**Short Description:**  
AlignCV is a modern, full-stack web application that streamlines resume analysis, job matching, and cover letter generation using AI. It helps users optimize their job application materials and improve their chances of landing interviews.

**Purpose:**  
The project aims to automate and enhance the job application process by providing actionable feedback on resumes, generating tailored cover letters, and matching users to relevant job postings using advanced AI and NLP techniques.

**Tech Stack:**

- **Frontend:** Next.js, React, Tailwind CSS, Zustand, Radix UI, Supabase Auth Helpers
- **Backend:** Node.js, Express, TypeScript, Supabase, Google Generative AI, Tesseract.js, Multer, Puppeteer, Handlebars
- **Database:** Supabase (PostgreSQL)
- **Other:** ESLint, TypeScript, PostCSS, Autoprefixer

**Current Status:**  
🚧 **MVP / Work in Progress**  
The project is under active development. Core features are functional, but expect rapid changes and improvements.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **Supabase** project (for database and authentication)
- (Optional) **Google Generative AI** API key

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/dangol-anish/AlignCV.git
   cd AlignCV
   ```

2. **Install dependencies for both client and server:**
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

### Running the Application Locally

**Start the backend:**

```bash
cd server
npm run dev
```

**Start the frontend:**

```bash
cd client
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration / Environment Variables

### Required Environment Variables

**Backend (`server/.env`):**

- `PORT` - Port for the backend server (default: 3000)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon/public API key
- (Optional) `GOOGLE_API_KEY` - For Google Generative AI features

**Frontend (`client/.env`):**

- `NEXT_PUBLIC_API_URL` - URL of the backend server (e.g., `http://localhost:3000`)

### Sample `.env.example`

```env
# server/.env.example
PORT=3000
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_API_KEY=your-google-api-key
```

```env
# client/.env.example
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Setup Instructions:**

1. Copy the example files and fill in your values:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
2. Edit the `.env` files with your credentials.

---

## 🧱 Project Structure

```
AlignCV/
  client/
    app/                # Next.js app directory (pages, API routes, UI)
    components/         # Reusable React components
    constants/          # Static data and config
    lib/                # Client-side utilities and API helpers
    public/             # Static assets (images, icons)
    types/              # TypeScript type definitions
  server/
    api/                # Express API routes, controllers, middlewares
    config/             # Configuration files (Supabase, etc.)
    database/           # Database connection logic
    loaders/            # App/server initialization
    prompts/            # AI prompt templates
    services/           # Business logic, AI, PDF/Docx generation
    templates/          # Resume/Cover letter HTML templates
    utils/              # Utility functions
```

**Key Files:**

- `client/app/api/` - Next.js API routes (proxy to backend)
- `server/api/routes/` - Express API endpoints
- `server/services/` - AI, resume parsing, scoring, and generation logic

---

## 📚 Usage / Features

### Main Features

- **Resume Analysis:** Upload a resume to receive AI-powered feedback, ATS scoring, and actionable improvements.
- **Job Matching:** Get matched to jobs based on your resume and preferences.
- **Cover Letter Generation:** Instantly generate tailored cover letters for job applications.
- **Resume Templates:** Download resumes in various formats (PDF, DOCX, HTML).
- **User Authentication:** Secure login/signup with Supabase Auth and Google OAuth.

### Example Usage

- **Upload Resume:**  
  Go to the dashboard, upload your resume, and view analysis results.
- **Generate Cover Letter:**  
  Select a job and generate a personalized cover letter in one click.
- **Job Matching:**  
  View job matches and see how your resume aligns with each posting.

---

## 🧪 Testing

> **Note:** No automated test framework is currently set up.  
> Manual testing is performed via API endpoints and the web UI.

### Manual API Test Example

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/resume.pdf"
```

### Adding Tests

- To add automated tests, consider integrating **Jest** (for backend) and **React Testing Library** (for frontend).
- Place backend tests in `server/tests/` and frontend tests in `client/__tests__/`.

---

## 🛠️ Contributing

### Workflow

1. **Fork** the repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/dangol-anish/AlignCV.git
   ```
3. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Commit** your changes with clear messages.
5. **Push** to your fork and **open a Pull Request**.

### Coding Standards

- **TypeScript** for both frontend and backend
- **ESLint** for linting (`npm run lint`)
- **Prettier** (recommended for formatting)
- **Next.js** and **React** best practices

### Pull Request Guidelines

- Reference related issues in your PR.
- Describe your changes clearly.
- Ensure your code passes linting and builds.

### Commit Message Conventions

- Use clear, descriptive messages (e.g., `fix: correct resume parsing bug`, `feat: add job matching endpoint`).

---

## 📄 License

> **License:** ISC  
> (No explicit LICENSE file found. Please add one for clarity.)

---

## 📬 Contact / Authors

- **Maintainer:** Anish Dangol
- **GitHub:** [dangol-anish](https://github.com/dangol-anish)
- **Email:** dangol.anish001@gmail.com

---

## 🧠 FAQs / Troubleshooting

**Q: The backend won't start. What should I check?**  
A: Ensure your `.env` file is set up with valid Supabase credentials and the required ports are free.

**Q: Resume upload fails with "Unsupported file type."**  
A: Only PDF, DOC, DOCX, PNG, and JPEG files are supported.

**Q: I get "Unauthorized" errors.**  
A: Make sure you are logged in and sending the correct Authorization header.

**Q: How do I reset my Supabase credentials?**  
A: Visit your Supabase dashboard and generate new API keys.

---

## 📖 API Documentation

### Base URL

```
http://localhost:3000/api/
```

### Key Endpoints

#### **Resume Analysis**

- `POST /api/analyze`  
  Analyze a resume (file upload or by `resume_id`).  
  **Auth:** Required for `resume_id`, optional for file upload.

#### **Job Matching**

- `POST /api/job-matching`  
  Match jobs to your resume. **Auth required.**
- `GET /api/job-matching`  
  List job matches for the user. **Auth required.**
- `GET /api/job-matching/:id`  
  Get details for a specific job match. **Auth required.**

#### **Cover Letter**

- `POST /api/cover-letter/generate`  
  Generate a cover letter. **Auth required.**
- `GET /api/cover-letter`  
  List cover letters. **Auth required.**
- `GET /api/cover-letter/:id`  
  Get a specific cover letter. **Auth required.**
- `GET /api/cover-letter/:id/pdf`  
  Download cover letter as PDF. **Auth required.**
- `GET /api/cover-letter/:id/docx`  
  Download cover letter as DOCX. **Auth required.**

#### **Resumes**

- `GET /api/resumes`  
  List all resumes for the user. **Auth required.**
- `GET /api/resumes/:id`  
  Get a specific resume. **Auth required.**
- `GET /api/resumes/analyses`  
  List all resume analyses. **Auth required.**
- `GET /api/resumes/analyses/:id`  
  Get a specific resume analysis. **Auth required.**
- `POST /api/resumes/reference`  
  Reference a resume for a feature. **Auth required.**

#### **Upload**

- `POST /api/upload`  
  Upload a resume file. **Auth required.**
- `POST /api/upload/save-edit`  
  Save resume edits. **Auth required.**
- `POST /api/upload/generate`  
  Generate resume HTML.
- `POST /api/upload/generate-pdf`  
  Generate resume PDF.
- `POST /api/upload/generate-docx`  
  Generate resume DOCX.
- `POST /api/upload/extract-template-data`  
  Extract data for templates.

#### **Auth**

- `POST /api/auth/signin`  
  Sign in.
- `POST /api/auth/signup`  
  Sign up.
- `GET /api/auth/google`  
  Start Google OAuth.
- `GET /api/auth/google/callback`  
  Google OAuth callback.

---

## 🗺️ Roadmap

- [ ] Add automated tests (Jest, React Testing Library)
- [ ] Add more resume and cover letter templates
- [ ] Improve job matching algorithm
- [ ] Add user profile and settings
- [ ] Deploy to production (Vercel, Render, etc.)

---

## 🙏 Credits

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Google Generative AI](https://ai.google/)
- [Tesseract.js](https://tesseract.projectnaptha.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

> _For more information, please open an issue or contact the maintainer._
