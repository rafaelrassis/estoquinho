import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")!;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Storage de imagens não configurado (BLOB_READ_WRITE_TOKEN ausente)" },
      { status: 501 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Imagem muito grande (máx. 5MB)" }, { status: 413 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Arquivo precisa ser uma imagem" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const key = `products/${userId}/${randomUUID()}.${ext}`;

  const blob = await put(key, file, { access: "public" });

  return NextResponse.json({ url: blob.url }, { status: 201 });
}
