import Image from "next/image";

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Lazy-ui"
      width={size}
      height={size}
      priority
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
