import Link from "next/link";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container>

      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">

        <h1 className="text-5xl font-semibold tracking-tight mb-6">
          That page isn’t here yet.
        </h1>

        <p className="text-text-muted max-w-md mb-8 leading-relaxed">
          It may still be in progress, recently updated,
          or the link may not be correct.
          We’re continuously building and expanding this directory.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">

          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-text-primary px-6 py-3 rounded-lg transition"
          >
            Back to Home
          </Link>

          <Link
            href="/suggest-resource"
            className="border border-border hover:bg-bg px-6 py-3 rounded-lg transition"
          >
            Suggest a Resource
          </Link>

        </div>

        <p className="text-xs text-text-subtle mt-10 max-w-sm">
          If you were looking for a specific service,
          you can help grow this directory by sharing what’s missing.
        </p>

      </div>

    </Container>
  );
}
