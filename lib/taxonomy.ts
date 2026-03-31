export const PARENT_CATEGORIES = [
  {
    label: "Health & Wellness",
    value: "health-wellness",
    description:
      "Services that support mental, physical, and emotional wellbeing across the lifespan.",
  },
  {
    label: "Essential Support",
    value: "essential-support",
    description:
      "Foundational services that help individuals and families maintain stability and meet essential daily needs.",
  },
  {
    label: "Work, Money & Legal",
    value: "work-money-legal",
    description:
      "Employment, financial, and legal resources that promote economic stability and opportunity.",
  },
  {
    label: "Safety & Crisis",
    value: "safety-crisis",
    description:
      "Immediate and protective services for individuals experiencing crisis or unsafe situations.",
  },
  {
    label: "Family & Community Support",
    value: "family-community-support",
    description:
      "Programs that strengthen families, build connection, and support community wellbeing.",
  },
];


export const SUBCATEGORIES = [
  {
    label: "Mental Health Services",
    value: "mental-health-services",
    description:
      "Counseling, therapy, psychiatric care, and other services that support emotional and mental wellbeing.",
  },
  {
    label: "Substance Use & Recovery",
    value: "substance-use-recovery",
    description:
      "Detox, treatment programs, medication-assisted treatment, and recovery support services.",
  },
  {
    label: "General Healthcare Services",
    value: "general-healthcare-services",
    description:
      "Primary care, medical clinics, preventive services, and overall health support.",
  },
  {
    label: "Support Groups",
    value: "support-groups",
    description:
      "Peer-led or professionally facilitated groups offering shared support and connection.",
  },
  {
    label: "Housing Support",
    value: "housing-support",
    description:
      "Emergency shelter, transitional housing, rental assistance, and long-term housing stability services.",
  },
  {
    label: "Food Assistance",
    value: "food-assistance",
    description:
      "Food pantries, meal programs, nutrition support, and community-based food resources.",
  },
  {
    label: "Transportation Services",
    value: "transportation-services",
    description:
      "Transportation assistance for medical care, employment, education, and essential appointments.",
  },
  {
    label: "Utility & Rental Assistance",
    value: "utility-rental-assistance",
    description:
      "Support with utility bills, rent payments, and other housing-related financial needs.",
  },
  {
    label: "Employment & Job Support",
    value: "employment-job-support",
    description:
      "Job training, resume support, workforce programs, and employment placement services.",
  },
  {
    label: "Financial & Benefits Assistance",
    value: "financial-benefits-assistance",
    description:
      "Help accessing public benefits, financial assistance programs, and income support resources.",
  },
  {
    label: "Legal Assistance",
    value: "legal-assistance",
    description:
      "Legal aid, advocacy, and support navigating civil, family, housing, or benefit-related matters.",
  },
  {
    label: "Domestic Violence & Safety",
    value: "domestic-violence-safety",
    description:
      "Safety planning, advocacy, shelter, and support for individuals experiencing domestic violence.",
  },
  {
    label: "Crisis Services",
    value: "crisis-services",
    description:
      "Immediate support during mental health, emotional, or safety crises, including hotlines and rapid response services.",
  },
  {
    label: "Emergency Shelter",
    value: "emergency-shelter",
    description:
      "Short-term shelter and safe housing options during urgent or unstable situations.",
  },
  {
    label: "Youth Programs",
    value: "youth-programs",
    description:
      "Programs and services designed to support children and young people in education, health, and community engagement.",
  },
  {
    label: "Parenting & Family Support",
    value: "parenting-family-support",
    description:
      "Parent education, family counseling, and programs that strengthen family wellbeing.",
  },
  {
    label: "Peer Support Services",
    value: "peer-support-services",
    description:
      "Support provided by individuals with lived experience offering guidance, mentorship, and connection.",
  },
  {
    label: "Community & Cultural Programs",
    value: "community-cultural-programs",
    description:
      "Cultural events, community gatherings, and programs that strengthen identity, belonging, and connection.",
  },
];


export const SUBCATEGORY_PARENT_MAP: Record<string, string> = {
  "mental-health-services": "health-wellness",
  "substance-use-recovery": "health-wellness",
  "general-healthcare-services": "health-wellness",
  "support-groups": "health-wellness",

  "housing-support": "essential-support",
  "food-assistance": "essential-support",
  "transportation-services": "essential-support",
  "utility-rental-assistance": "essential-support",

  "employment-job-support": "work-money-legal",
  "financial-benefits-assistance": "work-money-legal",
  "legal-assistance": "work-money-legal",

  "domestic-violence-safety": "safety-crisis",
  "crisis-services": "safety-crisis",
  "emergency-shelter": "safety-crisis",

  "youth-programs": "family-community-support",
  "parenting-family-support": "family-community-support",
  "community-cultural-programs": "family-community-support",
};

export const TAG_GROUPS = {
  population: [
    "youth",
    "adults",
    "seniors",
    "veterans",
    "tribal-members",
    "lgbtq-plus",
    "pregnant-postpartum",
    "justice-involved",
    "families",
  ],

  delivery: [
    "in-person",
    "telehealth",
    "mobile-services",
    "home-based",
    "school-based",
  ],

  payment: [
    "medicaid",
    "medicare",
    "private-insurance",
    "sliding-scale",
    "free",
  ],

  eligibility: [
    "Member of federally recognized tribe",
    "18+",
    "Women only",
    "Men Only",
    "referral-required",
    "appointment-required",
    "income-based",
  ],

    programlength: [
    "30 days",
    "45 days",
    "60 days",
    "90 days",
    "120 days",    
    "6 months",
    "12 months",
  ],
};