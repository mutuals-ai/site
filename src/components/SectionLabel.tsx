import type { ReactNode } from "react";

/**
 * Mono section label, e.g. "§ 01 — You talk". On ≥1440px it sits absolutely in
 * the left margin (right-aligned, ~140px wide, to the left of the paper-2 rule).
 * Below that it renders inline, above the section content. The parent section
 * must be `position: relative` for the absolute placement to anchor correctly.
 */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="label mb-6 min-[1440px]:absolute min-[1440px]:-left-[176px] min-[1440px]:top-[3px] min-[1440px]:mb-0 min-[1440px]:w-[140px] min-[1440px]:text-right">
      {children}
    </div>
  );
}
