export type DocsTopic = {
  slug: string;
  title: string;
  group: "Get Started";
  badge: string;
  description: string;
  lead: string;
  highlights: Array<{
    eyebrow: string;
    title: string;
    body: string;
  }>;
  sections: Array<{
    title: string;
    body: string;
    bullets: string[];
  }>;
  code?: Array<{
    title: string;
    body: string;
  }>;
};

export const DOCS_TOPICS: DocsTopic[] = [
  {
    slug: "installation",
    title: "Installation",
    group: "Get Started",
    badge: "Get Started",
    description:
      "You own the source. Pull components in through the shadcn CLI — one registry URL each, no npm package, no version to track.",
    lead:
      "You own every file you install. Point the shadcn CLI at a component's registry URL and the source — implementation, exports, and any helpers — lands straight in your repo, fully editable.",
    highlights: [
      {
        eyebrow: "Registry-only",
        title: "Not on npm.",
        body:
          "No package to install. Each component is a self-contained registry item at /r/[name].json. The CLI fetches it; the source is yours to keep.",
      },
      {
        eyebrow: "Own the source",
        title: "Files in your repo.",
        body:
          "Generated code lands under components/lazy-ui. Rename it, restyle it, fork the interaction — nothing hides behind a bundle.",
      },
    ],
    sections: [
      {
        title: "Requirements",
        body:
          "These drop into an existing shadcn-compatible React app. If shadcn/ui is already wired up, you have everything you need.",
        bullets: [
          "A React app with Tailwind CSS configured (Next.js, Vite, or similar).",
          "shadcn/ui initialized — the cn() helper and components path alias.",
          "Run the CLI from the project root so generated file paths resolve.",
        ],
      },
      {
        title: "Add a component",
        body:
          "Open a component page, copy its registry URL, pass it to the shadcn CLI. Internal dependencies — a shared util another component needs — are fetched for you.",
        bullets: [
          "Browse every component from the sidebar — each page links to its slug.",
          "WebGL backgrounds and motion primitives declare their npm deps in the registry item — the CLI installs them with the component.",
          "Commit the generated files. This is copy-and-paste by design.",
        ],
      },
      {
        title: "Update or replace",
        body:
          "Nothing auto-updates — that's the trade-off for owning the source. Re-run the CLI with the same URL to overwrite, or merge changes by hand.",
        bullets: [
          "Re-running shadcn add will prompt before overwriting an existing file.",
          "Diff against the registry source on GitHub to see what changed.",
          "Once you've customized a component heavily, treat it as your own code.",
        ],
      },
    ],
    code: [
      {
        title: "Add a component",
        body: "npx shadcn@latest add https://2lazyui.com/r/liquid-chrome.json",
      },
      {
        title: "From a fresh Next.js project",
        body:
          "npx create-next-app@latest my-app\ncd my-app\nnpx shadcn@latest init\nnpx shadcn@latest add https://2lazyui.com/r/liquid-chrome.json",
      },
      {
        title: "Other package managers",
        body:
          "pnpm dlx shadcn@latest add https://2lazyui.com/r/liquid-chrome.json\nbunx shadcn@latest add https://2lazyui.com/r/liquid-chrome.json\nyarn dlx shadcn@latest add https://2lazyui.com/r/liquid-chrome.json",
      },
    ],
  },
  {
    slug: "changelog",
    title: "Changelog",
    group: "Get Started",
    badge: "Updates",
    description: "Component, docs, and registry updates — newest first.",
    lead:
      "You own the source, so nothing updates behind your back. Here's what changed; re-run the registry command when you want the new code.",
    // Rendered by ChangelogPage (changelog-page.tsx) from CHANGELOG_RELEASES,
    // not the generic topic layout — these stay empty on purpose.
    highlights: [],
    sections: [],
  },
];

export type ChangelogChange = {
  tag: "Added" | "Changed" | "Fixed" | "Removed";
  text: string;
};

export type ChangelogRelease = {
  version: string;
  date: string;
  summary: string;
  changes: ChangelogChange[];
};

// Newest first — the changelog page renders them in this order.
export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: "1.2.0",
    date: "Jun 10, 2026",
    summary: "Reworked the component detail page.",
    changes: [
      {
        tag: "Changed",
        text: "Rebuilt the component detail page with a live preview, prop controls, and one-line install.",
      },
      {
        tag: "Changed",
        text: "Tuned the detail layout to stay readable down to mobile widths.",
      },
    ],
  },
  {
    version: "1.1.0",
    date: "Jun 9, 2026",
    summary: "Refreshed the landing page.",
    changes: [
      {
        tag: "Changed",
        text: "Redesigned the landing page with a new hero, live component previews, and scroll reveals.",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "May 24, 2026",
    summary: "First public release.",
    changes: [
      {
        tag: "Added",
        text: "Initial release — React and Tailwind components installable through the shadcn registry.",
      },
      {
        tag: "Added",
        text: "WebGL backgrounds, text and motion effects, device mocks, and interactive primitives.",
      },
    ],
  },
];

export function getDocsTopic(slug: string): DocsTopic | undefined {
  return DOCS_TOPICS.find((topic) => topic.slug === slug);
}

export function getDocsTopics(group?: DocsTopic["group"]): DocsTopic[] {
  return group
    ? DOCS_TOPICS.filter((topic) => topic.group === group)
    : DOCS_TOPICS;
}
