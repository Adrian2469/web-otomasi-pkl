import { prisma } from "@/lib/prisma";
import { peserta_lokasiPkl } from "@prisma/client";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const nama = formData.get("nama")?.toString() || "";
    const prodi = formData.get("prodi")?.toString() || "";
    const lokasiPkl = formData.get("lokasiPkl") as peserta_lokasiPkl;
    const universitas = formData.get("universitas")?.toString() || "";
    const username = formData.get("username")?.toString() || "";
    if (!username) {
      return NextResponse.json({ error: "Username wajib diisi" }, { status: 400 });
    }
    const pass = formData.get("pass")?.toString() || "";
    if (!pass) {
      return NextResponse.json({ error: "Password wajib diisi" }, { status: 400 });
    }
    const proposal = formData.get("proposal") as File | null;

    if (!proposal) {
      return NextResponse.json({ error: "Proposal wajib diunggah" }, { status: 400 });
    }

    // 🔍 Cari pembimbing sesuai lokasi
    const pembimbingList = await prisma.pembimbing.findMany({
      where: { lokasiPembimbing: lokasiPkl as any },
      include: { _count: { select: { peserta: true } } },
    });

    if (pembimbingList.length === 0) {
      return NextResponse.json({ error: "Lokasi PKL tidak valid" }, { status: 400 });
    }

    const pembimbingTersedia = pembimbingList
      .filter((p) => (p.kuota || 0) > 0)
      .sort((a, b) => (b.kuota || 0) - (a.kuota || 0))[0];

    if (!pembimbingTersedia) {
      return NextResponse.json({ error: "Semua pembimbing di lokasi ini sudah penuh" }, { status: 400 });
    }

    // 📂 Pastikan folder tmp ada
    const uploadDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 💾 Simpan file proposal
    const buffer = Buffer.from(await proposal.arrayBuffer());
    const fileName = `${Date.now()}_${proposal.name}`;
    const tmpPath = path.join(uploadDir, fileName);
    fs.writeFileSync(tmpPath, buffer);

    // 🐍 Ekstrak judul pakai Python
    let extractedTitle = "Judul tidak terdetek";
    try {
      const venvPython = path.join(process.cwd(), ".venv", "Scripts", "python.exe"); // Windows

      const pythonPath = path.join(process.cwd(), "scripts", "extract_title.py");
      if (fs.existsSync(pythonPath)) {
        const py = spawnSync(venvPython, [pythonPath, tmpPath], { encoding: "utf-8" });

        if (py.error) {
          console.warn("Gagal menjalankan Python:", py.error);
        } else if (py.stdout) {
          try {
            const parsed = JSON.parse(py.stdout);
            if (parsed.title) {
              extractedTitle = parsed.title.trim();
            }
          } catch {
            extractedTitle = py.stdout.trim() || "Judul tidak terdeteksi";
          }
        } else {
          console.warn("Python stdout kosong:", py.stderr);
        }
      } else {
        console.warn("Script extract_title.py tidak ditemukan");
      }
    } catch (pythonError) {
      console.warn("Ekstraksi judul gagal:", pythonError);
    }


    // 📝 Simpan peserta ke database
    const newPeserta = await prisma.peserta.create({
      data: {
        nama,
        prodi,
        universitas,
        lokasiPkl,
        proposal: fileName,
        proposalUrl: `/tmp/${fileName}`,
        pembimbingId: pembimbingTersedia.nip,
        judul: extractedTitle,
        username,
        pass,
      },
    });

    // 🔄 Kurangi kuota pembimbing
    await prisma.pembimbing.update({
      where: { nip: pembimbingTersedia.nip },
      data: { kuota: { decrement: 1 } },
    });

    return NextResponse.json({
      success: true,
      peserta: newPeserta,
      judul: extractedTitle,
      pembimbing: pembimbingTersedia.nama,
    });

  } catch (err) {
    console.error("Error API pendaftaran:", err);
    return NextResponse.json({ error: "Terjadi kesalahan saat mendaftar" }, { status: 500 });
  }
}
