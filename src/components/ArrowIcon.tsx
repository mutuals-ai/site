export function ArrowIcon({
  direction = "right",
}: {
  direction?: "right" | "down" | "diagonal";
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{
        transform:
          direction === "down"
            ? "rotate(90deg)"
            : direction === "diagonal"
              ? "rotate(-45deg)"
              : undefined,
      }}
    >
      <path
        d="M3 8h9m-4-4 4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
