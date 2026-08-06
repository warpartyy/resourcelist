export type SituationDefinition = {
  id: string;
  label: string;
  phrases: string[];
  derivedNeeds: string[];
};

export const SITUATION_DEFINITIONS: SituationDefinition[] = [
  {
    id: "unsheltered_homelessness",
    label: "Unsheltered Homelessness",
    phrases: [
      "sleeping in my car",
      "living in my car",
      "homeless",
      "nowhere to stay",
      "no place to stay",
      "on the street",
    ],
    derivedNeeds: [
      "Emergency Shelter",
      "Housing Assistance",
      "Food Assistance",
      "Financial Assistance",
      "Employment",
    ],
  },
  {
    id: "housing_instability",
    label: "Housing Instability",
    phrases: [
      "couch surfing",
      "eviction notice",
      "being evicted",
      "kicked out",
      "motel",
      "hotel voucher",
      "behind on rent",
      "about to lose housing",
    ],
    derivedNeeds: [
      "Housing Assistance",
      "Rental Assistance",
      "Legal Services",
      "Financial Assistance",
    ],
  },
  {
    id: "recent_job_loss",
    label: "Recent Job Loss",
    phrases: ["lost my job", "laid off", "fired", "unemployed", "out of work"],
    derivedNeeds: ["Employment", "Financial Assistance", "Food Assistance"],
  },
  {
    id: "utility_shutoff_risk",
    label: "Utility Shutoff Risk",
    phrases: [
      "electricity shut off",
      "electricity is getting shut off",
      "power shut off",
      "water shut off",
      "gas shut off",
      "disconnected",
      "disconnect notice",
      "utilities shut off",
    ],
    derivedNeeds: ["Utility Assistance", "Financial Assistance"],
  },
  {
    id: "food_insecurity",
    label: "Food Insecurity",
    phrases: [
      "no food",
      "haven't eaten",
      "havent eaten",
      "hungry",
      "food for my kids",
      "need groceries",
    ],
    derivedNeeds: ["Food Assistance", "Benefits", "Financial Assistance"],
  },
  {
    id: "transportation_barrier",
    label: "Transportation Barrier",
    phrases: ["no car", "need a ride", "transportation", "can't get there", "cant get there"],
    derivedNeeds: ["Transportation"],
  },
  {
    id: "behavioral_health_need",
    label: "Behavioral Health Need",
    phrases: [
      "depressed",
      "depression",
      "anxiety",
      "addiction",
      "recovery",
      "mental health",
      "therapy",
      "counseling",
    ],
    derivedNeeds: ["Counseling", "Behavioral Health", "Substance Use Treatment"],
  },
  {
    id: "domestic_violence",
    label: "Domestic Violence",
    phrases: [
      "abusive relationship",
      "domestic violence",
      "unsafe at home",
      "leaving an abusive relationship",
      "partner hit me",
    ],
    derivedNeeds: ["Emergency Shelter", "Legal Services", "Counseling"],
  },
  {
    id: "returning_citizen",
    label: "Returning Citizen",
    phrases: ["got out of prison", "released from jail", "parole", "probation"],
    derivedNeeds: ["Reentry Support", "Employment", "Housing Assistance", "Legal Services"],
  },
  {
    id: "veteran",
    label: "Veteran",
    phrases: ["veteran", "served", "military", "va benefits"],
    derivedNeeds: ["Veteran Services", "Benefits", "Healthcare", "Housing Assistance"],
  },
  {
    id: "pregnancy",
    label: "Pregnancy",
    phrases: ["pregnant", "expecting", "prenatal"],
    derivedNeeds: ["Healthcare", "Food Assistance", "Family Support"],
  },
];
