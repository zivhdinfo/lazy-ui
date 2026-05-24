import type { CounterEffect } from "@/components/lazy-ui/counter";
import {
  GithubStarsButton,
  type GithubStarsDisplayFormat,
  type GithubStarsHoverMode,
  type GithubStarsVariant,
} from "@/components/lazy-ui/github-stars-button";

import type { CustomizeValues } from "../../../customize";

const STATIC_FALLBACK = 12_848;

export function Preview({ values }: { values: CustomizeValues }) {
  const username = (values.username as string | undefined) ?? "shadcn-ui";
  const repo = (values.repo as string | undefined) ?? "ui";
  const showCount = (values.showCount ?? true) as boolean;
  const fetchStars = (values.fetchStars ?? true) as boolean;
  const counterEffect = (values.counterEffect ?? "3d") as CounterEffect;
  const variant = (values.variant ?? "default") as GithubStarsVariant;
  const displayFormat = (values.displayFormat ?? "compact") as
    GithubStarsDisplayFormat;
  const hoverMode = (values.hoverMode ?? "none") as GithubStarsHoverMode;
  const hoverDuration = (values.hoverDuration ?? 300) as number;

  // Remount on these so the counter animates from 0 instead of jumping.
  const replayKey = `${username}/${repo}|${counterEffect}|${fetchStars}|${variant}|${hoverMode}`;

  return (
    <div className="flex min-h-72 items-center justify-center">
      <GithubStarsButton
        key={replayKey}
        username={username}
        repo={repo}
        label="GitHub"
        initialValue={0}
        {...(fetchStars
          ? { fetchStars: true, apiEndpoint: "/api/github-stars" }
          : { value: STATIC_FALLBACK })}
        showCount={showCount}
        counterEffect={counterEffect}
        variant={variant}
        displayFormat={displayFormat}
        hoverMode={hoverMode}
        hoverLabel="Star this"
        hoverContent="Star on GitHub"
        hoverDuration={hoverDuration}

/>
    </div>
  );
}
