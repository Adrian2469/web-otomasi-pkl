import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";

// GET: Ambil data peserta berdasarkan username
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username wajib diisi" }, { status: 400 });
  }

  const peserta = await prisma.peserta.findFirst({
    where: { username },
    include: {
      pembimbing: true,
    },
  });

  if (!peserta) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(peserta);
}

// POST: Upload proposal + update judul berdasarkan username
export async function POST(req: Request) {
  const uploadDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const formData = await req.formData();
  const proposal = formData.get("proposal") as File | null;
  const username = formData.get("username")?.toString();

  if (!proposal || !username) {
    return NextResponse.json({ error: "Proposal dan username wajib diisi" }, { status: 400 });
  }

  // Simpan file proposal
  const buffer = Buffer.from(await proposal.arrayBuffer());
  const fileName = `${Date.now()}_${proposal.name}`;
  const tmpPath = path.join(uploadDir, fileName);
  fs.writeFileSync(tmpPath, buffer);

  // Ekstraksi judul
  let extractedTitle = "Judul tidak terdeteksi";
  try {
    const venvPython = path.join(process.cwd(), ".venv", "Scripts", "python.exe"); // Windows
    const pythonPath = path.join(process.cwd(), "scripts", "extract_title.py");

    if (fs.existsSync(pythonPath)) {
      const py = spawnSync(venvPython, [pythonPath, tmpPath], { encoding: "utf-8" });

      if (py.stdout) {
        try {
          const parsed = JSON.parse(py.stdout);
          if (parsed.title) {
            extractedTitle = parsed.title.trim();
          }
        } catch {
          extractedTitle = py.stdout.trim() || extractedTitle;
        }
      }
    }
  } catch (error) {
    console.warn("Ekstraksi judul gagal:", error);
  }

  // Update ke DB
  const updatedPeserta = await prisma.peserta.updateMany({
    where: { username },
    data: {
      proposal: fileName,
      proposalUrl: `/tmp/${fileName}`,
      judul: extractedTitle,
    },
  });

  return NextResponse.json({
    message: "Proposal berhasil diupload",
    judul: extractedTitle,
    updated: updatedPeserta.count,
  });
}
