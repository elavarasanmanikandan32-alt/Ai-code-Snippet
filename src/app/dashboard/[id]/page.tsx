import { getSnippetById } from "@/actions/snippets";
import { SnippetView } from "@/components/dashboard/SnippetView";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewSnippetPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const snippet = await getSnippetById(id);
    return <SnippetView snippet={snippet} />;
  } catch {
    notFound();
  }
}
