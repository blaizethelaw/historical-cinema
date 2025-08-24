import * as React from "react";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 border border-white/10 bg-white/10 hover:bg-white/20 text-white ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
export default Button;
