import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState, useMemo } from "react";
import { getPublicCentersWithDonations, type PublicCenterDonationInfo } from "../services/publicService";

const MAP_CONTAINER_STYLE = {
	width: "100%",
	height: "500px",
};

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };

export function PublicMap() {
	const { isLoaded } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
	});

	const [centers, setCenters] = useState<PublicCenterDonationInfo[]>([]);
	const [selectedCenter, setSelectedCenter] = useState<(PublicCenterDonationInfo & { position: { lat: number; lng: number } }) | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const data = await getPublicCentersWithDonations();
				setCenters(data);
			} catch (error) {
				console.error("Failed to fetch public centers:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
		const interval = setInterval(fetchData, 60000);
		return () => clearInterval(interval);
	}, []);

	const centersWithCoords = useMemo(() => {
		return centers
			.map((center) => {
				const parts = center.address.split(",").map((p) => p.trim());
				if (parts.length === 2) {
					const lat = Number.parseFloat(parts[0]);
					const lng = Number.parseFloat(parts[1]);
					if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
						return { ...center, position: { lat, lng } };
					}
				}
				return { ...center, position: null };
			})
			.filter(
				(c): c is PublicCenterDonationInfo & { position: { lat: number; lng: number } } =>
					c.position !== null,
			);
	}, [centers]);

	if (!isLoaded || loading) {
		return (
			<div className="w-full h-[500px] flex items-center justify-center bg-[#0B1A08] border-y border-white/10">
				<div className="text-center space-y-4">
					<div className="w-12 h-12 border-4 border-[#7DC542]/30 border-t-[#7DC542] rounded-full animate-spin mx-auto"></div>
					<p className="text-[#F0EBE1]/60 font-bold uppercase tracking-widest text-sm">Loading Live Map...</p>
				</div>
			</div>
		);
	}

	return (
		<section className="relative w-full py-20 bg-[#0B1A08]">
			<div className="max-w-7xl mx-auto px-6 mb-12">
				<div className="inline-block px-4 py-1.5 rounded-full bg-[#7DC542]/10 border border-[#7DC542]/20 mb-4">
					<span className="text-[#7DC542] text-xs font-black uppercase tracking-widest">Live Network</span>
				</div>
				<h2 className="text-4xl md:text-5xl font-black text-[#F0EBE1] mb-6">
					Our Growing Impact <span className="text-[#7DC542]">Across the Region</span>
				</h2>
				<p className="text-lg text-[#F0EBE1]/60 max-w-2xl">
					Discover active distribution centers in our network. Each marker represents a hub connecting surplus food to those in need.
				</p>
			</div>

			<div className="w-full overflow-hidden border-y border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
				<GoogleMap
					mapContainerStyle={MAP_CONTAINER_STYLE}
					center={DEFAULT_CENTER}
					zoom={12}
					onClick={() => setSelectedCenter(null)}
					options={{
						styles: [
							{ elementType: "geometry", stylers: [{ color: "#0B1A08" }] },
							{ elementType: "labels.text.stroke", stylers: [{ color: "#0B1A08" }] },
							{ elementType: "labels.text.fill", stylers: [{ color: "#74921A" }] },
							{ featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
							{ featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
							{ featureType: "road", elementType: "geometry", stylers: [{ color: "#1F2D1A" }] },
							{ featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
							{ featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
							{ featureType: "water", elementType: "geometry", stylers: [{ color: "#051103" }] },
						],
						disableDefaultUI: false,
						streetViewControl: false,
						mapTypeControl: false,
					}}
				>
					{centersWithCoords.map((center, index) => (
						<Marker
							key={index}
							position={center.position!}
							label={{
								text: (center.availableDonations ?? 0).toString(),
								color: "#0B1A08",
								fontSize: "14px",
								fontWeight: "900",
							}}
							onClick={() => setSelectedCenter(center)}
						/>
					))}

					{selectedCenter?.position && (
						<InfoWindow
							position={selectedCenter.position}
							onCloseClick={() => setSelectedCenter(null)}
						>
							<div className="p-3 bg-[#0F1D0C] text-[#F0EBE1] min-w-[220px]">
								{/* Center name */}
								<h3 className="text-base font-black mb-1">{selectedCenter.centerName}</h3>

								{/* Address */}
								<p className="text-xs text-[#F0EBE1]/70 mb-1">📍 {selectedCenter.address}</p>

								{/* Phone */}
								{selectedCenter.phoneNumber && (
									<p className="text-xs text-[#F0EBE1]/70 mb-2">📞 {selectedCenter.phoneNumber}</p>
								)}

								{/* Operating Hours */}
								{selectedCenter.operatingHours && (
									<p className="text-xs text-[#F0EBE1]/70 mb-2">🕐 {selectedCenter.operatingHours}</p>
								)}

								<hr className="border-white/10 mb-2" />

								{/* Available donations count */}
								<p className="text-sm font-bold flex items-center gap-2 mb-2">
									<span className="w-2 h-2 rounded-full bg-[#7DC542] animate-pulse"></span>
									{selectedCenter.availableDonations} Donations Available
								</p>

								{/* Food items list */}
								{selectedCenter.publishedDonations.length > 0 && (
									<ul className="text-xs text-[#F0EBE1]/80 space-y-1">
										{selectedCenter.publishedDonations.map((item) => (
											<li key={item.donationId} className="flex justify-between gap-4">
												<span>{item.foodType}</span>
												<span className="text-[#7DC542] font-bold">
													{item.quantity} {item.unit}
												</span>
											</li>
										))}
									</ul>
								)}
							</div>
						</InfoWindow>
					)}
				</GoogleMap>
			</div>

			<div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
				<div className="p-6 rounded-2xl bg-white/5 border border-white/10">
					<p className="text-3xl font-black text-[#7DC542] mb-1">{centers.length}</p>
					<p className="text-xs font-bold uppercase tracking-widest text-[#F0EBE1]/40">Active Centers</p>
				</div>
				<div className="p-6 rounded-2xl bg-white/5 border border-white/10">
					<p className="text-3xl font-black text-[#7DC542] mb-1">
						{centers.reduce((acc, curr) => acc + (curr.availableDonations ?? 0), 0)}
					</p>
					<p className="text-xs font-bold uppercase tracking-widest text-[#F0EBE1]/40">Meals Ready</p>
				</div>
			</div>
		</section>
	);
}
