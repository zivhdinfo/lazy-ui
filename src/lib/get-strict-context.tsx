"use client";

import { createContext, useContext } from "react";

export function getStrictContext<T>(name = "Context") {
  const Context = createContext<T | null>(null);

  function useStrictContext() {
    const value = useContext(Context);
    if (value === null) {
      throw new Error(`use${name} must be used within its Provider`);
    }
    return value;
  }

  function useOptionalContext() {
    return useContext(Context);
  }

  function Provider({
    value,
    children,
  }: {
    value: T;
    children: React.ReactNode;
  }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  return [Provider, useStrictContext, useOptionalContext] as const;
}
