import { CSSProperties, HTMLAttributes, SVGProps } from 'react';

type BrandIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

type BrandImageProps = HTMLAttributes<HTMLImageElement> & {
  size?: number | string;
};

export function GitHubIcon({ size, height, width, ...props }: BrandIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height={height ?? size}
      viewBox="0 0 24 24"
      width={width ?? size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.96c-2.95.64-3.57-1.25-3.57-1.25-.48-1.22-1.18-1.55-1.18-1.55-.96-.66.07-.65.07-.65 1.07.08 1.63 1.1 1.63 1.1.94 1.62 2.48 1.15 3.09.88.1-.69.37-1.15.67-1.41-2.35-.27-4.82-1.18-4.82-5.26 0-1.16.42-2.1 1.1-2.84-.11-.27-.48-1.37.1-2.86 0 0 .9-.29 2.96 1.09a10.26 10.26 0 0 1 5.39 0c2.06-1.38 2.96-1.1 2.96-1.1.58 1.5.22 2.6.1 2.87.69.74 1.1 1.68 1.1 2.84 0 4.1-2.47 4.98-4.83 5.24.38.33.72.97.72 1.95v2.89c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  );
}

export function LinkedInIcon({ size, style, ...props }: BrandImageProps) {
  const dimension = size ?? 24;
  const imageStyle: CSSProperties = {
    display: 'inline-block',
    height: dimension,
    width: dimension,
    ...style,
  };

  return <img alt="" aria-hidden="true" src="/brand/linkedin-inbug-black.png" style={imageStyle} {...props} />;
}
