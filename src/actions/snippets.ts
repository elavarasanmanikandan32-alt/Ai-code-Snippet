"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { analyzeSnippet } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Sync Clerk user to our database safely
export async function syncUser(forcedUserId?: string) {
  try {
    const { userId: authUserId } = await auth();
    const id = forcedUserId || authUserId;
    if (!id) return null;

    let user = null;
    try {
      user = await currentUser();
    } catch (e) {
      console.warn("Could not retrieve currentUser from Clerk:", e);
    }

    const email =
      user?.emailAddresses?.[0]?.emailAddress ||
      `${id}@clerk.user`;

    const name = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || null
      : null;

    return await prisma.user.upsert({
      where: { id },
      update: {
        email,
        name,
        avatarUrl: user?.imageUrl || null,
      },
      create: {
        id,
        email,
        name,
        avatarUrl: user?.imageUrl || null,
      },
    });
  } catch (err) {
    console.error("syncUser error:", err);
    return null;
  }
}

// Create a new snippet
export async function createSnippet(formData: FormData): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized. Please sign in again." };
    }

    // Always ensure user exists in database for the foreign key
    await syncUser(userId);

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const language = formData.get("language") as string;

    if (!title || !content || !language) {
      return { success: false, error: "Title, content, and language are required." };
    }

    // Get AI-generated tags and summary (safe fallback inside analyzeSnippet)
    const analysis = await analyzeSnippet(content, language);

    const snippet = await prisma.snippet.create({
      data: {
        userId,
        title: title.trim(),
        content,
        language,
        tags: analysis.tags,
        summary: analysis.summary,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: snippet };
  } catch (err) {
    console.error("createSnippet failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create snippet in database.",
    };
  }
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
export async function updateSnippet(formData: FormData): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized. Please sign in again." };
    }

    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const language = formData.get("language") as string;

    if (!id) {
      return { success: false, error: "Snippet ID is required." };
    }

    const existing = await prisma.snippet.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Snippet not found or unauthorized." };
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
        title: title ? title.trim() : existing.title,
        content: content || existing.content,
        language: language || existing.language,
        tags,
        summary,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${id}`);
    return { success: true, data: snippet };
  } catch (err) {
    console.error("updateSnippet failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update snippet in database.",
    };
  }
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
