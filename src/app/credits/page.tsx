import type { Metadata } from "next";
import credits from "@/data/image-credits.json";

export const metadata: Metadata = { title: "Image credits" };

type Credit = { slug: string; name: string; file: string; author: string; license: string; licenseUrl: string | null; source: string };

export default function CreditsPage() {
  return (
    <div className="container-page max-w-4xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Image credits</h1>
      <p className="mt-2 text-muted">
        Product photos are from Wikimedia Commons and are used under the licences below. Photos may show a different colour
        or capacity than the item sold.
      </p>
      <ul className="card mt-8 divide-y divide-line text-sm">
        {(credits as Credit[]).map((c) => (
          <li key={c.slug} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 p-4">
            <span className="font-medium">{c.name}</span>
            <span className="text-muted">
              photo by {c.author},{" "}
              {c.licenseUrl ? <a href={c.licenseUrl} className="underline hover:text-ink" rel="license noreferrer" target="_blank">{c.license}</a> : c.license}
              {" · "}
              <a href={c.source} className="underline hover:text-ink" target="_blank" rel="noreferrer">source</a>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
