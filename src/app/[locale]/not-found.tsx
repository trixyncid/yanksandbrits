import { getBundle } from "@/lib/content";
import Link from "next/link";

export default function NotFound() {
  const copy = getBundle("en");
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20">
      <h1 className="text-4xl tracking-tight">{copy.notFound.title}</h1>
      <p className="mt-4 leading-7 text-muted">{copy.notFound.body}</p>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center font-semibold text-accent">
        {copy.notFound.home}
      </Link>
    </div>
  );
}
