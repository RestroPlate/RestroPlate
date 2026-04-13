import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState, useMemo } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { getPublicCentersWithDonations, type PublicCenterDonationInfo } from "../services/publicService";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "600px",
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
	const [isFullscreen, setIsFullscreen] = useState(false);

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

  const totalMeals = centers.reduce((acc, curr) => acc + (curr.availableDonations ?? 0), 0);

  const MapContent = () => (
    <GoogleMap
      mapContainerStyle={isFullscreen ? { width: "100%", height: "100%" } : MAP_CONTAINER_STYLE}
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
          <div style={{ padding: "12px", backgroundColor: "#0F1D0C", color: "#F0EBE1", minWidth: "220px", fontFamily: "sans-serif" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "900", marginBottom: "8px", color: "#F0EBE1" }}>
              {selectedCenter.centerName}
            </h3>
            <p style={{ fontSize: "12px", color: "rgba(240,235,225,0.65)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#7DC542", fontWeight: "bold" }}>Location</span>
              {selectedCenter.address}
            </p>
            {selectedCenter.phoneNumber && (
              <p style={{ fontSize: "12px", color: "rgba(240,235,225,0.65)", marginBottom: "4px" }}>
                <span style={{ color: "#7DC542", fontWeight: "bold" }}>Phone </span>
                {selectedCenter.phoneNumber}
              </p>
            )}
            {selectedCenter.operatingHours && (
              <p style={{ fontSize: "12px", color: "rgba(240,235,225,0.65)", marginBottom: "8px" }}>
                <span style={{ color: "#7DC542", fontWeight: "bold" }}>Hours </span>
                {selectedCenter.operatingHours}
              </p>
            )}
            <hr style={{ borderColor: "rgba(255,255,255,0.1)", marginBottom: "8px" }} />
            <p style={{ fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#7DC542", display: "inline-block" }} />
              {selectedCenter.availableDonations} Donations Available
            </p>
            {selectedCenter.publishedDonations.length > 0 && (
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {selectedCenter.publishedDonations.map((item) => (
                  <li key={item.donationId} style={{ fontSize: "12px", color: "rgba(240,235,225,0.8)", display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "4px" }}>
                    <span>{item.foodType}</span>
                    <span style={{ color: "#7DC542", fontWeight: "bold" }}>{item.quantity} {item.unit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );

  if (!isLoaded || loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-[#0B1A08] border-y border-white/10">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#7DC542]/30 border-t-[#7DC542] rounded-full animate-spin mx-auto" />
          <p className="text-[#F0EBE1]/60 font-bold uppercase tracking-widest text-sm">Loading Live Map...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Fullscreen overlay ── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 bg-[#0B1A08] border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7DC542] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#7DC542]" />
              </span>
              <span className="text-sm font-bold text-[#F0EBE1] uppercase tracking-widest">Live Network Map</span>
              <span className="text-xs text-[#F0EBE1]/40">{centers.length} active centers · {totalMeals} meals available</span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 text-[#F0EBE1]/60 hover:text-[#F0EBE1] transition-colors text-sm font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25"
            >
              <Minimize2 size={15} />
              Exit Full Screen
            </button>
          </div>
          <div className="flex-1">
            <MapContent />
          </div>
        </div>
      )}

      {/* ── Normal section ── */}
      <section id="map-section" className="relative w-full py-20 bg-[#0B1A08]">

        {/* Section header */}
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7DC542]/10 border border-[#7DC542]/20 mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7DC542] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7DC542]" />
                </span>
                <span className="text-[#7DC542] text-xs font-black uppercase tracking-widest">Live Network</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-[#F0EBE1] mb-4">
                Find Food <span className="text-[#7DC542]">Near You</span>
              </h2>
              <p className="text-lg text-[#F0EBE1]/55 max-w-xl">
                Every pin is an active distribution center with food available right now. Click any marker to see what is ready for pickup.
              </p>
            </div>

            {/* Summary highlight cards */}
            <div className="flex gap-4 flex-shrink-0">
              <div className="rounded-2xl border border-[#7DC542]/30 bg-[#7DC542]/8 px-6 py-5 text-center min-w-[130px] shadow-[0_0_40px_rgba(125,197,66,0.08)]">
                <p className="text-[2.4rem] font-black text-[#7DC542] leading-none mb-1">{centers.length}</p>
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#F0EBE1]/55">Active Centers</p>
              </div>
              <div className="rounded-2xl border border-[#7DC542]/30 bg-[#7DC542]/8 px-6 py-5 text-center min-w-[130px] shadow-[0_0_40px_rgba(125,197,66,0.08)]">
                <p className="text-[2.4rem] font-black text-[#7DC542] leading-none mb-1">{totalMeals}</p>
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#F0EBE1]/55">Meals Ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map container */}
        <div className="relative w-full overflow-hidden border-y border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          {/* Fullscreen button overlay */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B1A08]/90 backdrop-blur-sm border border-white/15 text-[#F0EBE1]/70 hover:text-[#7DC542] hover:border-[#7DC542]/40 transition-all duration-200 text-xs font-bold uppercase tracking-wider shadow-lg"
          >
            <Maximize2 size={14} />
            Full Screen
          </button>

          <MapContent />
        </div>

        {/* Bottom note */}
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <p className="text-xs text-[#F0EBE1]/25 text-center">
            Map refreshes automatically every 60 seconds · Click any marker to view available donations
          </p>
        </div>
      </section>
    </>
  );
}
