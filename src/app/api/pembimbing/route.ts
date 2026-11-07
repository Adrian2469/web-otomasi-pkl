import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ambil semua pembimbing atau peserta pembimbing tertentu
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pembimbingNip = searchParams.get("pembimbingId");
    const mode = searchParams.get("mode");

    // Mode 1: ambil peserta dari pembimbing tertentu
    if (pembimbingNip) {
      const peserta = await prisma.peserta.findMany({
        where: { pembimbingId: pembimbingNip },
      });
      return NextResponse.json(peserta);
    }

    // Mode 2: ambil kuota per lokasi (FIXED)
    if (mode === "kuota") {
      const pembimbing = await prisma.pembimbing.findMany({
        select: { 
          lokasiPembimbing: true, 
          kuota: true,
          _count: {
            select: { peserta: true }
          }
        },
      });

      // Hitung kuota tersisa per lokasi
      const kuotaPerLokasi: Record<string, { total: number; terpakai: number }> = {};
      
      pembimbing.forEach(p => {
        const lokasi = p.lokasiPembimbing;
        if (!kuotaPerLokasi[lokasi]) {
          kuotaPerLokasi[lokasi] = { total: 0, terpakai: 0 };
        }
        kuotaPerLokasi[lokasi].total += p.kuota || 0;
        kuotaPerLokasi[lokasi].terpakai += p._count.peserta;
      });

      const lokasiKuota = Object.entries(kuotaPerLokasi).map(([lokasi, data]) => ({
        lokasi,
        kuota: data.total, // kuota tersisa
        total: data.total + data.terpakai,
        terpakai: data.terpakai
      }));

      return NextResponse.json(lokasiKuota);
    }

    // Mode 3: default → ambil semua pembimbing beserta peserta mereka
    const pembimbing = await prisma.pembimbing.findMany({
      include: { peserta: true },
    });

    return NextResponse.json(pembimbing);

  } catch (error) {
    console.error("Gagal GET data pembimbing/peserta:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST: tambah pembimbing baru
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const pembimbingBaru = await prisma.pembimbing.create({
      data: {
        nip: body.nip,
        nama: body.nama,
        lokasiPembimbing: body.lokasiPembimbing,
        kuota: Number(body.kuota),
      },
    });

    return NextResponse.json(pembimbingBaru);
  } catch (error) {
    console.error("Gagal menambah pembimbing:", error);
    return NextResponse.json({ error: "Gagal menambah pembimbing" }, { status: 500 });
  }
}

// DELETE: hapus peserta & kembalikan kuota pembimbing
export async function DELETE(req: Request) {
  try {
    const { pesertaId } = await req.json();

    const peserta = await prisma.peserta.findUnique({
      where: { id: pesertaId },
    });

    if (!peserta) {
      return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
    }

    // hapus peserta
    await prisma.peserta.delete({
      where: { id: pesertaId },
    });

    await prisma.pembimbing.update({
      where: { nip: peserta.pembimbingId },
      data: { kuota: { increment: 1 } }
    });

    return NextResponse.json({ message: "Peserta dihapus" });
  } catch (error) {
    console.error("Gagal menghapus peserta:", error);
    return NextResponse.json({ error: "Gagal menghapus peserta" }, { status: 500 });
  }
}