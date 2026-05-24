import Link from "next/link";

import { getPublishedComponents } from "@/registry/components";

import { Icons } from "./icons";

const VERSION = "v0.1";

// Honest list — components we plan to add next. Edit as the roadmap evolves.
const ROADMAP = ["Dialog", "Tabs", "Tooltip", "Command"];

const HELP_LINKS: Array<{
  href: string;
  label: string;
  icon: keyof typeof Icons;
}> = [
  { href: "#", label: "Star on GitHub", icon: "star" },
  { href: "#", label: "Suggest a component", icon: "externalArrow" },
  { href: "#", label: "Read the DESIGN.md", icon: "book" },
];

export function RightColumn() {
  const components = getPublishedComponents();

  return (
    <aside className="rightbar">
      {/* Registry snapshot */}
      <div className="rb-card reveal">
        <div className="rb-card-eyebrow">
          <span>Registry</span>
          <span className="version">{VERSION}</span>
        </div>
        <div className="rb-list">
          {components.map((c) => (
            <Link
              key={c.slug}
              href={`/components/${c.slug}`}
              className="rb-row"
            >
              <span className="dot published" />
              <span className="label">{c.title}</span>
              <span className="meta">{c.category}</span>
            </Link>
          ))}
        </div>
        <Link href="/components" className="rb-card-foot">
          <span>Browse all {components.length} components</span>
          {Icons.arrowRight}
        </Link>
      </div>

      {/* Roadmap */}
      <div className="rb-card reveal d-1">
        <div className="rb-card-eyebrow">
          <span>Up next</span>
          <span className="version">Roadmap</span>
        </div>
        <div className="rb-list">
          {ROADMAP.map((label) => (
            <div key={label} className="rb-row planned">
              <span className="dot planned" />
              <span className="label">{label}</span>
              <span className="meta">Planned</span>
            </div>
          ))}
        </div>
      </div>

      {/* Help the project */}
      <div className="rb-card reveal d-2">
        <div className="rb-card-eyebrow">
          <span>Help the project</span>
        </div>
        <div className="rb-list">
          {HELP_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="rb-link">
              <span className="icon">{Icons[link.icon]}</span>
              <span className="label">{link.label}</span>
              <span className="arrow">{Icons.arrowRight}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
