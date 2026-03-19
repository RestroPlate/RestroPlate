import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { submitDonationRequest } from "../services/donationRequestService";

export default function CenterCreateRequest() {
	const navigate = useNavigate();
	const location = useLocation();
	const [foodType, setFoodType] = useState("");
	const [requestedQuantity, setRequestedQuantity] = useState("");
	const [unit, setUnit] = useState("");
	
	const [requesting, setRequesting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const initialFoodType = searchParams.get("foodType");
		const initialUnit = searchParams.get("unit");
		
		if (initialFoodType) setFoodType(initialFoodType);
		if (initialUnit) setUnit(initialUnit);
	}, [location]);

	async function handleRequestSubmit(
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();

		const quantity = Number(requestedQuantity);
		if (Number.isNaN(quantity) || quantity <= 0) {
			setError("Enter a valid requested quantity greater than 0.");
			return;
		}

		if (!foodType.trim() || !unit.trim()) {
			setError("Food type and unit are required.");
			return;
		}

		setRequesting(true);
		setError(null);

		try {
			const response = await submitDonationRequest({
				foodType: foodType.trim(),
				requestedQuantity: quantity,
				unit: unit.trim()
			});

			setSuccessMessage(
				`Request #${response.donationRequestId} submitted with ${response.status} status.`
			);
			setFoodType("");
			setRequestedQuantity("");
			setUnit("");

			setTimeout(() => navigate("/dashboard/center/requests"), 2000);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to submit donation request.",
			);
		} finally {
			setRequesting(false);
		}
	}

	return (
		<DashboardLayout>
			<div className="mx-auto max-w-2xl space-y-6">
				<div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7DC542]">
							Create Donation Request
						</p>
						<h2 className="mt-2 text-2xl font-black text-[#F0EBE1]">
							Specify the food your center needs.
						</h2>
						<p className="mt-2 text-sm text-[#F0EBE1]/65">
							This will be visible to donors who can then choose to fulfill your request.
						</p>
					</div>

					<Link
						to="/dashboard/center/requests"
						className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#7DC542]/35 bg-[#7DC542]/10 px-4 py-3 text-sm font-bold text-[#7DC542] transition hover:border-[#7DC542]/60 hover:bg-[#7DC542]/15"
					>
						Outgoing Requests
					</Link>
				</div>

				{successMessage ? (
					<div className="rounded-xl border border-[#7DC542]/30 bg-[#7DC542]/10 px-4 py-3 text-sm font-semibold text-[#D6F2BE]">
						{successMessage}
					</div>
				) : null}

				<section className="rounded-xl border border-white/10 bg-white/5 p-6">
					<form onSubmit={handleRequestSubmit} className="space-y-5">
						
						<label className="block space-y-2">
							<span className="text-sm font-bold text-[#F0EBE1]">Food Type Needed</span>
							<input
								type="text"
								value={foodType}
								onChange={(e) => setFoodType(e.target.value)}
								placeholder="e.g., Rice, Bread, Vegetables"
								className="auth-input w-full"
								required
							/>
						</label>

						<div className="grid grid-cols-2 gap-4">
							<label className="block space-y-2">
								<span className="text-sm font-bold text-[#F0EBE1]">Quantity</span>
								<input
									type="number"
									min="0.01"
									step="0.01"
									value={requestedQuantity}
									onChange={(e) => setRequestedQuantity(e.target.value)}
									placeholder="e.g., 50"
									className="auth-input w-full"
									required
								/>
							</label>

							<label className="block space-y-2">
								<span className="text-sm font-bold text-[#F0EBE1]">Unit</span>
								<input
									type="text"
									value={unit}
									onChange={(e) => setUnit(e.target.value)}
									placeholder="e.g., kg, loaves, servings"
									className="auth-input w-full"
									required
								/>
							</label>
						</div>

						{error ? (
							<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
								{error}
							</div>
						) : null}

						<button
							type="submit"
							disabled={requesting}
							className="mt-6 w-full rounded-xl bg-[#7DC542] px-4 py-3 text-sm font-black text-[#0B1A08] transition hover:bg-[#90D85A] disabled:cursor-not-allowed disabled:opacity-60"
						>
							{requesting ? "Submitting..." : "Submit Request"}
						</button>
					</form>
				</section>
			</div>
		</DashboardLayout>
	);
}
