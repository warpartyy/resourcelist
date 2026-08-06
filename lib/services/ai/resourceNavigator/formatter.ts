import type { NavigatorResource } from "./types";

export function formatResourceLines(resources: NavigatorResource[]) {
  return resources.map((resource) => `- ${resource.name}`).join("\n");
}
