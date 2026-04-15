"use client";

import * as React from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

export interface ImageProps extends NextImageProps {
  fallbackAlt?: string;
  containerClassName?: string;
}

export const Image = ({
  className,
  containerClassName,
  alt,
  fallbackAlt = "Image",
  onLoad,
  ...props
}: ImageProps) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <NextImage
        alt={alt || fallbackAlt}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={(e) => {
          setIsLoaded(true);
          if (onLoad) onLoad(e);
        }}
        {...props}
      />
      {!isLoaded && (
        <Skeleton className="absolute inset-0 z-0 h-full w-full" />
      )}
    </div>
  );
};
