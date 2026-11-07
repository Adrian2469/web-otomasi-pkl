import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filename } = req.query;

    if (!filename || Array.isArray(filename)) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Ambil path file PDF
    const filePath = path.join(process.cwd(), "tmp", filename);

    // Jika file tidak ada, kirim error 404
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Ambil ekstensi file untuk penyesuaian Content-Type
    const ext = path.extname(filename).toLowerCase();
    let mimeType = "application/octet-stream"; // default
    if (ext === ".pdf") mimeType = "application/pdf";
    else if (ext === ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (ext === ".doc") mimeType = "application/msword";

    // Set header supaya browser memaksa download
    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");

    // Stream file langsung ke response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
