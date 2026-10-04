"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">
        {process.env.NODE_ENV === "development" ? error.message : "Please try again in a moment."}
      </p>
      <button onClick={reset} className="btn-primary mt-8">Try again</button>
    </div>
  );
}
