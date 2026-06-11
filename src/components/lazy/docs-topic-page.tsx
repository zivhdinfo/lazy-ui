"use client";

import Link from "next/link";

import { CodePreview } from "@/components/lazy-ui/code-preview";
import { CopyButton } from "@/components/lazy-ui/copy-button";

import type { DocsTopic } from "./docs-content";
import { DOCS_TOPICS } from "./docs-content";
import { Icons } from "./icons";
import { rippleClick } from "./ripple";
import { HighlightTsx } from "./syntax-highlight";
import { useScrollReveal } from "./use-scroll-reveal";

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
  const { prev, next } = neighborTopics(topic.slug);

  return (
    <main className="main">
      <h1 className="page-title reveal">{topic.title}</h1>
      <p className="page-sub reveal d-1">{topic.lead}</p>

      <div className="action-row reveal d-2">
        <Link className="lazy-btn" href="/get-started" onClick={rippleClick}>
          {Icons.arrowRight}
          Browse components
        </Link>
        <Link className="lazy-btn" href="/get-started" onClick={rippleClick}>
          {Icons.book}
          Back to intro
        </Link>
      </div>

      <section className="block reveal d-1">
        <h2 className="block-title">The short version</h2>
        <p className="block-sub">{topic.description}</p>
        <div className="doc-section-list">
          {topic.highlights.map((item, index) => (
            <article
              key={item.title}
              className={`doc-section reveal d-${index + 1}`}
            >
              <div>
                <span className="doc-section-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{item.title}</h3>
              </div>
              <div className="doc-section-body">
                <p>{item.body}</p>
              </div>
            </article>
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
        <section className="block reveal d-3 code-themed">
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
          <Link href={`/get-started/${prev.slug}`} className="doc-link-card">
            <span>Previous</span>
            <strong>{prev.title}</strong>
          </Link>
        ) : (
          <Link href="/get-started" className="doc-link-card">
            <span>Previous</span>
            <strong>Introduction</strong>
          </Link>
        )}
        {next ? (
          <Link href={`/get-started/${next.slug}`} className="doc-link-card next">
            <span>Next</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <Link href="/get-started" className="doc-link-card next">
            <span>Next</span>
            <strong>Components</strong>
          </Link>
        )}
      </nav>
    </main>
  );
}
