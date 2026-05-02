import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SERVICE_SECRET = process.env.PDF_SERVICE_SECRET || "";

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Generate PDF
app.post("/generate-pdf", async (req, res) => {
  const { htmlUrl, secret } = req.body;

  // Validate secret
  if (!SERVICE_SECRET || secret !== SERVICE_SECRET) {
    return res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Invalid or missing service secret",
    });
  }

  // Validate htmlUrl
  if (!htmlUrl || typeof htmlUrl !== "string") {
    return res.status(400).json({
      code: "INVALID_URL",
      message: "htmlUrl is required",
    });
  }

  // Security: only allow URLs from our domain
  const allowedHosts = [
    "one-page-me.vercel.app",
    "localhost",
    "127.0.0.1",
  ];
  let url: URL;
  try {
    url = new URL(htmlUrl);
  } catch {
    return res.status(400).json({
      code: "INVALID_URL",
      message: "Invalid URL format",
    });
  }

  if (!allowedHosts.some((host) => url.hostname.includes(host))) {
    return res.status(403).json({
      code: "FORBIDDEN_URL",
      message: "URL domain not allowed",
    });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(htmlUrl, { waitUntil: "networkidle0" });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="page.pdf"'
    );
    res.send(pdf);
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF generation failed";
    console.error("PDF generation error:", message);
    res.status(500).json({
      code: "PDF_GENERATION_FAILED",
      message,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`PDF service listening on port ${PORT}`);
});
