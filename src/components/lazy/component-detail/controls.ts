/** Tiny builders that DRY up CustomizeControl declarations. */

import type { CustomizeControl, CustomizeValues } from "../customize";

type SliderOpts = {
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  format?: (n: number) => string;
  /** Force 2-per-row layout. See `SliderControl.wide` for details. */
  wide?: boolean;
};

export function slider(
  key: string,
  label: string,
  opts: SliderOpts,
): CustomizeControl {
  return { type: "slider", key, label, ...opts };
}

export function toggle(
  key: string,
  label: string,
  defaultValue: boolean,
): CustomizeControl {
  return { type: "toggle", key, label, defaultValue };
}

export function select<T extends string>(
  key: string,
  label: string,
  options: Array<{ value: T; label: string }>,
  defaultValue: T,
): CustomizeControl {
  return { type: "select", key, label, options, defaultValue };
}

/** Shared shape used by the family of letter-based text animations. */
export type LetterAnimProps = {
  trigger: boolean;
  wordStagger: number;
  letterStagger: number;
  entryDuration: number;
  exitDuration: number;
};

/** Reads the shared "Customize" values into our typed shape, with defaults. */
export function readLetterAnim(
  values: CustomizeValues,
  defaults: Omit<LetterAnimProps, "trigger">,
): LetterAnimProps {
  return {
    trigger: (values.trigger ?? true) as boolean,
    wordStagger: (values.wordStagger ?? defaults.wordStagger) as number,
    letterStagger: (values.letterStagger ?? defaults.letterStagger) as number,
    entryDuration: (values.entryDuration ?? defaults.entryDuration) as number,
    exitDuration: (values.exitDuration ?? defaults.exitDuration) as number,
  };
}

export function replayKeyFrom(deps: ReadonlyArray<unknown>): string {
  return deps.map((dep) => String(dep)).join("|");
}
