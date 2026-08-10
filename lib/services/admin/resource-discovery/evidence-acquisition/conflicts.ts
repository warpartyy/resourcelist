export type EvidenceConflictType =
  | "phone"
  | "address"
  | "service_area"
  | "eligibility"
  | "services"
  | "other";

export type EvidenceConflict = {
  conflictType: EvidenceConflictType;
  field: string;
  values: string[];
  sourceUrls: string[];
  severity: "low" | "medium" | "high";
};

export type ConflictDetectionResult = {
  hasConflicts: boolean;
  conflicts: EvidenceConflict[];
};

export function detectEvidenceConflicts(): ConflictDetectionResult {
  return {
    hasConflicts: false,
    conflicts: [],
  };
}
