import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";

const templatesDir = path.join(__dirname, "../templates");

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

export async function fillResumeTemplate(
  templateName: string,
  data: any
): Promise<string> {
  let templatePath, templateContent, template;
  try {
    templatePath = path.join(templatesDir, `${templateName}.html`);

    templateContent = await fs.readFile(templatePath, "utf-8");
  } catch (err: any) {
    console.error("[fillResumeTemplate] Error reading template file:", err);
    throw new Error(
      `[fillResumeTemplate] Failed to read template file: ${templatePath}. ${err.message}`
    );
  }
  try {
    template = Handlebars.compile(templateContent);
  } catch (err: any) {
    console.error("[fillResumeTemplate] Error compiling template:", err);
    throw new Error(
      `[fillResumeTemplate] Failed to compile template: ${templatePath}. ${err.message}`
    );
  }
  try {
    return template(data);
  } catch (err: any) {
    console.error("[fillResumeTemplate] Error filling template:", err);
    throw new Error(
      `[fillResumeTemplate] Failed to fill template: ${templatePath}. ${err.message}`
    );
  }
}
