import { useState, useCallback, type FormEvent, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import LocationPicker from "react-location-picker";
import StatusNotice from "../components/StatusNotice";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { uploadDonationImage, validateImageFile } from "../services/donationImageService";
import { createDonation, getMyDonations } from "../services/donationService";
import type { CreateDonationPayload } from "../types/Dashboard";

interface DonationFormState {
	foodType: string;
	quantity: string;
	unit: string;
	expirationDate: string;
	pickupAddress: string;
	availabilityTime: string;
}

type FormErrors = Partial<Record<keyof DonationFormState, string>>;

const INITIAL_FORM: DonationFormState = {
	foodType: "",
	quantity: "",
	unit: "",
	expirationDate: "",
	pickupAddress: "",
	availabilityTime: "",
};

function validateDonationForm(values: DonationFormState): FormErrors {
	const errors: FormErrors = {};
	const quantity = Number(values.quantity);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (!values.foodType.trim()) errors.foodType = "Food type is required.";
	if (!values.unit.trim()) errors.unit = "Unit is required.";
	if (!values.expirationDate) {
		errors.expirationDate = "Expiration date is required.";
	} else {
		const expiration = new Date(`${values.expirationDate}T00:00:00`);
		if (Number.isNaN(expiration.getTime()) || expiration < today) {
			errors.expirationDate = "Expiration date must be today or later.";
		}
	}
	if (!values.pickupAddress.trim())
		errors.pickupAddress = "Pickup address is required.";
	if (!values.availabilityTime)
		errors.availabilityTime = "Availability time is required.";
	if (!values.quantity.trim()) {
		errors.quantity = "Quantity is required.";
	} else if (!Number.isFinite(quantity) || quantity <= 0) {
		errors.quantity = "Quantity must be greater than 0.";
	}

	return errors;
}

function toPayload(values: DonationFormState): CreateDonationPayload {
	return {
		foodType: values.foodType.trim(),
		quantity: Number(values.quantity),
		unit: values.unit.trim(),
		expirationDate: values.expirationDate,
		pickupAddress: values.pickupAddress.trim(),
		availabilityTime: values.availabilityTime,
	};
}

const INPUT_CLASS =
	"w-full rounded-lg border border-white/15 bg-[#111F0F] px-3 py-2 text-sm text-[#F0EBE1] outline-none transition focus:border-[#7DC542]";
const LABEL_CLASS =
	"mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70";

export default function DonorCreateDonation() {
	const navigate = useNavigate();
	const [form, setForm] = useState<DonationFormState>(INITIAL_FORM);
	const [errors, setErrors] = useState<FormErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [notice, setNotice] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [mapCenter, setMapCenter] = useState({ lat: 6.927079, lng: 79.861244 });

	function handleFieldChange(
		field: keyof DonationFormState,
		value: string,
	): void {
		setForm((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	}

	useEffect(() => {
		return () => {
			previews.forEach((p) => URL.revokeObjectURL(p));
		};
	}, [previews]);

	function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files ?? []);
		if (files.length === 0) return;
		setUploadError(null);

		for (const file of files) {
			const err = validateImageFile(file);
			if (err) {
				setUploadError(err);
				if (fileInputRef.current) fileInputRef.current.value = "";
				return;
			}
		}

		setSelectedFiles((prev) => [...prev, ...files]);
		setPreviews((prev) => [
			...prev,
			...files.map((f) => URL.createObjectURL(f)),
		]);

		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	function removePhoto(index: number) {
		const newFiles = [...selectedFiles];
		newFiles.splice(index, 1);
		setSelectedFiles(newFiles);

		const newPreviews = [...previews];
		URL.revokeObjectURL(newPreviews[index]);
		newPreviews.splice(index, 1);
		setPreviews(newPreviews);
	}

	const handleLocationChange = useCallback(({ position, address }: { position: { lat: number; lng: number }; address: string }) => {
		const locString = address || `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
		setForm((prev) => ({ ...prev, pickupAddress: locString }));
		setErrors((prev) => ({ ...prev, pickupAddress: undefined }));
	}, []);

	async function handleCreateDonation(
		event: FormEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();
		setNotice(null);

		const nextErrors = validateDonationForm(form);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0) {
			setNotice({
				type: "error",
				message: "Please fix the highlighted fields.",
			});
			return;
		}

		setSubmitting(true);
		try {
			const created = await createDonation(toPayload(form));

			if (selectedFiles.length > 0) {
				setNotice({
					type: "success",
					message: "Donation listing created! Uploading photos...",
				});
				for (const file of selectedFiles) {
					try {
						await uploadDonationImage(created.donationId, file);
					} catch (uploadErr) {
						console.error("Failed to upload image", uploadErr);
					}
				}
			}

			try {
				await getMyDonations();
			} catch {
				// Refresh cache silently
			}

			setForm(INITIAL_FORM);
			setSelectedFiles([]);
			setPreviews([]);
			setNotice({
				type: "success",
				message: "Donation listing created successfully!",
			});

			setTimeout(() => {
				navigate("/dashboard/donor/my-donations");
			}, 1500);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to create donation.";
			setNotice({ type: "error", message });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<DashboardLayout>
			<div className="mx-auto max-w-2xl space-y-6">
				<div>
					<h2 className="text-xl font-bold text-[#F0EBE1]">
						Create Donation Listing
					</h2>
					<p className="mt-1 text-sm text-[#F0EBE1]/65">
						Add your surplus food details so distribution centers can request a
						pickup.
					</p>
				</div>

				{notice ? (
					<StatusNotice
						type={notice.type}
						message={notice.message}
						onClose={() => setNotice(null)}
					/>
				) : null}

				<section className="rounded-xl border border-white/10 bg-white/5 p-5">
					<form
						className="grid grid-cols-1 gap-4 md:grid-cols-2"
						onSubmit={handleCreateDonation}
						noValidate
					>
						<div>
							<label htmlFor="foodType" className={LABEL_CLASS}>
								Food Type
							</label>
							<input
								id="foodType"
								type="text"
								value={form.foodType}
								onChange={(e) => handleFieldChange("foodType", e.target.value)}
								className={INPUT_CLASS}
								placeholder="Fresh bread"
							/>
							{errors.foodType ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.foodType}
								</p>
							) : null}
						</div>

						<div>
							<label htmlFor="quantity" className={LABEL_CLASS}>
								Quantity
							</label>
							<input
								id="quantity"
								type="number"
								min="0.01"
								step="0.01"
								value={form.quantity}
								onChange={(e) => handleFieldChange("quantity", e.target.value)}
								className={INPUT_CLASS}
								placeholder="20"
							/>
							{errors.quantity ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.quantity}
								</p>
							) : null}
						</div>

						<div>
							<label htmlFor="unit" className={LABEL_CLASS}>
								Unit
							</label>
							<input
								id="unit"
								type="text"
								value={form.unit}
								onChange={(e) => handleFieldChange("unit", e.target.value)}
								className={INPUT_CLASS}
								placeholder="kg, servings, boxes"
							/>
							{errors.unit ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.unit}
								</p>
							) : null}
						</div>

						<div>
							<label htmlFor="expirationDate" className={LABEL_CLASS}>
								Expiration Date
							</label>
							<input
								id="expirationDate"
								type="date"
								value={form.expirationDate}
								onChange={(e) =>
									handleFieldChange("expirationDate", e.target.value)
								}
								className={INPUT_CLASS}
							/>
							{errors.expirationDate ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.expirationDate}
								</p>
							) : null}
						</div>

						<div className="md:col-span-2 space-y-2">
							<label className={LABEL_CLASS}>
								Pickup Location / Coordinates
							</label>
							<input
								type="text"
								placeholder="Manual Lat, Lng (e.g. 6.9271, 79.8612)"
								className="auth-input w-full text-xs"
								value={form.pickupAddress}
								onChange={(e) => {
									const val = e.target.value;
									handleFieldChange("pickupAddress", val);
									const parts = val.split(",").map(p => p.trim());
									if (parts.length === 2) {
										const lat = parseFloat(parts[0]);
										const lng = parseFloat(parts[1]);
										if (!isNaN(lat) && !isNaN(lng)) {
											setMapCenter({ lat, lng });
										}
									}
								}}
							/>
							<div className="overflow-hidden rounded-xl border border-white/10 bg-[#111F0F]">
								<LocationPicker
									defaultPosition={mapCenter}
									onChange={handleLocationChange}
									mapContainerStyle={{ height: '200px', width: '100%' }}
								/>
								<div className="p-2 text-xs text-[#F0EBE1] break-all border-t border-white/5">
									<span className="opacity-50">Selected: </span>
									{form.pickupAddress || "(None)"}
								</div>
							</div>
							<input type="hidden" id="pickupAddress" value={form.pickupAddress} required />
							{errors.pickupAddress ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.pickupAddress}
								</p>
							) : null}
						</div>

						<div>
							<label htmlFor="availabilityTime" className={LABEL_CLASS}>
								Availability Time
							</label>
							<input
								id="availabilityTime"
								type="time"
								value={form.availabilityTime}
								onChange={(e) =>
									handleFieldChange("availabilityTime", e.target.value)
								}
								className={INPUT_CLASS}
							/>
							{errors.availabilityTime ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.availabilityTime}
								</p>
							) : null}
						</div>

						<div className="md:col-span-2 space-y-3 pt-2">
							<div className="flex items-center justify-between">
								<div>
									<label className={LABEL_CLASS}>Food Photos</label>
									<p className="mt-0.5 text-[11px] text-[#F0EBE1]/40">
										JPG, JPEG, PNG · Max 5MB each
									</p>
								</div>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="inline-flex items-center gap-2 rounded-lg border border-[#7DC542]/40 bg-[#7DC542]/10 px-4 py-2 text-xs font-bold text-[#7DC542] transition hover:bg-[#7DC542]/20"
								>
									Add Photo
								</button>
								<input
									ref={fileInputRef}
									type="file"
									accept=".jpg,.jpeg,.png"
									multiple
									className="hidden"
									onChange={handlePhotoChange}
								/>
							</div>

							{uploadError ? (
								<div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
									{uploadError}
								</div>
							) : null}

							{previews.length > 0 ? (
								<div className="grid grid-cols-4 gap-2">
									{previews.map((url, i) => (
										<div
											key={url}
											className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#111F0F]"
										>
											<img
												src={url}
												alt="Preview"
												className="h-full w-full object-cover"
											/>
											<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
												<button
													type="button"
													onClick={() => removePhoto(i)}
													className="rounded-full bg-rose-500/90 p-1.5 text-white transition hover:bg-rose-500"
												>
													<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</div>
									))}
								</div>
							) : null}
						</div>

						<div className="md:col-span-2">
							<button
								type="submit"
								disabled={submitting}
								className="inline-flex items-center rounded-lg bg-[#7DC542] px-6 py-2.5 text-sm font-extrabold text-[#0B1A08] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(125,197,66,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{submitting ? "CREATING..." : "CREATE DONATION"}
							</button>
						</div>
					</form>
				</section>
			</div>
		</DashboardLayout>
	);
}
