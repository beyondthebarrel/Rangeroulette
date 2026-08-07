import type { ImgHTMLAttributes } from "react";
import { useRetryingImageSrc } from "../hooks/useRetryingImageSrc";

export function RetryImage({
  src,
  ...rest
}: { src: string } & ImgHTMLAttributes<HTMLImageElement>) {
  const { src: resolvedSrc, onError } = useRetryingImageSrc(src);
  return <img src={resolvedSrc} onError={onError} {...rest} />;
}
