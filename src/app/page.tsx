import { LandingPage } from "@/components/lazy/landing-page";
import { LazyShell } from "@/components/lazy/lazy-shell";

export default function Home() {
  return (
    <div className="lazy-root">
      <LazyShell>
        <LandingPage />
      </LazyShell>
    </div>
  );
}
