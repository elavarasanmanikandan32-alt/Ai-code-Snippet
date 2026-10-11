"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { analyzeSnippet } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

// Sync Clerk user to our database
export async function syncUser() {
  const user = await currentUser();
  if (!user) return null;

  return prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      avatarUrl: user.imageUrl || null,
    },
    create: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      avatarUrl: user.imageUrl || null,
    },
  });
}

// Create a new snippet
export async function createSnippet(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await syncUser();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const language = formData.get("language") as string;

  if (!title || !content || !language) {
    throw new Error("Title, content, and language are required");
  }

  // Get AI-generated tags and summary
  const analysis = await analyzeSnippet(content, language);

  const snippet = await prisma.snippet.create({
    data: {
      userId,
      title,
      content,
      language,
      tags: analysis.tags,
      summary: analysis.summary,
    },
  });

  revalidatePath("/dashboard");
  return snippet;
}

// Get all snippets for the current user
export async function getSnippets(search?: string, filterLanguage?: string, favoritesOnly?: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId };

  if (favoritesOnly) {
    where.isFavorite = true;
  }

  if (filterLanguage && filterLanguage !== "all") {
    where.language = filterLanguage;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ];
  }

  return prisma.snippet.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });
}

// Get a single snippet by ID
export async function getSnippetById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const snippet = await prisma.snippet.findUnique({
    where: { id },
  });

  if (!snippet || snippet.userId !== userId) {
    throw new Error("Snippet not found");
  }

  return snippet;
}

// Update a snippet
export async function updateSnippet(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const language = formData.get("language") as string;

  const existing = await prisma.snippet.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Snippet not found");
  }

  // Re-analyze with AI if content changed
  let tags = existing.tags;
  let summary = existing.summary;

  if (content !== existing.content || language !== existing.language) {
    const analysis = await analyzeSnippet(content, language);
    tags = analysis.tags;
    summary = analysis.summary;
  }

  const snippet = await prisma.snippet.update({
    where: { id },
    data: {
      title: title || existing.title,
      content: content || existing.content,
      language: language || existing.language,
      tags,
      summary,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
  return snippet;
}

// Delete a snippet
export async function deleteSnippet(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const snippet = await prisma.snippet.findUnique({ where: { id } });
  if (!snippet || snippet.userId !== userId) {
    throw new Error("Snippet not found");
  }

  await prisma.snippet.delete({ where: { id } });
  revalidatePath("/dashboard");
}

// Toggle favorite
export async function toggleFavorite(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const snippet = await prisma.snippet.findUnique({ where: { id } });
  if (!snippet || snippet.userId !== userId) {
    throw new Error("Snippet not found");
  }

  const updated = await prisma.snippet.update({
    where: { id },
    data: { isFavorite: !snippet.isFavorite },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
  return updated;
}
