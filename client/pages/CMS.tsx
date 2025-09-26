import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BuilderComponent, builder } from "@builder.io/react";
import "@/lib/builder";

export default function CMS() {
  const location = useLocation();
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const apiKey = import.meta.env.VITE_PUBLIC_BUILDER_KEY as string | undefined;
    if (!apiKey) {
      setError("Builder.io public key is not set. Please set VITE_PUBLIC_BUILDER_KEY in .env");
      return;
    }
    // Map /cms/* -> /* for Builder's urlPath matching
    const path = location.pathname.replace(/^\/cms/, "") || "/";
    builder
      .get("page", { userAttributes: { urlPath: path } })
      .promise()
      .then((res) => setContent(res))
      .catch(() => setError("Failed to load content from Builder.io"));
  }, [location.pathname]);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        {error && (
          <div className="rounded-xl border bg-red-50 p-4 text-red-700">{error}</div>
        )}
        {!error && !content && (
          <div className="rounded-xl border bg-white/70 p-6 text-slate-600">Loading content…</div>
        )}
        {content && <BuilderComponent model="page" content={content} />}
      </div>
    </Layout>
  );
}
