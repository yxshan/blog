export type Difficulty = "easy" | "medium" | "hard";
export type PostSort = "relevance" | "date-desc" | "date-asc";

export interface PostMeta {
  slug: string;
  category: string;
  title: string;
  date: string | null;
  updated: string | null;
  tags: string[];
  difficulty: Difficulty | null;
  leetcode: string | null;
  draft: boolean;
  excerpt: string;
  modulePath: string;
}

export interface PostDocument extends PostMeta {
  content: string;
}

export interface PostSource {
  filePath: string;
  frontmatter: Record<string, unknown>;
  content: string;
}

export interface SearchDocument extends PostMeta {
  searchText: string;
}

export interface RuntimePost extends Omit<PostMeta, "date" | "updated"> {
  date: Date | null;
  updated: Date | null;
  searchText: string;
}

export interface PostQuery {
  text?: string;
  tags?: string[];
  category?: string | null;
  sort?: PostSort;
  page?: number;
  pageSize?: number;
}

export interface PostCatalog {
  listPublished(): RuntimePost[];
  listAll(options?: { includeDrafts?: boolean }): RuntimePost[];
  findBySlug(
    slug: string,
    options?: { includeDrafts?: boolean },
  ): RuntimePost | null;
  query(
    query?: PostQuery,
    options?: { includeDrafts?: boolean },
  ): RuntimePost[];
}

export interface SiteConfig {
  siteUrl: string;
  basePath: string;
  locale: string;
  comments: { enabled: boolean };
}

export interface CommentsAdapter {
  isEnabled(): boolean;
  mount(container: HTMLElement, context: { slug: string }): () => void;
}

export interface AnalyticsAdapter {
  track(event: string, properties?: Record<string, unknown>): void;
}

export interface ErrorReporter {
  report(error: Error, context?: Record<string, unknown>): void;
}

export interface SubscriptionAdapter {
  isEnabled(): boolean;
  subscribe(input: {
    email: string;
  }): Promise<{ ok: boolean; message?: string }>;
}
