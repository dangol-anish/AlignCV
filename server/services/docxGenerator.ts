import { Document, Packer, Paragraph, TextRun } from "docx";

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
