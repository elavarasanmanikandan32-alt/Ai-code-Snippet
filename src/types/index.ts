export interface Snippet {
  id: string;
  userId: string;
  title: string;
  content: string;
  language: string;
  summary: string | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSnippetInput {
  title: string;
  content: string;
  language: string;
}

export interface UpdateSnippetInput {
  id: string;
  title?: string;
  content?: string;
  language?: string;
}
