import Link from "next/link";

export default function CreditsPage() {
  return (
    <main className="min-h-[60vh] bg-zinc-950 text-zinc-100 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Credits</h1>
        <p className="mt-6 text-zinc-300">
          Designed by{" "}
          <a
            href="https://www.freepik.com"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-zinc-100"
          >
            Freepik
          </a>
        </p>
        <p className="mt-8">
          <Link href="/" className="text-sm text-zinc-400 underline hover:text-zinc-200">
            Back to Home
          </Link>
        </p>
      </div>
    </main>
  );
}
