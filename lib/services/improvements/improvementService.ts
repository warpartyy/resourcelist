import { getSupabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";

export type ImprovementPriority = "high" | "medium" | "low";

export type ImprovementTask = {
	id: string;
	resourceId: string;
	organization: string;
	type:
		| "phone"
		| "website"
		| "services"
		| "description"
		| "eligibility"
		| "counties"
		| "email"
		| "application_link"
		| "tags"
		| "subcategories"
		| "last_verified";
	priority: ImprovementPriority;
	title: string;
	description: string;
};

type ResourceRow = Tables<"resources">;

type Rule = {
	type: ImprovementTask["type"];
	priority: ImprovementPriority;
	title: string;
	description: string;
	isMissing: (resource: ResourceRow) => boolean;
};

const RULES: Rule[] = [
	{
		type: "phone",
		priority: "high",
		title: "Add Phone",
		description: "This resource does not currently list a phone number.",
		isMissing: (resource) => !resource.phone || resource.phone.trim().length === 0,
	},
	{
		type: "website",
		priority: "high",
		title: "Add Website",
		description: "This resource does not currently list a website.",
		isMissing: (resource) => !resource.website || resource.website.trim().length === 0,
	},
	{
		type: "services",
		priority: "high",
		title: "Add Services",
		description: "This resource does not currently list any services.",
		isMissing: (resource) => !resource.services || resource.services.length === 0,
	},
	{
		type: "description",
		priority: "high",
		title: "Add Description",
		description: "This resource does not currently include a description.",
		isMissing: (resource) => !resource.description || resource.description.trim().length === 0,
	},
	{
		type: "eligibility",
		priority: "medium",
		title: "Add Eligibility",
		description: "This resource does not currently include eligibility details.",
		isMissing: (resource) => !resource.eligibility || resource.eligibility.trim().length === 0,
	},
	{
		type: "counties",
		priority: "medium",
		title: "Add Counties Served",
		description: "This resource does not currently list counties served.",
		isMissing: (resource) => !resource.counties_served || resource.counties_served.length === 0,
	},
	{
		type: "email",
		priority: "medium",
		title: "Add Email",
		description: "This resource does not currently list an email address.",
		isMissing: (resource) => !resource.email || resource.email.trim().length === 0,
	},
	{
		type: "application_link",
		priority: "medium",
		title: "Add Application Link",
		description: "This resource does not currently include an application link.",
		isMissing: (resource) => !resource.application_link || resource.application_link.trim().length === 0,
	},
	{
		type: "tags",
		priority: "low",
		title: "Add Tags",
		description: "This resource does not currently have any tags.",
		isMissing: (resource) => !resource.tags || resource.tags.length === 0,
	},
	{
		type: "subcategories",
		priority: "low",
		title: "Add Subcategories",
		description: "This resource does not currently have subcategories assigned.",
		isMissing: (resource) => !resource.subcategories || resource.subcategories.length === 0,
	},
	{
		type: "last_verified",
		priority: "low",
		title: "Add Verification Date",
		description: "This resource has not been verified yet.",
		isMissing: (resource) => !resource.last_verified || resource.last_verified.trim().length === 0,
	},
];

const PRIORITY_ORDER: Record<ImprovementPriority, number> = {
	high: 0,
	medium: 1,
	low: 2,
};

function buildTask(resource: ResourceRow, rule: Rule): ImprovementTask {
	return {
		id: `${resource.id}-${rule.type}`,
		resourceId: resource.id,
		organization: resource.organization || "Unknown Organization",
		type: rule.type,
		priority: rule.priority,
		title: rule.title,
		description: rule.description,
	};
}

export async function getSuggestedImprovementTasks(): Promise<ImprovementTask[]> {
	const supabase = getSupabase();

	const { data, error } = await supabase
		.from("resources")
		.select(
			"id, organization, status, phone, website, services, description, eligibility, counties_served, email, application_link, tags, subcategories, last_verified"
		)
		.in("status", ["approved", "rejected"])
		.order("organization", { ascending: true });

	if (error) {
		throw error;
	}

	const resources = (data || []) as ResourceRow[];
	const tasks: ImprovementTask[] = [];

	for (const resource of resources) {
		for (const rule of RULES) {
			if (rule.isMissing(resource)) {
				tasks.push(buildTask(resource, rule));
			}
		}
	}

	return tasks.sort((a, b) => {
		const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
		if (priorityDiff !== 0) return priorityDiff;
		return a.organization.localeCompare(b.organization);
	});
}

