import React, { useState } from "react";

/**
 * BrandLogo - Clean transparent custom logo image component
 * References /assets/new.jpg with graceful fallback (hides on error to prevent broken image icon)
 */
export function BrandLogo({
  src = "/assets/new.jpg",
  alt = "S Wallet Logo",
  height = 36,
  className = "",
  style = {},
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  const computedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`s-wallet-custom-logo ${className}`}
      style={{
        height: computedHeight,
        width: computedHeight,
        aspectRatio: "1 / 1",
        objectFit: "cover",
        borderRadius: "50%",
        display: "inline-block",
        background: "transparent",
        backgroundColor: "transparent",
        border: "none",
        flexShrink: 0,
        verticalAlign: "middle",
        ...style,
      }}
    />
  );
}

/**
 * SLogoMark - Alias to BrandLogo with transparent styling
 */
export function SLogoMark({ size = 32, className = "", style = {} }) {
  return <BrandLogo height={size} className={className} style={style} />;
}

/**
 * SWalletBrand - Paired custom logo image and "S Wallet" brand text
 * Logo size: Sidebar (~44px), Navbar (~30px), Mobile (~28px)
 */
export function SWalletBrand({ size = "md", light = false, className = "" }) {
  const logoHeight = size === "lg" ? 52 : size === "sm" ? 38 : 48;

  return (
    <div className={`s-wallet-brand-lockup ${className} brand-${size}`}>
      <BrandLogo height={logoHeight} alt="S Wallet Logo" />
      <span className="s-wallet-brand-text">
        <span className="s-brand-accent">S</span>
        <span className={`s-brand-rest ${light ? "text-cream" : "text-forest"}`}> Wallet</span>
      </span>
    </div>
  );
}

/**
 * PetalIcon - 8-petal asterisk starburst icon mark
 */
export function PetalIcon({ size = 20, color = "currentColor", className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`petal-icon ${className}`}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <path
        d="M12 2C12.8 6.5 15.5 8.8 20 9.5C15.5 10.2 12.8 12.5 12 17C11.2 12.5 8.5 10.2 4 9.5C8.5 8.8 11.2 6.5 12 2Z"
        fill={color}
      />
      <path
        d="M17.65 4.35C16.85 8.35 18.15 11.15 21.65 13.85C17.65 13.05 14.85 14.35 12.15 17.85C12.95 13.85 11.65 11.05 8.15 8.35C12.15 9.15 14.95 7.85 17.65 4.35Z"
        fill={color}
        opacity="0.85"
        transform="rotate(45 12 12)"
      />
      <circle cx="12" cy="12" r="2.2" fill={color} />
    </svg>
  );
}

/**
 * SunburstShape - Intricate decorative sunburst for background watermarks
 */
export function SunburstShape({ size = 180, color = "#143A28", opacity = 0.05, className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sunburst-shape ${className}`}
      style={{ opacity, pointerEvents: "none", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <g transform="translate(100, 100)">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="0"
            rx="12"
            ry="85"
            transform={`rotate(${deg})`}
            fill={color}
          />
        ))}
        <circle cx="0" cy="0" r="32" fill={color} />
        <circle cx="0" cy="0" r="16" fill="#F8F8F5" />
        <circle cx="0" cy="0" r="8" fill={color} />
      </g>
    </svg>
  );
}

/**
 * DecorativePetalBg - Subtle floating corner watermarks across pages
 */
export function DecorativePetalBg() {
  return (
    <div className="decorative-bg-container" aria-hidden="true">
      <div className="decorative-bg-top-right">
        <SunburstShape size={340} color="#143A28" opacity={0.035} />
      </div>
      <div className="decorative-bg-bottom-left">
        <SunburstShape size={280} color="#C8D6B4" opacity={0.08} />
      </div>
    </div>
  );
}
