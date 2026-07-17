"use client";

import { useSearchParams } from "next/navigation";

type ForcedParams = {
  parent?: string;
  sub?: string;
};

type Props = {
  forcedParams?: ForcedParams;
  className?: string;
  label?: string;
};

export default function GenerateResourceGuideButton({
  forcedParams,
  className = "button button-secondary",
  label = "Generate Resource Guide",
}: Props) {
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams.toString());

  if (forcedParams?.parent) {
    params.set("parent", forcedParams.parent);
  }

  if (forcedParams?.sub) {
    params.set("sub", forcedParams.sub);
  }

  const queryString = params.toString();
  const href = `/api/resource-guide${queryString ? `?${queryString}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}
