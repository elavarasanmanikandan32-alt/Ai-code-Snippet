import { getSnippetById } from "@/actions/snippets";
import { SnippetForm } from "@/components/dashboard/SnippetForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSnippetPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const snippet = await getSnippetById(id);
    return (
      <SnippetForm
        mode="edit"
        initialData={{
          id: snippet.id,
          title: snippet.title,
          content: snippet.content,
          language: snippet.language,
        }}
      />
    );
  } catch {
    notFound();
  }
}
