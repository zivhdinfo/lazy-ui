"use client";

import Link from "next/link";

import { CHANGELOG_RELEASES, type DocsTopic } from "./docs-content";
import { Icons } from "./icons";
import { rippleClick } from "./ripple";
import { useScrollReveal } from "./use-scroll-reveal";

// Dated changelog — a reverse-chronological list of releases. Mirrors the
// Intro / Installation page skeleton (hero + action row + `.block` section with
// a `.doc-section-list`) so its size, layout, and display area match exactly;
// only the section content is changelog-specific (date heading, version tag,
// grouped change bullets).
export function ChangelogPage({ topic }: { topic: DocsTopic }) {
  useScrollReveal();

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
        <h2 className="block-title">Releases</h2>
        <div className="doc-section-list">
          {CHANGELOG_RELEASES.map((release, index) => (
            <article
              key={release.date}
              className={`doc-section reveal d-${index + 1}`}
            >
              <div>
                <span className="doc-section-index">v{release.version}</span>
                <h3>{release.date}</h3>
              </div>
              <div className="doc-section-body">
                <p>{release.summary}</p>
                <ul>
                  {release.changes.map((change) => (
                    <li key={change.text}>
                      <strong style={{ color: "var(--fg-1)", fontWeight: 600 }}>
                        {change.tag}
                      </strong>{" "}
                      — {change.text}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
