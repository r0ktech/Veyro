import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";
import { safeNext } from "@/lib/safe-next";
import { GoogleSignInButton } from "./GoogleSignInButton";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="container-page flex justify-center py-20">
      <div className="card w-full max-w-sm p-8 text-center">
        <p className="text-2xl font-bold tracking-tight">veyro<span className="text-brand">.</span></p>
        <h1 className="mt-6 text-xl font-semibold">Sign in to continue</h1>
        <p className="mt-2 text-sm text-muted">Your cart and orders are saved to your account.</p>
        {sp.error && (
          <p role="alert" className="mt-5 rounded-xl bg-danger/5 px-3 py-2 text-sm text-danger">
            Sign-in didn&apos;t complete. Please try again.
          </p>
        )}
        <GoogleSignInButton next={next} />
        <p className="mt-6 text-xs text-muted">We only use your Google name, email and photo.</p>
      </div>
    </div>
  );
}
