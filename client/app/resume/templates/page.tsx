"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/useUserStore";
import { useResumeAnalysisStore } from "@/lib/useResumeAnalysisStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResumeTemplatesPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const { parsedData, resumeImprovements } = useResumeAnalysisStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const authLoading = useUserStore((state) => state.authLoading);

  const TEMPLATES = [
    { key: "modern", label: "Modern" },
    { key: "classic", label: "Classic" },
    { key: "simple", label: "Simple" },
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

  if (authLoading) return <div>Loading...</div>;
  if (!user) return null;
  if (!parsedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center text-stone-100">
          <h2 className="text-2xl font-semibold mb-4">No Resume Data Found</h2>
          <p className="text-stone-400 mb-6">
            Please analyze a resume first to access templates.
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => router.push("/")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Go to Home
            </Button>
            <br />
            <Button
              onClick={() => {
                useResumeAnalysisStore.getState().clearResults();
                console.log("Store cleared");
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Clear Store (Debug)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Strictly apply improvements: replace any string field that exactly matches an 'original' in improvements with its 'suggestion'.
  function applyImprovementsDeep(obj: any, improvements: any[]): any {
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
  }

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

  // New normalization for dynamic sections
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

  const handleSelect = async (template: string) => {
    if (!parsedData) return;
    setSelected(template);
    setLoading(true);
    setError(null);
    setPreviewHtml(null);
    try {
      const improvedData = applyImprovementsDeep(
        parsedData,
        resumeImprovements
      );
      const normalizedData = normalizeResumeDataToSections(improvedData);
      console.log("[handleSelect] Normalized data (sections):", normalizedData);
      const res = await fetch("/api/upload/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, data: normalizedData }),
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

  const handleDownload = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${selected || "template"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!parsedData) return;
    const improvedData = applyImprovementsDeep(parsedData, resumeImprovements);
    const normalizedData = normalizeResumeDataToSections(improvedData);
    const res = await fetch("/api/upload/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: selected, data: normalizedData }),
    });
    if (!res.ok) {
      alert("Failed to generate PDF");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${selected || "template"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted px-2">
      <Card className="w-full max-w-2xl shadow-md border-none bg-white/90">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Choose a Resume Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.key}
                className={`flex flex-col items-center p-4 border rounded bg-gray-50 cursor-pointer transition-all ${
                  selected === tpl.key
                    ? "ring-2 ring-green-500"
                    : "hover:ring-1 hover:ring-gray-400"
                }`}
                onClick={() => handleSelect(tpl.key)}
              >
                <div className="w-24 h-32 bg-gray-200 mb-2 rounded flex items-center justify-center text-lg font-bold text-gray-400">
                  {tpl.label}
                </div>
                <span className="font-semibold">{tpl.label}</span>
                <Button
                  className="mt-2 w-full"
                  disabled={loading && selected === tpl.key}
                >
                  {loading && selected === tpl.key ? "Loading..." : "Select"}
                </Button>
              </div>
            ))}
          </div>
          {error && <p className="text-red-600 text-center mt-4">{error}</p>}
          {previewHtml && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-2 text-center">Preview</h2>
              <div
                className="border rounded shadow overflow-auto bg-white"
                style={{ minHeight: 400, maxHeight: 600 }}
              >
                <iframe
                  srcDoc={previewHtml}
                  title="Resume Preview"
                  style={{ width: "100%", height: 500, border: "none" }}
                />
              </div>
              <Button className="mt-4 w-full" onClick={handleDownload}>
                Download HTML
              </Button>
              <Button className="mt-2 w-full" onClick={handleDownloadPdf}>
                Download PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
