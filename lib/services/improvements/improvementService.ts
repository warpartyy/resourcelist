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
		| "address"
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

export type ImprovementOverrideStatus = "not_applicable";

export type NotApplicableImprovementTask = ImprovementTask & {
	overrideId: string;
	status: ImprovementOverrideStatus;
	createdBy: string;
	createdByName: string;
	markedAt: string;
	updatedAt: string;
};

type ResourceRow = Tables<"resources">;

type Rule = {
	type: ImprovementTask["type"];
	priority: ImprovementPriority;
	title: string;
	description: string;
	isMissing: (resource: ResourceRow) => boolean;
};

type OverrideRow = {
	id: string;
	resource_id: string;
	improvement_key: string;
	status: string;
	created_by: string;
	created_at: string;
	updated_at: string;
};

type ProfileRow = {
	id: string;
	display_name: string | null;
	email: string | null;
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
		type: "address",
		priority: "high",
		title: "Add Address",
		description: "This resource does not currently include a street address.",
		isMissing: (resource) => !resource.address || resource.address.trim().length === 0,
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
		priority: "medium",
		title: "Add Description",
		description: "This resource does not currently include a description.",
		isMissing: (resource) => !resource.description || resource.description.trim().length === 0,
	},
	{
		type: "eligibility",
		priority: "high",
		title: "Add Eligibility",
		description: "This resource does not currently include eligibility details.",
		isMissing: (resource) => !resource.eligibility || resource.eligibility.trim().length === 0,
	},
	{
		type: "counties",
		priority: "low",
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
		priority: "high",
		title: "Add Application Link",
		description: "This resource does not currently include an application link.",
		isMissing: (resource) => !resource.application_link || resource.application_link.trim().length === 0,
	},
	{
		type: "tags",
		priority: "medium",
		title: "Add Tags",
		description: "This resource does not currently have any tags.",
		isMissing: (resource) => !resource.tags || resource.tags.length === 0,
	},
	{
		type: "subcategories",
		priority: "medium",
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

const NOT_APPLICABLE_STATUS: ImprovementOverrideStatus = "not_applicable";

const IMPROVEMENT_TYPES: ImprovementTask["type"][] = RULES.map((rule) => rule.type);

const RULES_BY_TYPE = RULES.reduce<Record<ImprovementTask["type"], Rule>>((acc, rule) => {
	acc[rule.type] = rule;
	return acc;
}, {} as Record<ImprovementTask["type"], Rule>);

function isImprovementType(value: string): value is ImprovementTask["type"] {
	return IMPROVEMENT_TYPES.includes(value as ImprovementTask["type"]);
}

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

function sortTasks(tasks: ImprovementTask[]) {
	return tasks.sort((a, b) => {
		const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
		if (priorityDiff !== 0) return priorityDiff;
		return a.organization.localeCompare(b.organization);
	});
}

async function fetchImprovementResources() {
	const supabase = getSupabase();

	const { data, error } = await supabase
		.from("resources")
		.select(
			"id, organization, status, phone, website, address, services, description, eligibility, counties_served, email, application_link, tags, subcategories, last_verified"
		)
		.in("status", ["approved", "rejected"])
		.order("organization", { ascending: true });

	if (error) {
		console.error("Supabase error", {
			message: error.message,
			details: error.details,
			hint: error.hint,
			code: error.code,
			error,
		});
		throw error;
	}

	return (data || []) as ResourceRow[];
}

async function fetchOverrides(resourceIds: string[]) {
	if (resourceIds.length === 0) {
		return [] as OverrideRow[];
	}

	const supabase = getSupabase();

	const { data, error } = await supabase
		.from("resource_improvement_overrides")
		.select("id, resource_id, improvement_key, status, created_by, created_at, updated_at")
		.in("resource_id", resourceIds)
		.eq("status", NOT_APPLICABLE_STATUS);

	if (error) {
		console.error("Supabase error", {
			message: error.message,
			details: error.details,
			hint: error.hint,
			code: error.code,
			error,
		});
		throw error;
	}

	return (data || []) as OverrideRow[];
}

async function fetchProfilesByIds(userIds: string[]) {
	if (userIds.length === 0) {
		return [] as ProfileRow[];
	}

	const supabase = getSupabase();

	const { data, error } = await supabase
		.from("profiles")
		.select("id, display_name, email")
		.in("id", userIds);

	if (error) {
		console.error("Supabase error", {
			message: error.message,
			details: error.details,
			hint: error.hint,
			code: error.code,
			error,
		});
		throw error;
	}

	return (data || []) as ProfileRow[];
}

function buildCandidateTasks(resources: ResourceRow[]) {
	const tasks: ImprovementTask[] = [];

	for (const resource of resources) {
		for (const rule of RULES) {
			if (rule.isMissing(resource)) {
				tasks.push(buildTask(resource, rule));
			}
		}
	}

	return sortTasks(tasks);
}

export async function getSuggestedImprovementTasks(): Promise<ImprovementTask[]> {
	const resources = await fetchImprovementResources();
	const tasks = buildCandidateTasks(resources);
	const overrides = await fetchOverrides(resources.map((resource) => resource.id));

	const overridden = new Set(
		overrides.map((override) => `${override.resource_id}-${override.improvement_key}`)
	);

	return tasks.filter((task) => !overridden.has(`${task.resourceId}-${task.type}`));
}

export async function getNotApplicableImprovementTasks(): Promise<NotApplicableImprovementTask[]> {
	const resources = await fetchImprovementResources();
	const resourceMap = new Map(resources.map((resource) => [resource.id, resource]));
	const overrides = await fetchOverrides(resources.map((resource) => resource.id));
	const profiles = await fetchProfilesByIds(
		Array.from(new Set(overrides.map((override) => override.created_by)))
	);
	const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

	const tasks = overrides
		.filter((override) => isImprovementType(override.improvement_key))
		.map((override) => {
			const type = override.improvement_key as ImprovementTask["type"];
			const rule = RULES_BY_TYPE[type];
			const resource = resourceMap.get(override.resource_id);
			const profile = profileMap.get(override.created_by);

			return {
				overrideId: override.id,
				id: `${override.resource_id}-${type}`,
				resourceId: override.resource_id,
				organization: resource?.organization || "Unknown Organization",
				type,
				priority: rule.priority,
				title: rule.title,
				description: rule.description,
				status: NOT_APPLICABLE_STATUS,
				createdBy: override.created_by,
				createdByName:
					profile?.display_name ||
					profile?.email ||
					override.created_by,
				markedAt: override.created_at,
				updatedAt: override.updated_at,
			} satisfies NotApplicableImprovementTask;
		});

	return tasks.sort((a, b) => {
		const dateA = new Date(a.markedAt).getTime();
		const dateB = new Date(b.markedAt).getTime();
		if (dateA !== dateB) return dateA - dateB;
		return a.organization.localeCompare(b.organization);
	});
}

export async function markImprovementNotApplicable(args: {
	resourceId: string;
	improvementKey: ImprovementTask["type"];
	createdBy: string;
}) {
	const { resourceId, improvementKey, createdBy } = args;

	const supabase = getSupabase();

	const { data, error } = await supabase
		.from("resource_improvement_overrides")
		.upsert(
			{
				resource_id: resourceId,
				improvement_key: improvementKey,
				status: NOT_APPLICABLE_STATUS,
				created_by: createdBy,
			},
			{ onConflict: "resource_id,improvement_key" }
		)
		.select("id")
		.single();

	if (error) {
		console.error("Supabase error", {
			message: error.message,
			details: error.details,
			hint: error.hint,
			code: error.code,
			error,
		});
		throw error;
	}

	return data;
}

