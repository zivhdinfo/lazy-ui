"use client";

import Link from "next/link";

import { CodePreview } from "@/components/lazy-ui/code-preview";
import { CopyButton } from "@/components/lazy-ui/copy-button";

import type { DocsTopic } from "./docs-content";
import { DOCS_TOPICS } from "./docs-content";
import { Icons } from "./icons";
import { rippleClick } from "./ripple";
import { HighlightTsx } from "./syntax-highlight";
import { attachSpotlight, useScrollReveal } from "./use-scroll-reveal";

function neighborTopics(slug: string) {
  const index = DOCS_TOPICS.findIndex((topic) => topic.slug === slug);
  return {
    prev: index > 0 ? DOCS_TOPICS[index - 1] : undefined,
    next:
      index >= 0 && index < DOCS_TOPICS.length - 1
        ? DOCS_TOPICS[index + 1]
        : undefined,
  };
}

export function DocsTopicPage({ topic }: { topic: DocsTopic }) {
  useScrollReveal();
  const bindSpot = (node: HTMLDivElement | null) => attachSpotlight(node);
  const { prev, next } = neighborTopics(topic.slug);

  return (
    <main className="main">
      <div className="crumb reveal">
        <Link href="/">Home</Link>
        <span className="sep">›</span>
        <Link href="/docs">Docs</Link>
        <span className="sep">›</span>
        <span className="cur">{topic.title}</span>
      </div>

      <div className="docs-hero reveal">
        <div className="tile-eyebrow">
          <span className="dot" />
          {topic.badge}
        </div>
        <h1 className="page-title docs-title">{topic.title}</h1>
        <p className="page-sub">{topic.lead}</p>
        <div className="docs-action-row">
          <Link
            className="lazy-btn primary"
            href="/components"
            onClick={rippleClick}
          >
            {Icons.arrowRight}
            Browse components
          </Link>
          <Link className="lazy-btn" href="/docs" onClick={rippleClick}>
            {Icons.book}
            Back to intro
          </Link>
        </div>
      </div>

      <section className="block reveal d-1">
        <h2 className="block-title">The short version</h2>
        <p className="block-sub">{topic.description}</p>
        <div className="doc-card-grid">
          {topic.highlights.map((item, index) => (
            <div
              key={item.title}
              className={`doc-card reveal d-${(index % 3) + 1}`}
              ref={bindSpot}
            >
              <div className="tile-eyebrow">
                <span className="dot" />
                {item.eyebrow}
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="block reveal d-2">
        <h2 className="block-title">Details</h2>
        <div className="doc-section-list">
          {topic.sections.map((section, index) => (
            <article key={section.title} className={`doc-section reveal d-${index + 1}`}>
              <div>
                <span className="doc-section-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{section.title}</h3>
              </div>
              <div className="doc-section-body">
                <p>{section.body}</p>
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {topic.code && topic.code.length > 0 && (
        <section className="block reveal d-3">
          <h2 className="block-title">Copyable bits</h2>
          <p className="block-sub">
            Commands and snippets match the registry paths used by this project.
          </p>
          <div className="doc-code-stack">
            {topic.code.map((item) => (
              <CodePreview
                key={item.title}
                code={item.body}
                title={item.title}
                meta={<CopyButton content={item.body} text label="Copy" iconAnimate="draw" />}
                maxLines={8}
              >
                <HighlightTsx source={item.body} />
              </CodePreview>
            ))}
          </div>
        </section>
      )}

      <nav className="doc-link-row reveal d-4" aria-label="Docs pagination">
        {prev ? (
          <Link href={`/docs/${prev.slug}`} className="doc-link-card">
            <span>Previous</span>
            <strong>{prev.title}</strong>
          </Link>
        ) : (
          <Link href="/docs" className="doc-link-card">
            <span>Previous</span>
            <strong>Introduction</strong>
          </Link>
        )}
        {next ? (
          <Link href={`/docs/${next.slug}`} className="doc-link-card next">
            <span>Next</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <Link href="/components" className="doc-link-card next">
            <span>Next</span>
            <strong>Components</strong>
          </Link>
        )}
      </nav>
    </main>
  );
}
