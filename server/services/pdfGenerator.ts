import puppeteer from "puppeteer";

export async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    scale: 0.95,
    margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
  });
  await browser.close();
  return Buffer.from(pdfBuffer);
}
