import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	getCurrentUser,
	getUserProfile,
	logout,
} from "../../services/authService";
import type { UserProfileDto } from "../../types/Auth";

interface DashboardLayoutProps {
	children: ReactNode;
}

interface SidebarLink {
	label: string;
	icon: string;
	path: string;
	matchPrefixes?: string[];
}

const SIDEBAR_LINKS_DONOR: SidebarLink[] = [
	{ label: "Dashboard", icon: "D", path: "/dashboard/donor" },
	{ label: "My Donations", icon: "M", path: "/dashboard/donor/my-donations" },
	{ label: "Create Donation", icon: "C", path: "/dashboard/donor/create" },
	{
		label: "Incoming Requests",
		icon: "R",
		path: "/dashboard/donor/explore",
		matchPrefixes: ["/dashboard/donor/explore"],
	},
];

const SIDEBAR_LINKS_CENTER: SidebarLink[] = [
	{ label: "Dashboard", icon: "D", path: "/dashboard/center" },
	{
		label: "Browse Donations",
		icon: "B",
		path: "/dashboard/center/explore",
		matchPrefixes: ["/dashboard/center/explore"],
	},
	{
		label: "My Claims",
		icon: "C",
		path: "/dashboard/center/claims",
		matchPrefixes: ["/dashboard/center/claims"],
	},
	{
		label: "My Requests",
		icon: "R",
		path: "/dashboard/center/requests",
		matchPrefixes: ["/dashboard/center/requests"],
	},
	{
		label: "Inventory",
		icon: "I",
		path: "/dashboard/center/inventory",
		matchPrefixes: ["/dashboard/center/inventory"],
	},
];

function isCurrentPath(
	currentPath: string,
	targetPath: string,
	matchPrefixes?: string[],
): boolean {
	if (currentPath === targetPath) return true;
	return (matchPrefixes ?? []).some((prefix) => currentPath.startsWith(prefix));
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const user = getCurrentUser();
	const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);

	useEffect(() => {
		let active = true;

		async function fetchProfile(): Promise<void> {
			try {
				const profile = await getUserProfile();
				if (active) {
					setUserProfile(profile);
				}
			} catch (err) {
				console.error("Error fetching user profile:", err);
			}
		}

		void fetchProfile();

		return () => {
			active = false;
		};
	}, []);

	const sidebarLinks =
		user?.role === "DONOR" ? SIDEBAR_LINKS_DONOR : SIDEBAR_LINKS_CENTER;
	const roleBadge =
		user?.role === "DONOR" ? "Donation Provider" : "Distribution Center";

	function handleLogout(): void {
		logout();
		navigate("/");
	}

	return (
		<div className="flex min-h-screen bg-[#0B1A08]">
			<aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-[#7DC542]/15 bg-white/[0.03] md:flex">
				<button
					type="button"
					onClick={() => navigate("/")}
					className="flex items-center gap-3 border-b border-[#7DC542]/10 px-6 py-7 text-left text-xl font-black text-[#7DC542]"
				>
					<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#7DC542]/15 text-sm text-[#7DC542]">
						R
					</span>
					RestroPlate
				</button>

				<nav className="flex flex-1 flex-col gap-2 px-3 py-5">
					{sidebarLinks.map((link) => {
						const active = isCurrentPath(
							location.pathname,
							link.path,
							link.matchPrefixes,
						);

						return (
							<button
								key={link.path}
								type="button"
								onClick={() => navigate(link.path)}
								className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
									active
										? "bg-[#7DC542]/15 text-[#7DC542]"
										: "text-[#F0EBE1]/65 hover:bg-white/5 hover:text-[#F0EBE1]"
								}`}
							>
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-black">
									{link.icon}
								</span>
								{link.label}
							</button>
						);
					})}
				</nav>

				<div className="mt-auto border-t border-[#7DC542]/10 px-3 py-5">
					<div className="px-4 pb-4">
						<p className="text-sm font-bold text-[#F0EBE1]">
							{userProfile?.name ?? user?.name ?? "Signed in user"}
						</p>
						<p className="mt-1 text-xs text-[#F0EBE1]/45">
							{userProfile?.email ?? user?.email ?? ""}
						</p>
					</div>

					<button
						type="button"
						onClick={handleLogout}
						className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#F0EBE1]/60 transition hover:bg-rose-500/10 hover:text-rose-300"
					>
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-black">
							X
						</span>
						Log Out
					</button>
				</div>
			</aside>

			<main className="min-h-screen flex-1 md:ml-[260px]">
				<header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#7DC542]/10 px-5 py-5 md:px-8">
					<div>
						<h1 className="text-2xl font-black text-[#F0EBE1] md:text-3xl">
							Welcome back, {userProfile?.name ?? user?.name ?? "there"}
						</h1>
						<p className="mt-1 text-sm text-[#F0EBE1]/55">
							Manage donations, requests, and distribution activity from one
							place.
						</p>
					</div>

					<span className="rounded-full border border-[#7DC542]/20 bg-[#7DC542]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#7DC542]">
						{roleBadge}
					</span>
				</header>

				<div className="px-5 pb-[96px] pt-6 md:px-8 md:pb-10">{children}</div>
			</main>

			<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#7DC542]/15 bg-[#0B1A08]/95 px-2 py-2 backdrop-blur md:hidden">
				<div
					className={`grid gap-2 ${
						sidebarLinks.length === 4 ? "grid-cols-5" : "grid-cols-4"
					}`}
				>
					{sidebarLinks.map((link) => {
						const active = isCurrentPath(
							location.pathname,
							link.path,
							link.matchPrefixes,
						);

						return (
							<button
								key={link.path}
								type="button"
								onClick={() => navigate(link.path)}
								className={`rounded-xl px-2 py-2 text-center text-[11px] font-bold transition ${
									active
										? "bg-[#7DC542]/15 text-[#7DC542]"
										: "text-[#F0EBE1]/55 hover:bg-white/5 hover:text-[#F0EBE1]"
								}`}
							>
								<div className="text-sm font-black">{link.icon}</div>
								<div className="mt-1">{link.label}</div>
							</button>
						);
					})}

					<button
						type="button"
						onClick={handleLogout}
						className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-[#F0EBE1]/55 transition hover:bg-white/5 hover:text-[#F0EBE1]"
					>
						<div className="text-sm font-black">X</div>
						<div className="mt-1">Log Out</div>
					</button>
				</div>
			</nav>
		</div>
	);
}
