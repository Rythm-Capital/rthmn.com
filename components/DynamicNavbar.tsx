import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Navbar from "@/components/ui/Navbar/Navbar";
import { AuthNavbar } from "@/components/ui/AuthNavbar";

const DynamicNavbar = async () => {
	const cookieStore = cookies();

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
			},
		},
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	let hasSubscription = false;
	if (user) {
		const { data: subscriptionData, error } = await supabase
			.from("subscriptions")
			.select("*")
			.eq("user_id", user.id)
			.eq("status", "active")
			.single();

		if (subscriptionData && !error) {
			hasSubscription = true;
		}
	}

	if (user && hasSubscription) {
		return <AuthNavbar user={user} />;
	} else {
		return <Navbar />;
	}
};

export default DynamicNavbar;
