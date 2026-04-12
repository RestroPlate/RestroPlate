import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useMemo } from "react";

interface LocationViewProps {
	address: string;
	className?: string;
	height?: string;
}

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 }; // Colombo

export default function LocationView({
	address,
	className = "",
	height = "200px",
}: LocationViewProps) {
	const { isLoaded } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
	});

	const coordinates = useMemo(() => {
		if (!address) return null;
		const parts = address.split(",").map((p) => p.trim());
		if (parts.length === 2) {
			const lat = Number.parseFloat(parts[0]);
			const lng = Number.parseFloat(parts[1]);
			if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
				return { lat, lng };
			}
		}
		return null;
	}, [address]);

	if (!isLoaded) {
		return (
			<div
				className={`flex items-center justify-center bg-white/5 rounded-xl border border-white/10 ${className}`}
				style={{ height }}
			>
				<p className="text-xs text-[#F0EBE1]/40 animate-pulse">Loading Map...</p>
			</div>
		);
	}

	return (
		<div className={`overflow-hidden rounded-xl border border-white/10 ${className}`}>
			<GoogleMap
				mapContainerStyle={{ width: "100%", height }}
				center={coordinates || DEFAULT_CENTER}
				zoom={coordinates ? 15 : 12}
				options={{
					disableDefaultUI: true,
					zoomControl: true,

				}}
			>
				{coordinates && <Marker position={coordinates} />}
			</GoogleMap>
			<div className="bg-[#111F0F] p-2 text-[11px] text-[#F0EBE1]/80 break-all border-t border-white/5">
				<span className="opacity-40 uppercase font-bold mr-1">Address:</span>
				{address || "Not provided"}
				{!coordinates && address && (
					<span className="ml-2 text-amber-400/60">(Visual map unavailable for text address)</span>
				)}
			</div>
		</div>
	);
}
