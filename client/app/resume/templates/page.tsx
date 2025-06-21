"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/useUserStore";
import { useResumeAnalysisStore } from "@/lib/useResumeAnalysisStore";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  ChevronDown,
  FileCode,
  FileType,
  Database,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ResumeTemplatesPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const { parsedData, resumeImprovements } = useResumeAnalysisStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const authLoading = useUserStore((state) => state.authLoading);

  const TEMPLATES = [
    {
      key: "modern",
      label: "Modern",
      description: "Clean and professional design with subtle accents",
      icon: "🎨",
    },
    {
      key: "minimal",
      label: "Minimal",
      description: "Simple and elegant layout focusing on content",
      icon: "✨",
    },
  ];

  // Temporary debugging
  useEffect(() => {
    console.log("=== TEMPLATES PAGE DEBUG ===");
    console.log("parsedData:", parsedData);
    console.log("resumeImprovements:", resumeImprovements);
    console.log("parsedData type:", typeof parsedData);
    console.log("parsedData is null:", parsedData === null);
    console.log("parsedData is undefined:", parsedData === undefined);
    console.log("Store state:", useResumeAnalysisStore.getState());
  }, [parsedData, resumeImprovements]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin?redirect=/resume/templates");
    }
  }, [authLoading, user, router]);

  // Debug logging for download state
  useEffect(() => {
    console.log("Download state changed:", {
      downloading,
      transformedData: !!transformedData,
      previewHtml: !!previewHtml,
    });
  }, [downloading, transformedData, previewHtml]);

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center text-stone-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-stone-400">Loading...</p>
        </div>
      </div>
    );

  if (!user) return null;

  if (!parsedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center text-stone-100 max-w-md mx-auto">
          <div className="mb-6">
            <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4 text-stone-100">
              No Resume Data Found
            </h2>
            <p className="text-stone-400 mb-6">
              Please analyze a resume first to access templates and generate
              your professional resume.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border border-blue-400/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300"
            >
              Go to Home
            </Button>
            <Button
              onClick={() => {
                useResumeAnalysisStore.getState().clearResults();
                console.log("Store cleared");
              }}
              variant="outline"
              className="w-full border-stone-700 text-stone-400 hover:text-stone-100 hover:bg-stone-800"
            >
              Clear Store (Debug)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Apply improvements to parsed data
  const applyImprovementsDeep = (obj: any, improvements: any[]): any => {
    if (typeof obj === "string") {
      const found = improvements.find(
        (imp) => imp.original.trim() === obj.trim()
      );
      return found ? found.suggestion : obj;
    } else if (Array.isArray(obj)) {
      return obj.map((item) => applyImprovementsDeep(item, improvements));
    } else if (typeof obj === "object" && obj !== null) {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        newObj[key] = applyImprovementsDeep(obj[key], improvements);
      }
      return newObj;
    }
    return obj;
  };

  // Helper to safely get a string (recursive, bulletproof)
  const toString = (val: any): string => {
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    if (Array.isArray(val)) return val.map(toString).join(" ");
    if (typeof val === "object" && val !== null)
      return Object.values(val).map(toString).join(" ");
    return "";
  };

  // Helper to get array of objects for experience/education
  const toArrayOfObjects = (val: any, keys: string[]) => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.map((item) => {
        if (typeof item === "string") {
          // Try to parse as JSON or fallback to a single field
          try {
            const obj = JSON.parse(item);
            if (typeof obj === "object") return obj;
          } catch {
            return { description: item };
          }
        }
        if (typeof item === "object" && item !== null) {
          // Only keep expected keys
          const obj: any = {};
          keys.forEach((k) => {
            obj[k] = toString(item[k]);
          });
          return obj;
        }
        return {};
      });
    }
    if (typeof val === "object") {
      // Single object
      const obj: any = {};
      keys.forEach((k) => {
        obj[k] = toString(val[k]);
      });
      return [obj];
    }
    if (typeof val === "string") {
      return [{ description: val }];
    }
    return [];
  };

  // Helper to get array of strings for skills
  const toArrayOfStrings = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(toString);
    if (typeof val === "string")
      return val
        .split(/,|\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    if (typeof val === "object") return Object.values(val).map(toString);
    return [];
  };

  // Normalize resume data to sections
  function normalizeResumeDataToSections(parsed: any) {
    // Map common keys to types for rendering
    const keyTypeMap: Record<string, string> = {
      experience: "experience",
      Experience: "experience",
      education: "education",
      Education: "education",
      skills: "skills",
      Skills: "skills",
      summary: "summary",
      Summary: "summary",
      contact: "contact",
      Contact: "contact",
    };
    // Always extract name/contact for header
    const name = parsed.name || parsed.Name || "";
    const contact = parsed.contact || parsed.Contact || "";
    // Build sections array from all keys except name/contact
    const sections: { heading: string; type: string; content: any }[] = [];
    for (const key of Object.keys(parsed)) {
      if (["name", "Name", "contact", "Contact"].includes(key)) continue;
      const value = parsed[key];
      if (!value || (Array.isArray(value) && value.length === 0)) continue;
      let type = keyTypeMap[key] || "text";
      let heading = key;
      // Prettify heading
      heading = heading
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      let content = value;
      // Normalize content for known types
      if (type === "experience") {
        content = toArrayOfObjects(value, [
          "title",
          "company",
          "dates",
          "description",
        ]);
        if (!content.length) continue;
      } else if (type === "education") {
        content = toArrayOfObjects(value, ["degree", "institution", "dates"]);
        if (!content.length) continue;
      } else if (type === "skills") {
        content = toArrayOfStrings(value);
        if (!content.length) continue;
      } else if (type === "summary") {
        content = toString(value);
        if (!content) continue;
      } else {
        content = toString(value);
        if (!content) continue;
      }
      sections.push({ heading, type, content });
    }
    return { name, contact: toString(contact), sections };
  }

  // Transform data for modern template format
  function transformDataForTemplate(parsed: any, template: string) {
    console.log("=== TRANSFORM DEBUG ===");
    console.log("Original parsed data:", parsed);
    console.log("Template:", template);
    console.log("Resume improvements:", resumeImprovements);

    const improvedData = applyImprovementsDeep(parsed, resumeImprovements);
    console.log("Improved data:", improvedData);

    if (template === "modern" || template === "minimal") {
      // Modern and minimal templates expect the same data structure
      const name = improvedData.name || improvedData.Name || "";

      // Extract contact information directly from the AI-extracted data
      const email = improvedData.email || "";
      const phone = improvedData.phone || "";
      const location = improvedData.location || "";

      console.log("Contact info:", { name, email, phone, location });

      // Transform experience data - try multiple possible field names
      const experienceData =
        improvedData.experience ||
        improvedData.Experience ||
        improvedData.work ||
        improvedData.Work ||
        improvedData.employment ||
        improvedData.Employment;
      console.log("Experience data found:", experienceData);

      const work = toArrayOfObjects(experienceData, [
        "title",
        "company",
        "dates",
        "description",
      ])
        .filter((item) => item.title || item.company || item.description) // Only include items with actual data
        .map((item) => ({
          title: item.title || "",
          company: item.company || "",
          dates: item.dates || "",
          bullets: item.description ? [cleanBulletPoint(item.description)] : [],
        }));

      console.log("Transformed work:", work);

      // Transform education data - try multiple possible field names
      const educationData =
        improvedData.education ||
        improvedData.Education ||
        improvedData.academic ||
        improvedData.Academic;
      console.log("Education data found:", educationData);

      const education = toArrayOfObjects(educationData, [
        "degree",
        "institution",
        "dates",
        "details",
      ])
        .filter((item) => item.degree || item.institution) // Only include items with actual data
        .map((item) => ({
          degree: item.degree || "",
          institution: item.institution || "",
          dates: item.dates || "",
          details: item.details || item.description || "",
        }));

      console.log("Transformed education:", education);

      // Transform skills data - handle categorized skills
      const skillsData =
        improvedData.skills ||
        improvedData.Skills ||
        improvedData.technical_skills ||
        improvedData.Technical_Skills;
      console.log("Skills data found:", skillsData);

      // Handle both old array format and new categorized format
      let skills = [];
      let skillsForDownload = []; // Flat array for downloads

      if (Array.isArray(skillsData)) {
        // Old format - convert to categorized
        skills = skillsData.filter((skill) => skill.trim().length > 0);
        skillsForDownload = skills;
      } else if (typeof skillsData === "object" && skillsData !== null) {
        // New categorized format
        skills = Object.entries(skillsData)
          .filter(
            ([category, skillList]) =>
              Array.isArray(skillList) && skillList.length > 0
          )
          .map(([category, skillList]) => ({
            category,
            skills: (skillList as string[]).filter(
              (skill: string) => skill.trim().length > 0
            ),
          }))
          .filter((category) => category.skills.length > 0);

        // Create flat array for downloads
        skillsForDownload = Object.values(skillsData)
          .flat()
          .filter(
            (skill: any) => typeof skill === "string" && skill.trim().length > 0
          );
      }

      console.log("Transformed skills:", skills);
      console.log("Skills for download:", skillsForDownload);

      // Transform projects data - convert descriptions to bullet points
      const projectsData = improvedData.projects || improvedData.Projects;
      console.log("Projects data found:", projectsData);

      const projects = toArrayOfObjects(projectsData, [
        "title",
        "dates",
        "description",
      ])
        .filter((item) => item.title || item.description) // Only include items with actual data
        .map((item) => {
          // Convert description to smart bullet points
          let bullets: string[] = [];
          if (item.description) {
            bullets = createSmartBullets(item.description);
          }

          return {
            title: item.title || "",
            dates: item.dates || "",
            bullets: bullets,
          };
        });

      console.log("Transformed projects:", projects);

      const result = {
        name,
        email,
        phone,
        location,
        work,
        projects,
        education,
        skills, // Categorized skills for template
        skillsForDownload, // Flat array for downloads
      };

      console.log("Final transformed result:", result);
      return result;
    } else {
      // For any other templates, use the sections format
      return normalizeResumeDataToSections(improvedData);
    }
  }

  // Helper function to clean bullet points
  function cleanBulletPoint(text: string): string {
    return text
      .replace(/^[-–—•\s]+/, "") // Remove leading dashes, bullets, and whitespace
      .replace(/^[0-9]+\.\s*/, "") // Remove numbered lists
      .replace(/^[a-zA-Z]\)\s*/, "") // Remove lettered lists like "a)", "b)"
      .trim();
  }

  // Helper function to create smart bullet points from long descriptions
  function createSmartBullets(description: string): string[] {
    if (!description || description.length < 50) {
      return [cleanBulletPoint(description)];
    }

    // Split by sentence endings, but be smarter about it
    const sentences = description
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    if (sentences.length <= 3) {
      // If few sentences, keep them as one bullet point
      return [cleanBulletPoint(description)];
    }

    // Group related sentences together
    const bullets = [];
    let currentBullet = "";

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];

      // If this is a short sentence or starts with common connectors, add to current bullet
      if (
        sentence.length < 30 ||
        /^(and|or|but|also|as well as|including|such as|like|for example|e\.g\.|i\.e\.)/i.test(
          sentence
        )
      ) {
        if (currentBullet) {
          currentBullet += " " + sentence;
        } else {
          currentBullet = sentence;
        }
      } else {
        // If we have a current bullet, save it and start a new one
        if (currentBullet) {
          bullets.push(cleanBulletPoint(currentBullet));
          currentBullet = sentence;
        } else {
          currentBullet = sentence;
        }
      }
    }

    // Add the last bullet if there's content
    if (currentBullet) {
      bullets.push(cleanBulletPoint(currentBullet));
    }

    // Limit to 5 bullets maximum
    return bullets.slice(0, 5);
  }

  const handleSelect = async (template: string) => {
    if (!parsedData) return;

    // Update selected template immediately for smooth UI
    setSelected(template);

    // If the same template is already selected and we have a preview, don't reload
    if (selected === template && previewHtml) {
      return;
    }

    setLoading(true);
    setError(null);

    // Only clear preview if switching to a different template
    if (selected !== template) {
      setPreviewHtml(null);
    }

    try {
      console.log("=== TEMPLATE SELECTION DEBUG ===");
      console.log("Template:", template);
      console.log("Parsed data:", parsedData);
      console.log("Improvements:", resumeImprovements);

      // First, extract structured data using AI
      const extractRes = await fetch("/api/upload/extract-template-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: JSON.stringify(parsedData), // Send the parsed data as text
          improvements: resumeImprovements,
        }),
      });

      if (!extractRes.ok) {
        const extractError = await extractRes.json();
        console.error("Data extraction failed:", extractError);
        throw new Error(
          `Failed to extract data: ${extractError.error || "Unknown error"}`
        );
      }

      const extractData = await extractRes.json();
      console.log("AI extracted data:", extractData.data);

      // Transform the AI-extracted data for the specific template
      const transformedData = transformDataForTemplate(
        extractData.data,
        template
      );
      console.log("[handleSelect] Transformed data:", transformedData);

      // Store the transformed data for downloads
      setTransformedData(transformedData);

      const res = await fetch("/api/upload/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, data: transformedData }),
      });

      if (!res.ok) {
        let msg = "Failed to generate resume";
        try {
          const errJson = await res.json();
          console.log("[handleSelect] Backend error response:", errJson);
          msg = errJson.error || msg;
          if (errJson.details) msg += `: ${errJson.details}`;
          if (errJson.stack) msg += `\nStack: ${errJson.stack}`;
        } catch (e) {
          console.log(
            "[handleSelect] Error parsing backend error response:",
            e
          );
        }
        throw new Error(msg);
      }

      const html = await res.text();
      setPreviewHtml(html);
    } catch (e: any) {
      setError(e.message || "Unknown error");
      console.log("[handleSelect] Error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Simple test download function
  const testDownload = () => {
    console.log("Test download called");
    const testContent = "This is a test download";
    const blob = new Blob([testContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test.txt";
    a.click();
    URL.revokeObjectURL(url);
    console.log("Test download completed");
  };

  // Manual reset function for debugging
  const resetDownloadState = () => {
    console.log("Manually resetting download state");
    setDownloading(false);
  };

  const handleDownload = () => {
    if (!previewHtml) return;
    if (downloading) return;

    setDownloading(true);

    try {
      const blob = new Blob([previewHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${selected || "template"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Reset downloading state after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 2000);
    } catch (error) {
      console.error("HTML download error:", error);
      alert("Failed to download HTML file");
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!transformedData) {
      alert("Please select a template first to generate the resume data");
      return;
    }
    if (downloading) return;

    setDownloading(true);
    try {
      const res = await fetch("/api/upload/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selected, data: transformedData }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("PDF generation failed:", errorText);
        alert("Failed to generate PDF");
        setDownloading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${selected || "template"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 2000);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF");
      setDownloading(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!transformedData) {
      alert("Please select a template first to generate the resume data");
      return;
    }
    if (downloading) return;

    setDownloading(true);
    try {
      const res = await fetch("/api/upload/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selected, data: transformedData }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("DOCX generation failed:", errorText);
        alert("Failed to generate DOCX");
        setDownloading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${selected || "template"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 2000);
    } catch (error) {
      console.error("DOCX generation error:", error);
      alert("Failed to generate DOCX");
      setDownloading(false);
    }
  };

  // Helper function to format skills for text output
  const formatSkillsForText = (skills: any): string => {
    console.log("Formatting skills:", skills);
    if (!skills) return "";

    if (Array.isArray(skills)) {
      return skills.join(", ");
    }

    if (typeof skills === "object") {
      // Handle categorized skills
      const allSkills: string[] = [];
      Object.entries(skills).forEach(([category, skillList]) => {
        if (Array.isArray(skillList)) {
          allSkills.push(...skillList);
        }
      });
      console.log("Formatted skills:", allSkills.join(", "));
      return allSkills.join(", ");
    }

    return String(skills);
  };

  const handleDownloadTxt = async () => {
    if (!transformedData) {
      alert("Please select a template first to generate the resume data");
      return;
    }
    if (downloading) return;

    setDownloading(true);
    try {
      // Create plain text version
      let textContent = "";

      if ("contact" in transformedData && "sections" in transformedData) {
        // Classic/Simple template format
        textContent += `${transformedData.name}\n`;
        textContent += `${transformedData.contact}\n\n`;

        transformedData.sections.forEach((section: any) => {
          textContent += `${section.heading.toUpperCase()}\n`;
          textContent += "=".repeat(section.heading.length) + "\n\n";

          if (section.type === "experience" || section.type === "education") {
            section.content.forEach((item: any) => {
              if (item.title) textContent += `${item.title}\n`;
              if (item.company || item.institution)
                textContent += `${item.company || item.institution}\n`;
              if (item.dates) textContent += `${item.dates}\n`;
              if (item.description) textContent += `${item.description}\n`;
              textContent += "\n";
            });
          } else if (section.type === "skills") {
            textContent += formatSkillsForText(section.content) + "\n\n";
          } else {
            textContent += section.content + "\n\n";
          }
        });
      } else {
        // Modern template format
        textContent += `${transformedData.name}\n`;
        textContent += `${transformedData.email} | ${transformedData.phone} | ${transformedData.location}\n\n`;

        if (transformedData.projects && transformedData.projects.length > 0) {
          textContent += "PROJECTS\n";
          textContent += "========\n\n";
          transformedData.projects.forEach((item: any) => {
            textContent += `${item.title}\n`;
            if (item.dates) textContent += `${item.dates}\n`;
            if (item.bullets && item.bullets.length > 0) {
              item.bullets.forEach((bullet: string) => {
                textContent += `• ${bullet}\n`;
              });
            }
            textContent += "\n";
          });
        }

        if (transformedData.work && transformedData.work.length > 0) {
          textContent += "WORK EXPERIENCE\n";
          textContent += "===============\n\n";
          transformedData.work.forEach((item: any) => {
            textContent += `${item.title} at ${item.company}\n`;
            textContent += `${item.dates}\n`;
            if (item.bullets && item.bullets.length > 0) {
              item.bullets.forEach((bullet: string) => {
                textContent += `• ${bullet}\n`;
              });
            }
            textContent += "\n";
          });
        }

        if (transformedData.education && transformedData.education.length > 0) {
          textContent += "EDUCATION\n";
          textContent += "=========\n\n";
          transformedData.education.forEach((item: any) => {
            textContent += `${item.degree} from ${item.institution}\n`;
            textContent += `${item.dates}\n\n`;
          });
        }

        if (
          transformedData.skillsForDownload &&
          transformedData.skillsForDownload.length > 0
        ) {
          textContent += "SKILLS\n";
          textContent += "======\n\n";
          textContent += transformedData.skillsForDownload.join(", ") + "\n\n";
        }
      }

      const blob = new Blob([textContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${selected || "template"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 2000);
    } catch (error) {
      console.error("TXT generation error:", error);
      alert("Failed to generate TXT file");
      setDownloading(false);
    }
  };

  const handleDownloadJson = async () => {
    if (!transformedData) {
      alert("Please select a template first to generate the resume data");
      return;
    }
    if (downloading) return;

    setDownloading(true);
    try {
      const jsonContent = JSON.stringify(transformedData, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${selected || "template"}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 2000);
    } catch (error) {
      console.error("JSON generation error:", error);
      alert("Failed to generate JSON file");
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-950">
      <div className="max-w-6xl mx-auto  py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-stone-100 mb-4">
            Choose Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 font-semibold ml-3">
              Resume Template
            </span>
          </h1>
          <p className=" text-stone-400 font-light max-w-2xl mx-auto">
            Select from our professionally designed templates to create a resume
            that stands out
          </p>
        </div>

        {/* Template Selection */}
        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8  mx-auto">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.key}
                className={`group relative p-8 rounded-2xl border-2 transition-all duration-500 ease-out cursor-pointer min-h-[280px] flex flex-col justify-center ${
                  selected === tpl.key
                    ? "border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-800/10 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                    : "border-stone-700/40 bg-gradient-to-br from-stone-800/30 to-stone-900/20 hover:border-stone-600/60 hover:bg-stone-800/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                }`}
                onClick={() => handleSelect(tpl.key)}
              >
                {/* Template Icon */}
                <div
                  className={`text-6xl mb-6 text-center transition-all duration-500 ${
                    selected === tpl.key
                      ? "text-blue-400"
                      : "text-stone-400 group-hover:text-stone-300"
                  }`}
                >
                  {tpl.icon}
                </div>

                {/* Template Info */}
                <div className="text-center flex-1 flex flex-col justify-center">
                  <h3
                    className={`text-2xl font-semibold mb-3 transition-all duration-500 ${
                      selected === tpl.key ? "text-stone-100" : "text-stone-200"
                    }`}
                  >
                    {tpl.label}
                  </h3>
                  <p
                    className={`text-base mb-6 leading-relaxed transition-all duration-500 ${
                      selected === tpl.key ? "text-stone-300" : "text-stone-400"
                    }`}
                  >
                    {tpl.description}
                  </p>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center gap-2 h-8">
                    {/* Loading State */}
                    <div
                      className={`flex items-center gap-2 text-stone-300 transition-all duration-500 ${
                        loading && selected === tpl.key
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-1 absolute"
                      }`}
                    >
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                      <span className="text-sm font-medium">Generating...</span>
                    </div>

                    {/* Selected State */}
                    <div
                      className={`flex items-center gap-2 text-blue-400 transition-all duration-500 ${
                        selected === tpl.key && !loading
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-1 absolute"
                      }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>

                    {/* Default State */}
                    <div
                      className={`flex items-center gap-2 text-stone-500 transition-all duration-500 ${
                        selected !== tpl.key
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-1 absolute"
                      }`}
                    >
                      <Eye className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Click to Preview
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    selected === tpl.key
                      ? "bg-gradient-to-br from-blue-500/5 to-blue-600/5"
                      : "bg-gradient-to-br from-stone-500/0 to-stone-600/0 group-hover:from-stone-500/5 group-hover:to-stone-600/5"
                  }`}
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {previewHtml && (
          <div className="mt-12">
            <div className="bg-stone-900/50 border border-stone-800 rounded-xl shadow-xl p-8">
              <div className="text-center mb-8 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-stone-100 mb-2">
                  Resume Preview
                </h2>

                {/* Download Button */}
                {previewHtml && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border border-blue-400/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300"
                        disabled={!transformedData || downloading}
                      >
                        {downloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-stone-800 border-stone-700">
                      <DropdownMenuItem
                        onClick={handleDownload}
                        className="text-stone-100 hover:bg-stone-700 hover:text-stone-100 cursor-pointer"
                        disabled={downloading}
                      >
                        <FileCode className="h-4 w-4 mr-2" />
                        Download as HTML
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDownloadPdf}
                        className="text-stone-100 hover:bg-stone-700 hover:text-stone-100 cursor-pointer"
                        disabled={downloading}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Download as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDownloadDocx}
                        className="text-stone-100 hover:bg-stone-700 hover:text-stone-100 cursor-pointer"
                        disabled={downloading}
                      >
                        <FileType className="h-4 w-4 mr-2" />
                        Download as DOCX
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDownloadTxt}
                        className="text-stone-100 hover:bg-stone-700 hover:text-stone-100 cursor-pointer"
                        disabled={downloading}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Download as TXT
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDownloadJson}
                        className="text-stone-100 hover:bg-stone-700 hover:text-stone-100 cursor-pointer"
                        disabled={downloading}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Download as JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Preview Container */}
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-stone-700">
                <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-stone-600 font-medium">
                    {selected
                      ? selected.charAt(0).toUpperCase() + selected.slice(1)
                      : "Resume"}{" "}
                    Template
                  </span>
                </div>
                <div className="max-h-[600px] overflow-auto">
                  <iframe
                    srcDoc={previewHtml}
                    title="Resume Preview"
                    className="w-full h-[600px] border-0"
                    style={{ minHeight: "600px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
