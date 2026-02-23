import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-page auth-page flex min-h-screen flex-col items-center justify-center px-4">
      <section className="auth-card glass w-full max-w-md p-8 text-center">
        <h1 className="app-heading auth-heading mb-2 font-semibold">Page not found</h1>
        <p className="app-subtext auth-subtext mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="app-button auth-button inline-block w-full px-4 py-2.5 text-center text-sm"
        >
          Back to home
        </Link>

        <div className="auth-links mt-6 flex items-center justify-center gap-6 text-sm">
          <Link href="/login" className="app-link auth-link hover:underline">
            Sign in
          </Link>
          <Link href="/signup" className="app-link auth-link hover:underline">
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
