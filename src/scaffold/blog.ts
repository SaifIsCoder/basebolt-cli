import type { CLIAnswers } from '../cli.js';
import { writeFile } from '../utils/writeFile.js';

export async function scaffoldBlog(projectDir: string, a: CLIAnswers): Promise<void> {
  // ── Blog pages ────────────────────────────────────────────────────
  await writeFile(projectDir, 'src/app/blog/page.tsx',            blogListPage());
  await writeFile(projectDir, 'src/app/blog/[slug]/page.tsx',     blogPostPage());

  // ── MDX support lib ───────────────────────────────────────────────
  await writeFile(projectDir, 'src/lib/blog.ts',                  blogLib());

  // ── Sample posts ──────────────────────────────────────────────────
  await writeFile(projectDir, 'content/blog/hello-world.mdx',     samplePost1(a));
  await writeFile(projectDir, 'content/blog/why-we-built-this.mdx', samplePost2(a));

  // ── Blog components ───────────────────────────────────────────────
  await writeFile(projectDir, 'src/components/blog/PostCard.tsx', postCard());
  await writeFile(projectDir, 'src/components/blog/MDXContent.tsx', mdxContent());

  // ── SEO ───────────────────────────────────────────────────────────
  await writeFile(projectDir, 'src/app/sitemap.ts',               sitemap(a));
  await writeFile(projectDir, 'src/app/robots.ts',                robots(a));
  await writeFile(projectDir, 'src/app/feed.xml/route.ts',        rssFeed(a));

  // ── OG Image API route ────────────────────────────────────────────
  await writeFile(projectDir, 'src/app/api/og/route.tsx',         ogImage(a));
}

// ── Blog lib — reads MDX files from /content/blog ────────────────────

function blogLib(): string {
  return `import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export interface PostMeta {
  slug:        string;
  title:       string;
  description: string;
  date:        string;
  author?:     string;
  tags?:       string[];
  image?:      string;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((file) => {
      const slug    = file.replace(/\\.mdx?$/, '');
      const raw     = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
      const { data } = matter(raw);
      return {
        slug,
        title:       data.title       ?? 'Untitled',
        description: data.description ?? '',
        date:        data.date        ?? new Date().toISOString().split('T')[0],
        author:      data.author,
        tags:        data.tags,
        image:       data.image,
      } satisfies PostMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, \`\${slug}.mdx\`);
  const fallback = path.join(BLOG_DIR, \`\${slug}.md\`);
  const target   = fs.existsSync(filePath) ? filePath : fs.existsSync(fallback) ? fallback : null;

  if (!target) return null;

  const raw             = fs.readFileSync(target, 'utf8');
  const { data, content } = matter(raw);

  return {
    slug,
    title:       data.title       ?? 'Untitled',
    description: data.description ?? '',
    date:        data.date        ?? '',
    author:      data.author,
    tags:        data.tags,
    image:       data.image,
    content,
  };
}
`;
}

// ── Blog listing page ─────────────────────────────────────────────────

function blogListPage(): string {
  return `import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { PostCard }   from '@/components/blog/PostCard';

export const metadata: Metadata = {
  title:       'Blog',
  description: 'Articles, tutorials, and updates.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-2 text-4xl font-bold">Blog</h1>
      <p className="mb-12 text-gray-500">Articles, tutorials, and updates.</p>

      {posts.length === 0 ? (
        <p className="text-gray-400">No posts yet. Add .mdx files to /content/blog.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
`;
}

// ── Individual post page ──────────────────────────────────────────────

function blogPostPage(): string {
  return `import type { Metadata } from 'next';
import { notFound }      from 'next/navigation';
import { getAllPosts, getPost } from '@/lib/blog';
import { MDXContent }    from '@/components/blog/MDXContent';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return {};

  return {
    title:       post.title,
    description: post.description,
    openGraph: {
      title:       post.title,
      description: post.description,
      type:        'article',
      publishedTime: post.date,
      images: post.image
        ? [post.image]
        : [\`/api/og?title=\${encodeURIComponent(post.title)}\`],
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-3 text-sm text-gray-500">
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          {post.author && <span>· {post.author}</span>}
        </div>
        <h1 className="mb-4 text-4xl font-bold leading-tight">{post.title}</h1>
        {post.description && (
          <p className="text-xl text-gray-500">{post.description}</p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <article className="prose prose-invert max-w-none">
        <MDXContent source={post.content} />
      </article>

      {/* Back link */}
      <div className="mt-16 border-t border-white/10 pt-8">
        <a href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to blog
        </a>
      </div>
    </main>
  );
}
`;
}

// ── PostCard component ────────────────────────────────────────────────

function postCard(): string {
  return `import Link from 'next/link';
import type { PostMeta } from '@/lib/blog';

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={\`/blog/\${post.slug}\`}
      className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-green-500/30"
    >
      <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
        <time dateTime={post.date}>
          {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </time>
        {post.author && <span>· {post.author}</span>}
      </div>

      <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
        {post.title}
      </h2>

      {post.description && (
        <p className="mb-4 text-sm leading-relaxed text-gray-400 line-clamp-2">
          {post.description}
        </p>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-gray-400">
              {tag}
            </span>
          ))}
        </div>
      )}

      <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-green-400">
        Read more →
      </span>
    </Link>
  );
}
`;
}

// ── MDX renderer component ────────────────────────────────────────────

function mdxContent(): string {
  return `'use client';

// Simple MDX renderer using next-mdx-remote
// Install: npm install next-mdx-remote
// Or use @next/mdx for static MDX support

interface MDXContentProps {
  source: string;
}

export function MDXContent({ source }: MDXContentProps) {
  // Basic markdown → HTML rendering without extra deps
  // Replace with next-mdx-remote for full MDX support
  const html = source
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-8 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim,  '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim,   '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>')
    .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
    .replace(/\\*(.*?)\\*/gim,   '<em>$1</em>')
    .replace(/\`(.*?)\`/gim,    '<code class="rounded bg-white/10 px-1.5 py-0.5 text-sm font-mono text-green-400">$1</code>')
    .replace(/^> (.*$)/gim,    '<blockquote class="border-l-4 border-green-500/50 pl-4 italic text-gray-400">$1</blockquote>')
    .replace(/^\\- (.*$)/gim,   '<li class="ml-4 list-disc">$1</li>')
    .replace(/\\n\\n/gim,        '</p><p class="mb-4">')
    .replace(/^/,              '<p class="mb-4">')
    .replace(/$/,              '</p>');

  return (
    <div
      className="text-gray-300 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
`;
}

// ── Sample blog posts ─────────────────────────────────────────────────

function samplePost1(a: CLIAnswers): string {
  return `---
title: "Hello World — Welcome to ${a.projectName}"
description: "This is the first post on our blog. We're excited to share what we're building."
date: "${new Date().toISOString().split('T')[0]}"
author: "The Team"
tags: ["announcement", "product"]
---

# Hello World

Welcome to the ${a.projectName} blog. This is where we'll share product updates, tutorials, and behind-the-scenes looks at how we're building.

## What We're Building

${a.projectName} is a SaaS product built with Next.js, Prisma, and TypeScript. We started building because we saw a clear problem in the market — and we're here to solve it.

## What's Next

We'll be posting regularly about:

- Product updates and new features
- Technical deep-dives
- Lessons learned building in public

Stay tuned.
`;
}

function samplePost2(a: CLIAnswers): string {
  return `---
title: "Why We Built ${a.projectName}"
description: "The story behind ${a.projectName} — the problem we saw, the solution we built, and where we're going."
date: "${new Date(Date.now() - 86400000).toISOString().split('T')[0]}"
author: "Founder"
tags: ["story", "saas", "buildinpublic"]
---

# Why We Built ${a.projectName}

Every great product starts with a real problem. Here's ours.

## The Problem

We kept running into the same situation over and over. Before we could build the actual product, we had to spend weeks setting up infrastructure that had nothing to do with our core idea.

Authentication. Database. Payments. Email. Deployment.

Same work. Every. Single. Time.

## The Solution

${a.projectName} was born from that frustration. We wanted a way to skip the setup and get straight to building.

## Building in Public

We're sharing everything — the wins, the failures, and the lessons. Follow along as we build.
`;
}

// ── Sitemap ───────────────────────────────────────────────────────────

function sitemap(a: CLIAnswers): string {
  const base = `https://${a.projectName}.vercel.app`;
  return `import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '${base}';
  const posts   = getAllPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0  },
    { url: \`\${baseUrl}/blog\`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9  },
    { url: \`\${baseUrl}/docs\`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8  },
  ];

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url:              \`\${baseUrl}/blog/\${post.slug}\`,
    lastModified:     new Date(post.date),
    changeFrequency:  'monthly',
    priority:         0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
`;
}

// ── Robots.txt ────────────────────────────────────────────────────────

function robots(a: CLIAnswers): string {
  const base = `https://${a.projectName}.vercel.app`;
  return `import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '${base}';
  return {
    rules: [
      {
        userAgent: '*',
        allow:    '/',
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },
    ],
    sitemap: \`\${baseUrl}/sitemap.xml\`,
  };
}
`;
}

// ── RSS Feed ──────────────────────────────────────────────────────────

function rssFeed(a: CLIAnswers): string {
  const base = `https://${a.projectName}.vercel.app`;
  return `import { getAllPosts } from '@/lib/blog';
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '${base}';
  const posts   = getAllPosts();

  const items = posts
    .map((post) => \`
    <item>
      <title><![CDATA[\${post.title}]]></title>
      <description><![CDATA[\${post.description}]]></description>
      <link>\${baseUrl}/blog/\${post.slug}</link>
      <guid>\${baseUrl}/blog/\${post.slug}</guid>
      <pubDate>\${new Date(post.date).toUTCString()}</pubDate>
      \${post.author ? \`<author>\${post.author}</author>\` : ''}
    </item>\`)
    .join('');

  const xml = \`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${a.projectName} Blog</title>
    <description>Articles, tutorials, and updates from ${a.projectName}</description>
    <link>\${baseUrl}</link>
    <atom:link href="\${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <lastBuildDate>\${new Date().toUTCString()}</lastBuildDate>
    \${items}
  </channel>
</rss>\`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
`;
}

// ── OG Image ──────────────────────────────────────────────────────────

function ogImage(a: CLIAnswers): string {
  return `import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? '${a.projectName}';

  return new ImageResponse(
    (
      <div
        style={{
          width:           '100%',
          height:          '100%',
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          background:      '#0a0a0a',
          padding:         '60px',
        }}
      >
        {/* Brand name */}
        <div style={{ fontSize: 28, color: '#22c55e', fontWeight: 700, marginBottom: 24 }}>
          ${a.projectName}
        </div>

        {/* Post title */}
        <div
          style={{
            fontSize:   56,
            fontWeight: 700,
            color:      '#ffffff',
            textAlign:  'center',
            lineHeight: 1.2,
            maxWidth:   900,
          }}
        >
          {title}
        </div>

        {/* Bottom bar */}
        <div style={{ position: 'absolute', bottom: 40, fontSize: 18, color: '#6b7280' }}>
          basebolt.dev
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
`;
}
