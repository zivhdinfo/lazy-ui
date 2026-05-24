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
      "Pull Lazy-ui components into your project through the shadcn CLI. One URL per component, no npm package.",
    lead:
      "Lazy-ui is delivered as a shadcn-style registry. You point the shadcn CLI at a component URL, and the source — implementation, index export, and any helper files — lands directly in your repo.",
    highlights: [
      {
        eyebrow: "Registry-only",
        title: "Not on npm.",
        body:
          "There is no @lazy-ui package to install. Each component is a self-contained registry item at /r/[name].json. The CLI fetches, the source is yours.",
      },
      {
        eyebrow: "Own the source",
        title: "Files in your repo.",
        body:
          "Generated code lands under components/lazy-ui. Rename it, restyle it, fork the interaction — nothing is hidden behind a bundle.",
      },
    ],
    sections: [
      {
        title: "Requirements",
        body:
          "Lazy-ui targets an existing shadcn-compatible React app. If shadcn/ui is wired up in your project, you already have everything you need.",
        bullets: [
          "A React app with Tailwind CSS configured (Next.js, Vite, or similar).",
          "shadcn/ui initialized — the cn() helper and components path alias.",
          "Run the CLI from the project root so generated file paths resolve.",
        ],
      },
      {
        title: "Add a component",
        body:
          "Open the component page, copy its registry URL, and pass it to the shadcn CLI. Internal Lazy-ui dependencies (e.g. a shared util another component needs) are fetched automatically.",
        bullets: [
          "Browse every component at /components — each page links to its slug.",
          "WebGL backgrounds and motion primitives declare their npm deps in the registry item; the CLI surfaces them on install.",
          "Commit the generated files. Lazy-ui is copy-and-paste by design.",
        ],
      },
      {
        title: "Update or replace",
        body:
          "Components don't auto-update — that's the trade-off for owning the source. Re-run the CLI with the same URL to overwrite, or merge changes by hand.",
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
    description:
      "Recent Lazy-ui component, docs, and registry updates in one place.",
    lead:
      "Track what changed before pulling a component again. Lazy-ui components are copied into your project, so the changelog helps you decide when to re-run the registry command or merge updates by hand.",
    highlights: [
      {
        eyebrow: "Current",
        title: "Registry-first updates.",
        body:
          "New components and docs changes ship through the registry pages, so each update stays inspectable before you copy it into your app.",
      },
      {
        eyebrow: "Ownership",
        title: "No silent upgrades.",
        body:
          "Lazy-ui does not auto-update installed files. Review changes, then pull the component again only when you want the new source.",
      },
    ],
    sections: [
      {
        title: "Latest",
        body:
          "The latest pass focuses on the docs shell, responsive navigation, and the component browsing experience.",
        bullets: [
          "Refined the docs sidebar into registry-driven groups.",
          "Added a responsive mobile navigation drawer for docs and components.",
          "Updated the top navigation with search, changelog, install, and GitHub star actions.",
        ],
      },
      {
        title: "Component updates",
        body:
          "Backgrounds, text animations, and motion primitives remain grouped by category so updates are easier to scan.",
        bullets: [
          "New and recently added components are marked in the sidebar and mobile menu.",
          "Registry metadata drives component counts and navigation groups.",
          "Install commands still target individual registry URLs, not a package bundle.",
        ],
      },
      {
        title: "How to consume changes",
        body:
          "Because generated files live in your repo, treat updates like normal source changes.",
        bullets: [
          "Open the component page and review the current source.",
          "Run the same shadcn add command to fetch the newest registry item.",
          "Compare the generated diff before keeping or merging local customizations.",
        ],
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
