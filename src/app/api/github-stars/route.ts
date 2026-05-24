import { NextResponse } from "next/server";

export const revalidate = 300;

const NAME_RE = /^[a-zA-Z0-9_.-]+$/;

type GithubRepoResponse = {
  stargazers_count?: number;
  html_url?: string;
};

function isValidPart(value: string | null) {
  return Boolean(value && NAME_RE.test(value));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!isValidPart(owner) || !isValidPart(repo)) {
    return NextResponse.json(
      { error: "Missing or invalid owner/repo" },
      { status: 400 },
    );
  }

  const url = `https://api.github.com/repos/${encodeURIComponent(owner!)}/${encodeURIComponent(repo!)}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    next: { revalidate },
  });

  if (response.status === 404) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to load GitHub stars" },
      { status: 502 },
    );
  }

  const data = (await response.json()) as GithubRepoResponse;

  return NextResponse.json(
    {
      stars: data.stargazers_count ?? 0,
      owner,
      repo,
      url: data.html_url ?? `https://github.com/${owner}/${repo}`,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    },
  );
}
