import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const { role, nipOrNim, pass } = await req.json();

  const hashedPass = crypto.createHash("md5").update(pass).digest("hex");

  let user = null;

  if (role === "pembimbing") {
    user = await prisma.pembimbing.findFirst({
      where: {
        nip: nipOrNim,
        pass: hashedPass,
      },
    });
  } else if (role === "peserta") {
    user = await prisma.peserta.findFirst({
      where: {
        username: nipOrNim,
        pass: hashedPass,
      },
    });
  }

  if (!user) {
    return new Response(JSON.stringify({ error: "ID atau password salah" }), { status: 401 });
  }

  return new Response(JSON.stringify({ role, ...user }), { status: 200 });
}
