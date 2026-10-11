import { getSnippets, syncUser } from "@/actions/snippets";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Snippet } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let snippets: Snippet[] = [];
  try {
    await syncUser();
    snippets = await getSnippets();
  } catch (error) {
    console.warn("Database connection notice:", error);
  }

  return <DashboardContent snippets={snippets} />;
}
