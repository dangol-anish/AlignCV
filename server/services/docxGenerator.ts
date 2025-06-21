import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from "docx";

export async function generateCoverLetterDocx({
  title,
  content,
}: {
  title: string;
  content: string;
}): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...content.split(/\n+/).map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    color: "e7e5e4", // stone-100
                    size: 24,
                    font: "Arial",
                  }),
                ],
                spacing: { after: 120 },
              })
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

export async function generateResumeDocx(data: any): Promise<Buffer> {
  const children: any[] = [];

  // Helper function to format skills for text output
  const formatSkillsForText = (skills: any): string => {
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
      return allSkills.join(", ");
    }

    return String(skills);
  };

  // Header with name and contact info
  if (data.name) {
    children.push(
      new Paragraph({
        text: data.name,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Contact information
  const contactInfo = [];
  if (data.email) contactInfo.push(data.email);
  if (data.phone) contactInfo.push(data.phone);
  if (data.location) contactInfo.push(data.location);

  if (contactInfo.length > 0) {
    children.push(
      new Paragraph({
        text: contactInfo.join(" | "),
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    children.push(
      new Paragraph({
        text: "PROJECTS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    data.projects.forEach((project: any) => {
      // Project title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.title || "",
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 120 },
        })
      );

      // Project dates
      if (project.dates) {
        children.push(
          new Paragraph({
            text: project.dates,
            spacing: { after: 200 },
          })
        );
      }

      // Project bullet points
      if (project.bullets && project.bullets.length > 0) {
        project.bullets.forEach((bullet: string) => {
          children.push(
            new Paragraph({
              text: `• ${bullet}`,
              spacing: { after: 120 },
            })
          );
        });
      }

      children.push(
        new Paragraph({
          text: "",
          spacing: { after: 200 },
        })
      );
    });
  }

  // Work Experience
  if (data.work && data.work.length > 0) {
    children.push(
      new Paragraph({
        text: "WORK EXPERIENCE",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    data.work.forEach((job: any) => {
      // Job title and company
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: job.title || "",
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: " at ",
              size: 24,
            }),
            new TextRun({
              text: job.company || "",
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 120 },
        })
      );

      // Dates
      if (job.dates) {
        children.push(
          new Paragraph({
            text: job.dates,
            spacing: { after: 200 },
          })
        );
      }

      // Bullet points
      if (job.bullets && job.bullets.length > 0) {
        job.bullets.forEach((bullet: string) => {
          children.push(
            new Paragraph({
              text: `• ${bullet}`,
              spacing: { after: 120 },
            })
          );
        });
      }

      children.push(
        new Paragraph({
          text: "",
          spacing: { after: 200 },
        })
      );
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    children.push(
      new Paragraph({
        text: "EDUCATION",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    data.education.forEach((edu: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree || "",
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: " from ",
              size: 24,
            }),
            new TextRun({
              text: edu.institution || "",
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 120 },
        })
      );

      if (edu.dates) {
        children.push(
          new Paragraph({
            text: edu.dates,
            spacing: { after: 200 },
          })
        );
      }
    });
  }

  // Skills
  if (data.skillsForDownload && data.skillsForDownload.length > 0) {
    children.push(
      new Paragraph({
        text: "SKILLS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    children.push(
      new Paragraph({
        text: data.skillsForDownload.join(", "),
        spacing: { after: 200 },
      })
    );
  } else if (
    data.skills &&
    (Array.isArray(data.skills)
      ? data.skills.length > 0
      : Object.keys(data.skills).length > 0)
  ) {
    children.push(
      new Paragraph({
        text: "SKILLS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    children.push(
      new Paragraph({
        text: formatSkillsForText(data.skills),
        spacing: { after: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
