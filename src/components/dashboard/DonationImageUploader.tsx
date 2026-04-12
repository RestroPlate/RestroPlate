import { useRef, useState } from "react";
import type { DonationImage } from "../../types/Dashboard";
import {
	validateImageFile,
	uploadDonationImage,
	deleteDonationImage,
	resolveImageUrl,
} from "../../services/donationImageService";

interface DonationImageUploaderProps {
	donationId: number;
	initialImages?: DonationImage[];
}

export default function DonationImageUploader({
	donationId,
	initialImages = [],
}: DonationImageUploaderProps) {
	const [images, setImages] = useState<DonationImage[]>(initialImages);
	// local object URLs for instant preview before the server responds
	const [localPreviews, setLocalPreviews] = useState<Map<string, string>>(
		new Map(),
	);
	const [uploading, setUploading] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	async function handleFileChange(
		e: React.ChangeEvent<HTMLInputElement>,
	): Promise<void> {
		const files = Array.from(e.target.files ?? []);
		if (files.length === 0) return;
		setError(null);

		// Validate every selected file first
		for (const file of files) {
			const validationError = validateImageFile(file);
			if (validationError) {
				setError(validationError);
				if (fileInputRef.current) fileInputRef.current.value = "";
				return;
			}
		}

		setUploading(true);
		const uploaded: DonationImage[] = [];

		try {
			for (const file of files) {
				// Show instant local preview using object URL
				const objectUrl = URL.createObjectURL(file);
				const tempKey = `temp-${Date.now()}-${file.name}`;
				setLocalPreviews((prev) => new Map(prev).set(tempKey, objectUrl));

				const img = await uploadDonationImage(donationId, file);
				uploaded.push(img);

				// Clean up the temp object URL — not needed after server responds
				URL.revokeObjectURL(objectUrl);
				setLocalPreviews((prev) => {
					const next = new Map(prev);
					next.delete(tempKey);
					return next;
				});
			}
			setImages((prev) => [...prev, ...uploaded]);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed.");
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	}

	async function handleDelete(imageId: number): Promise<void> {
		setDeletingId(imageId);
		setError(null);
		try {
			await deleteDonationImage(donationId, imageId);
			setImages((prev) => prev.filter((img) => img.imageId !== imageId));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to remove image.");
		} finally {
			setDeletingId(null);
		}
	}

	const tempPreviews = Array.from(localPreviews.entries());

	return (
		<div className="space-y-3">
			{/* Header row */}
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70">
						Food Photos
					</p>
					<p className="mt-0.5 text-[11px] text-[#F0EBE1]/40">
						JPG, JPEG or PNG · Max 5MB each · Multiple allowed
					</p>
				</div>
				<button
					type="button"
					disabled={uploading}
					onClick={() => fileInputRef.current?.click()}
					className="inline-flex items-center gap-2 rounded-lg border border-[#7DC542]/40 bg-[#7DC542]/10 px-4 py-2 text-xs font-bold text-[#7DC542] transition hover:bg-[#7DC542]/20 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{uploading ? (
						<>
							<svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							Uploading...
						</>
					) : (
						<>
							<svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							Add Photo
						</>
					)}
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept=".jpg,.jpeg,.png"
					multiple
					className="hidden"
					onChange={handleFileChange}
				/>
			</div>

			{/* Error */}
			{error ? (
				<div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
					{error}
				</div>
			) : null}

			{/* Empty state */}
			{images.length === 0 && tempPreviews.length === 0 ? (
				<button
					type="button"
					disabled={uploading}
					onClick={() => fileInputRef.current?.click()}
					className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-8 transition hover:border-[#7DC542]/40 hover:bg-[#7DC542]/5 disabled:cursor-not-allowed"
				>
					<svg
						className="h-8 w-8 text-[#F0EBE1]/20"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<p className="text-xs text-[#F0EBE1]/40">
						Click to add food photos (optional)
					</p>
				</button>
			) : (
				/* Image grid with previews */
				<div className="grid grid-cols-3 gap-2">
					{/* Uploaded images */}
					{images.map((img) => (
						<div
							key={img.imageId}
							className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#111F0F]"
						>
							<img
								src={resolveImageUrl(img.imageUrl)}
								alt={img.fileName}
								className="h-full w-full object-cover"
							/>
							{/* Delete overlay */}
							<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
								<button
									type="button"
									disabled={deletingId === img.imageId}
									onClick={() => handleDelete(img.imageId)}
									className="rounded-full bg-rose-500/90 p-2 text-white transition hover:bg-rose-500 disabled:opacity-50"
									aria-label={`Remove ${img.fileName}`}
								>
									{deletingId === img.imageId ? (
										<svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
										</svg>
									) : (
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									)}
								</button>
							</div>
						</div>
					))}

					{/* Temp previews while uploading */}
					{tempPreviews.map(([key, url]) => (
						<div
							key={key}
							className="relative aspect-square overflow-hidden rounded-xl border border-[#7DC542]/30 bg-[#111F0F]"
						>
							<img
								src={url}
								alt="Uploading..."
								className="h-full w-full object-cover opacity-60"
							/>
							<div className="absolute inset-0 flex items-center justify-center">
								<svg className="h-6 w-6 animate-spin text-[#7DC542]" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
								</svg>
							</div>
						</div>
					))}

					{/* Add more button */}
					<button
						type="button"
						disabled={uploading}
						onClick={() => fileInputRef.current?.click()}
						className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 text-[#F0EBE1]/30 transition hover:border-[#7DC542]/40 hover:text-[#7DC542] disabled:cursor-not-allowed"
					>
						<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						<span className="text-[10px] font-bold">Add</span>
					</button>
				</div>
			)}
		</div>
	);
}
