import { getSupabase } from "@/lib/supabase";

export async function deleteNotification(id: string, userId: string) {
	const supabase = getSupabase();

	return supabase
		.from("notifications")
		.delete()
		.eq("id", id)
		.eq("user_id", userId);
}

export async function deleteNotifications(ids: string[], userId: string) {
	if (!ids.length) {
		return { error: null };
	}

	const supabase = getSupabase();

	return supabase
		.from("notifications")
		.delete()
		.in("id", ids)
		.eq("user_id", userId);
}

export async function deleteAllNotifications(userId: string) {
	const supabase = getSupabase();

	return supabase
		.from("notifications")
		.delete()
		.eq("user_id", userId);
}

export async function getResourceSlugById(resourceId: string) {
	const supabase = getSupabase();

	return supabase
		.from("resources")
		.select("slug")
		.eq("id", resourceId)
		.single();
}

export async function getResourceStatusById(resourceId: string) {
	const supabase = getSupabase();

	return supabase
		.from("resources")
		.select("status")
		.eq("id", resourceId)
		.single();
}

