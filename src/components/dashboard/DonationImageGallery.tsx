import { useEffect, useState } from "react";
import type { DonationImage } from "../../types/Dashboard";
import {
	getDonationImages,
	resolveImageUrl,
} from "../../services/donationImageService";

interface DonationImageGalleryProps {
	donationId: number;
	images?: DonationImage[];
}

export default function DonationImageGallery({
	donationId,
	images: propImages,
}: DonationImageGalleryProps) {
	const [images, setImages] = useState<DonationImage[]>(propImages ?? []);
	const [loading, setLoading] = useState(propImages === undefined);
	const [lightboxImg, setLightboxImg] = useState<DonationImage | null>(null);

	useEffect(() => {
		if (propImages !== undefined) {
			setImages(propImages);
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		getDonationImages(donationId).then((data) => {
			if (!cancelled) {
				setImages(data);
				setLoading(false);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [donationId, propImages]);

	if (loading) {
		return (
			<div className="grid grid-cols-3 gap-2">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="aspect-square animate-pulse rounded-xl bg-white/10"
					/>
				))}
			</div>
		);
	}

	if (images.length === 0) {
		return (
			<p className="text-xs italic text-[#F0EBE1]/35">
				No photos provided by the donor.
			</p>
		);
	}

	return (
		<>
			<div className="grid grid-cols-3 gap-2">
				{images.map((img) => (
					<button
						key={img.imageId}
						type="button"
						onClick={() => setLightboxImg(img)}
						className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#111F0F] transition hover:border-[#7DC542]/40"
						aria-label={`View photo ${img.fileName}`}
					>
						<img
							src={resolveImageUrl(img.imageUrl)}
							alt={img.fileName}
							className="h-full w-full object-cover transition group-hover:scale-105"
						/>
						<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
							<svg
								className="h-5 w-5 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
					</button>
				))}
			</div>

			{/* Lightbox */}
			{lightboxImg ? (
				<div
					className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
					role="dialog"
					aria-modal="true"
					onClick={() => setLightboxImg(null)}
					onKeyDown={(e) => {
						if (e.key === "Escape") setLightboxImg(null);
					}}
				>
					<div
						className="relative"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={() => {}}
					>
						<img
							src={resolveImageUrl(lightboxImg.imageUrl)}
							alt={lightboxImg.fileName}
							className="h-[85vh] w-[90vw] rounded-xl object-contain shadow-2xl"
						/>
						<button
							type="button"
							onClick={() => setLightboxImg(null)}
							className="absolute -right-3 -top-3 rounded-full bg-[#0F1D0C] p-2 text-[#F0EBE1]/70 shadow-lg transition hover:text-[#F0EBE1]"
							aria-label="Close preview"
						>
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			) : null}
		</>
	);
}
