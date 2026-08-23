import React from "react";

/**
 * StyledButton - Clean, themed button using standardized Roboto font and 3-color system
 * Base: White / Off-white (#FFFFFF / #F8F8F5) with subtle shadow
 * Hover: Smooth sliding fill using Light Green (#C8D6B4)
 */
export default function StyledButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  style = {},
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`styled-button ${className} ${disabled ? "disabled" : ""}`}
      style={style}
      {...rest}
    >
      <span className="styled-button-content">{children}</span>
    </button>
  );
}

export { StyledButton };
