import { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DCInventoryTable from "../components/dashboard/DCInventoryTable";
import PublishedInventoryTable from "../components/dashboard/PublishedInventoryTable";

type TabType = "publish" | "collect";

export default function CenterInventory() {
	const [activeTab, setActiveTab] = useState<TabType>("publish");

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
							Center Inventory
						</p>
						<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
							Manage & Publish Inventory
						</h2>
						<p className="mt-2 text-sm text-[#F0EBE1]/65">
							Toggle visibility for community members or manage your collected donations in one place.
						</p>
					</div>
				</div>

				{/* Tabs Navigation */}
				<div className="flex border-b border-white/10">
					<button
						type="button"
						onClick={() => setActiveTab("publish")}
						className={`px-6 py-3 text-sm font-bold transition-colors relative ${
							activeTab === "publish"
								? "text-[#7DC542]"
								: "text-[#F0EBE1]/50 hover:text-[#F0EBE1]"
						}`}
					>
						Publish to Consumers
						{activeTab === "publish" && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7DC542]" />
						)}
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("collect")}
						className={`px-6 py-3 text-sm font-bold transition-colors relative ${
							activeTab === "collect"
								? "text-[#7DC542]"
								: "text-[#F0EBE1]/50 hover:text-[#F0EBE1]"
						}`}
					>
						Mark as Collected
						{activeTab === "collect" && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7DC542]" />
						)}
					</button>
				</div>

				{/* Tab Content */}
				<div className="mt-4">
					{activeTab === "publish" ? (
						<PublishedInventoryTable />
					) : (
						<div className="space-y-6">
                            <div className="rounded-xl border border-[#7DC542]/20 bg-[#7DC542]/5 p-4 text-sm text-[#F0EBE1]/80">
                                <p>Items listed here are waiting to be picked up from donors. Once collected, they will move to your available inventory.</p>
                            </div>
							<DCInventoryTable />
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
