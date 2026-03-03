import Image, { type ImageProps } from "next/image";
import { focalPointToObjectPosition, parseMediaUrl } from "@/lib/media-url";

type CmsImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: unknown;
  alt: string;
};

export function CmsImage({ src, alt, sizes, style, ...props }: CmsImageProps) {
  const parsed = parseMediaUrl(src);
  if (!parsed.src) return null;

  return (
    <Image
      {...props}
      src={parsed.src}
      alt={alt}
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      style={{
        ...style,
        objectPosition: focalPointToObjectPosition(parsed.focalPoint),
      }}
    />
  );
}
