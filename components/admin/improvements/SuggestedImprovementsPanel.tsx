"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
	getSuggestedImprovementTasks,
	getNotApplicableImprovementTasks,
	ImprovementTask,
	markImprovementNotApplicable,
	type NotApplicableImprovementTask,
} from "@/lib/services/improvements/improvementService";
import { navigateToAdminResource } from "../../../lib/services/admin/resourceNavigationService";
import type { User } from "@supabase/supabase-js";

function priorityStyles(priority: ImprovementTask["priority"]) {
	if (priority === "high") {
		return "bg-red-100 text-red-700 border-red-200";
	}
	if (priority === "medium") {
		return "bg-amber-100 text-amber-700 border-amber-200";
	}
	return "bg-slate-100 text-slate-700 border-slate-200";
}

type FilterKey = "all" | ImprovementTask["priority"] | "not_applicable";
type MissingFieldFilterKey = "all" | ImprovementTask["type"];

type Props = {
	user: User | null;
	onDataChanged?: () => void;
};

export default function SuggestedImprovementsPanel({ user, onDataChanged }: Props) {
	const [tasks, setTasks] = useState<ImprovementTask[]>([]);
	const [notApplicableTasks, setNotApplicableTasks] = useState<NotApplicableImprovementTask[]>([]);
	const [loading, setLoading] = useState(true);
	const [navigatingTaskId, setNavigatingTaskId] = useState<string | null>(null);
	const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
	const [activeMissingFieldFilter, setActiveMissingFieldFilter] = useState<MissingFieldFilterKey>("all");
	const [markingTaskId, setMarkingTaskId] = useState<string | null>(null);

	const router = useRouter();

	const loadTasks = async () => {
		setLoading(true);
		try {
			const [next, notApplicable] = await Promise.all([
				getSuggestedImprovementTasks(),
				getNotApplicableImprovementTasks(),
			]);
			setTasks(next);
			setNotApplicableTasks(notApplicable);
		} catch (error) {
			console.error("Failed to load suggested improvements:", error);
			toast.error("Unable to load suggested improvements");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTasks();
	}, []);

	const summary = useMemo(() => {
		const high = tasks.filter((task) => task.priority === "high").length;
		const medium = tasks.filter((task) => task.priority === "medium").length;
		const low = tasks.filter((task) => task.priority === "low").length;

		return {
			total: tasks.length,
			high,
			medium,
			low,
			notApplicable: notApplicableTasks.length,
		};
	}, [tasks, notApplicableTasks]);

	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			const matchesPriority =
				activeFilter === "all" ||
				activeFilter === "not_applicable" ||
				task.priority === activeFilter;
			const matchesMissingField =
				activeMissingFieldFilter === "all" || task.type === activeMissingFieldFilter;

			return matchesPriority && matchesMissingField;
		});
	}, [tasks, activeFilter, activeMissingFieldFilter]);

	const priorityScopedTasks = useMemo(() => {
		return tasks.filter((task) => {
			if (activeFilter === "all" || activeFilter === "not_applicable") {
				return true;
			}

			return task.priority === activeFilter;
		});
	}, [tasks, activeFilter]);

	const filteredNotApplicableTasks = useMemo(() => {
		if (activeFilter !== "not_applicable") {
			return [] as NotApplicableImprovementTask[];
		}

		return notApplicableTasks;
	}, [activeFilter, notApplicableTasks]);

	const filters = useMemo(
		() => [
			{ key: "all" as const, label: "All", count: summary.total },
			{ key: "high" as const, label: "High", count: summary.high },
			{ key: "medium" as const, label: "Medium", count: summary.medium },
			{ key: "low" as const, label: "Low", count: summary.low },
			{ key: "not_applicable" as const, label: "Not Applicable", count: summary.notApplicable },
		],
		[summary]
	);

	const summaryCards = useMemo(
		() => [
			{ label: "High", count: summary.high, className: "border-red-200 bg-red-50 text-red-700" },
			{ label: "Medium", count: summary.medium, className: "border-amber-200 bg-amber-50 text-amber-700" },
			{ label: "Low", count: summary.low, className: "border-slate-200 bg-slate-50 text-slate-700" },
			{
				label: "Not Applicable",
				count: summary.notApplicable,
				className: "border-slate-200 bg-surface text-text-muted",
			},
		],
		[summary]
	);

	const formatMissingFieldLabel = (type: ImprovementTask["type"]) => {
		if (type === "application_link") return "Application Link";
		if (type === "last_verified") return "Last Verified";
		if (type === "counties") return "Counties Served";
		if (type === "subcategories") return "Categories / Subcategories";

		return type
			.split("_")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ");
	};

	const missingFieldFilters = useMemo(() => {
		const fieldTypes = Array.from(new Set(tasks.map((task) => task.type))).sort((a, b) =>
			formatMissingFieldLabel(a).localeCompare(formatMissingFieldLabel(b))
		);

		const dynamicFilters = fieldTypes.map((type) => ({
			key: type as MissingFieldFilterKey,
			label: formatMissingFieldLabel(type),
			count: priorityScopedTasks.filter((task) => task.type === type).length,
		}));

		return [
			{ key: "all" as MissingFieldFilterKey, label: "All", count: priorityScopedTasks.length },
			...dynamicFilters,
		];
	}, [tasks, priorityScopedTasks]);

	const priorityLabel = (priority: ImprovementTask["priority"]) => {
		if (priority === "high") return "🔴 High";
		if (priority === "medium") return "🟡 Medium";
		return "🟢 Low";
	};

	const handleImprove = async (task: ImprovementTask) => {
		if (navigatingTaskId) return;

		setNavigatingTaskId(task.id);

		try {
			const navigation = await navigateToAdminResource({
				router,
				resourceId: task.resourceId,
			});

			if (!navigation.ok) {
				toast.error("Unable to open resource");
			}
		} finally {
			setNavigatingTaskId(null);
		}
	};

	const handleMarkNotApplicable = async (task: ImprovementTask) => {
		if (!user?.id || markingTaskId) return;

		setMarkingTaskId(task.id);
		try {
			await markImprovementNotApplicable({
				resourceId: task.resourceId,
				improvementKey: task.type,
				createdBy: user.id,
			});

			toast.success("✓ Suggestion marked as Not Applicable.");
			await loadTasks();
			await onDataChanged?.();
		} catch (error) {
			console.error("Failed to mark suggestion as not applicable:", error);
			toast.error("Unable to save override");
		} finally {
			setMarkingTaskId(null);
		}
	};

	const formatDate = (value: string) => {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleDateString();
	};

	if (loading) {
		return <div className="text-sm text-text-muted">Loading suggested improvements...</div>;
	}

	return (
		<div className="space-y-4">
			<div className="bg-surface border border-border rounded-xl p-4 space-y-5">
				<section>
					<div className="flex flex-wrap items-end justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-text-primary">Suggested Improvements</h2>
							<p className="mt-1 text-sm text-text-muted">Total remaining improvements</p>
						</div>
						<div className="text-3xl font-semibold leading-none text-text-primary">{summary.total}</div>
					</div>

					<div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
						{summaryCards.map((card) => (
							<div
								key={card.label}
								className={`rounded-lg border px-3 py-2.5 ${card.className}`}
							>
								<p className="text-xs font-medium">{card.label}</p>
								<p className="mt-1 text-2xl font-semibold leading-none">{card.count}</p>
							</div>
						))}
					</div>
				</section>

				<section>
					<p className="mb-2 text-xs font-medium text-text-muted">Priority Filter</p>
					<div className="inline-flex max-w-full flex-wrap overflow-hidden rounded-lg border border-border bg-bg p-1">
						{filters.map((filter) => {
							const isActive = activeFilter === filter.key;

							return (
								<button
									key={filter.key}
									type="button"
									onClick={() => setActiveFilter(filter.key)}
									className={`rounded-md px-3 py-1.5 text-sm transition ${
										isActive
											? "bg-surface text-text-primary shadow-sm"
											: "text-text-muted hover:text-text-primary"
									}`}
								>
									{filter.label}
								</button>
							);
						})}
					</div>
				</section>

				{activeFilter !== "not_applicable" && (
					<section>
						<p className="mb-2 text-xs font-medium text-text-muted">Improvement Types</p>
						<div className="flex flex-wrap items-center gap-2">
							{missingFieldFilters.map((filter) => {
								const isActive = activeMissingFieldFilter === filter.key;

								return (
									<button
										key={filter.key}
										type="button"
										onClick={() => setActiveMissingFieldFilter(filter.key)}
										className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
											isActive
												? "bg-bg border-accent text-text-primary"
												: "bg-surface border-border text-text-muted hover:text-text-primary"
										}`}
									>
										<span>{filter.label}</span>
										{filter.key !== "all" && (
											<span className="rounded-full border border-border bg-bg px-1.5 py-0.5 text-[11px] leading-3 text-text-muted">
												{filter.count}
											</span>
										)}
									</button>
								);
							})}
						</div>
					</section>
				)}
			</div>

			{tasks.length === 0 && notApplicableTasks.length === 0 ? (
				<div className="bg-surface border border-border rounded-xl p-5 text-sm text-text-muted">
					<div className="text-2xl leading-none">🎉</div>
					<p className="mt-2">
						Every approved and rejected resource currently has the recommended information completed.
					</p>
					<p className="mt-1">Nice work!</p>
				</div>
			) : activeFilter === "not_applicable" ? (
				filteredNotApplicableTasks.length === 0 ? (
					<div className="bg-surface border border-border rounded-xl p-5 text-sm text-text-muted">
						No suggestions are currently marked as Not Applicable.
					</div>
				) : (
					<div className="space-y-3">
						{filteredNotApplicableTasks.map((task) => (
							<div key={task.overrideId} className="bg-surface border border-border rounded-xl p-4">
								<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
									<span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase bg-slate-100 text-slate-700 border-slate-200">
										Not Applicable
									</span>
								</div>

								<div className="text-sm font-semibold text-text-primary">{task.organization}</div>
								<div className="text-sm text-text-primary mt-1">{task.title}</div>
								<div className="text-sm text-text-muted mt-1">{task.description}</div>

								<div className="mt-3 text-sm text-text-muted space-y-1">
									<p><span className="font-medium text-text-primary">Administrator:</span> {task.createdByName}</p>
									<p><span className="font-medium text-text-primary">Date Marked:</span> {formatDate(task.markedAt)}</p>
								</div>
							</div>
						))}
					</div>
				)
			) : filteredTasks.length === 0 ? (
				<div className="bg-surface border border-border rounded-xl p-5 text-sm text-text-muted">
					No improvements match the selected filters.
				</div>
			) : (
				<div className="space-y-3">
					{filteredTasks.map((task) => (
						<div key={task.id} className="bg-surface border border-border rounded-xl p-4">
							<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
								<span
									className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${priorityStyles(
										task.priority
									)}`}
								>
									{priorityLabel(task.priority)}
								</span>
							</div>

							<div className="text-sm font-semibold text-text-primary">{task.organization}</div>
							<div className="text-sm text-text-primary mt-1">{task.title}</div>
							<div className="text-sm text-text-muted mt-1">{task.description}</div>

							<div className="mt-3 flex flex-wrap items-center gap-2">
								<button
									type="button"
									onClick={() => handleImprove(task)}
									disabled={navigatingTaskId === task.id}
									className="button button-secondary px-3 py-1.5 text-sm"
								>
									{navigatingTaskId === task.id ? "Opening..." : "Complete →"}
								</button>

								<button
									type="button"
									onClick={() => handleMarkNotApplicable(task)}
									disabled={markingTaskId === task.id}
									className="button button-secondary px-3 py-1.5 text-sm"
								>
									{markingTaskId === task.id ? "Saving..." : "Mark Not Applicable"}
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

