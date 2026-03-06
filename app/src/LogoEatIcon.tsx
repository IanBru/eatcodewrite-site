/** Inline fork SVG so it can be colored with CSS (currentColor). */
export default function LogoEatIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden
    >
      <path d="M6 0v6M10 0v6M14 0v6M18 0v6M6 6h12M12 6v28M11.2 34q.8 2 1.6 0" />
    </svg>
  );
}
