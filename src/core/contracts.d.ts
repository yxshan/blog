export type Difficulty = "easy" | "medium" | "hard";

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
  modulePath?: string;
}

export interface PostDocument extends PostMeta {
  content?: string;
}

export interface PostQuery {
  text?: string;
  tags?: string[];
  category?: string | null;
  sort?: "date-desc" | "date-asc";
}

export interface PostCatalog {
  listPublished(): PostDocument[];
  listAll(options?: { includeDrafts?: boolean }): PostDocument[];
  findBySlug(
    slug: string,
    options?: { includeDrafts?: boolean },
  ): PostDocument | null;
  query(
    query?: PostQuery,
    options?: { includeDrafts?: boolean },
  ): PostDocument[];
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

export interface SubscriptionAdapter {
  isEnabled(): boolean;
  subscribe(input: {
    email: string;
  }): Promise<{ ok: boolean; message?: string }>;
}
