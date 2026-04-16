/**
 * BlogPreview.tsx
 *
 * Homepage section 10 — "Latest Guides".
 * Server Component: fetches the 3 most recent articles from Shopify blog.
 *
 * Renders null if the blog doesn't exist or has no articles.
 * Layout: 3-column card grid (stacks on mobile).
 * Each card: image + date + title + excerpt + "Read More" link.
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import { getBlogArticles } from "@/lib/shopify/queries/blog";
import { Button } from "@/components/ui/Button";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-AE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// ─────────────────────────────────────────────────────────────────
// Article card
// ─────────────────────────────────────────────────────────────────

interface ArticleCardProps {
  blogHandle: string;
  handle: string;
  title: string;
  excerpt: string | null;
  publishedAt: string;
  image: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  author: string | null;
  priority?: boolean;
}

function ArticleCard({
  blogHandle,
  handle,
  title,
  excerpt,
  publishedAt,
  image,
  author,
  priority = false,
}: ArticleCardProps) {
  const href = `/blogs/${blogHandle}/${handle}`;
  const date = formatDate(publishedAt);

  return (
    <article className="group card flex flex-col h-full overflow-hidden">
      {/* Image */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="block aspect-[16/9] overflow-hidden bg-sand relative shrink-0"
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 420px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sand-dark to-sand-darker" />
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap">
          {date && (
            <span className="flex items-center gap-1.5 type-body-sm text-neutral-400">
              <Calendar size={13} aria-hidden="true" />
              <time dateTime={publishedAt}>{date}</time>
            </span>
          )}
          {author && (
            <span className="type-body-sm text-neutral-400">
              · {author}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={href}>
          <h3 className="type-h5 font-semibold leading-snug text-primary group-hover:text-gold transition-colors duration-200 line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        {excerpt && (
          <p className="type-body-sm text-neutral-500 line-clamp-3 flex-1">
            {excerpt}
          </p>
        )}

        {/* Read more */}
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 type-label-lg text-gold font-semibold mt-auto hover:gap-2.5 transition-all duration-200"
          aria-label={`Read more: ${title}`}
        >
          Read Article
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export async function BlogPreview() {
  const articles = await getBlogArticles({ blogHandle: "news", first: 3 });

  if (articles.length === 0) return null;

  return (
    <section
      className="section-py bg-white"
      aria-labelledby="blog-preview-heading"
    >
      <div className="container-site">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 reveal">
          <div>
            <span className="type-overline-gold block mb-3">Expert Guides</span>
            <h2 className="type-h1" id="blog-preview-heading">
              Latest Articles
            </h2>
          </div>
          <Link href="/blogs/news" className="shrink-0 self-start sm:self-auto">
            <Button variant="secondary" size="sm">
              View All Articles
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.id}
              blogHandle={article.blogHandle}
              handle={article.handle}
              title={article.title}
              excerpt={article.excerpt}
              publishedAt={article.publishedAt}
              image={article.image}
              author={article.author}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
