import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listMedia, saveUpload } from "@/lib/media";

async function signedInUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  if (!(await signedInUser())) return NextResponse.json({ message: "Sign in first." }, { status: 401 });
  return NextResponse.json({ items: await listMedia() });
}

export async function POST(request: Request) {
  const user = await signedInUser();
  if (!user) return NextResponse.json({ message: "Sign in first." }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ message: "Choose an image to upload." }, { status: 400 });
  const result = await saveUpload(file, user.id);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
  return NextResponse.json(result.media, { status: 201 });
}
