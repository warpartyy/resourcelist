"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
	getSuggestedImprovementTasks,
	ImprovementTask,
} from "@/lib/services/improvements/improvementService";
import { navigateToAdminResource } from "../../../lib/services/admin/resourceNavigationService";

function priorityStyles(priority: ImprovementTask["priority"]) {
	if (priority === "high") {
		return "bg-red-100 text-red-700 border-red-200";
	}
	if (priority === "medium") {
		return "bg-amber-100 text-amber-700 border-amber-200";
	}
	return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function SuggestedImprovementsPanel() {
	const [tasks, setTasks] = useState<ImprovementTask[]>([]);
	const [loading, setLoading] = useState(true);
	const [navigatingTaskId, setNavigatingTaskId] = useState<string | null>(null);

	const router = useRouter();

	const loadTasks = async () => {
		setLoading(true);
		try {
			const next = await getSuggestedImprovementTasks();
			setTasks(next);
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
		};
	}, [tasks]);

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

	if (loading) {
		return <div className="text-sm text-text-muted">Loading suggested improvements...</div>;
	}

	return (
		<div className="space-y-4">
			<div className="bg-surface border border-border rounded-xl p-4">
				<h2 className="text-lg font-semibold">Suggested Improvements</h2>
				<div className="mt-2 text-sm text-text-muted space-y-1">
					<p>{summary.total} Tasks</p>
					<p>High: {summary.high}</p>
					<p>Medium: {summary.medium}</p>
					<p>Low: {summary.low}</p>
				</div>
			</div>

			{tasks.length === 0 ? (
				<div className="bg-surface border border-border rounded-xl p-5 text-sm text-text-muted">
					<div className="text-2xl leading-none">🎉</div>
					<p className="mt-2">
						Every approved and rejected resource currently has the recommended information completed.
					</p>
					<p className="mt-1">Nice work!</p>
				</div>
			) : (
				<div className="space-y-3">
					{tasks.map((task) => (
						<div key={task.id} className="bg-surface border border-border rounded-xl p-4">
							<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
								<span
									className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${priorityStyles(
										task.priority
									)}`}
								>
									{task.priority}
								</span>
							</div>

							<div className="text-sm font-semibold text-text-primary">{task.organization}</div>
							<div className="text-sm text-text-primary mt-1">{task.title}</div>
							<div className="text-sm text-text-muted mt-1">{task.description}</div>

							<button
								type="button"
								onClick={() => handleImprove(task)}
								disabled={navigatingTaskId === task.id}
								className="mt-3 button button-secondary px-3 py-1.5 text-sm"
							>
								{navigatingTaskId === task.id ? "Opening..." : "Improve →"}
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

