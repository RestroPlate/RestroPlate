import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import LocationPicker from "react-location-picker";
import type {
	AccountType,
	LoginFormData,
	RegisterFormData,
} from "../types/Auth";
import { login, register, logout } from "../services/authService";
import donationScene from "../assets/auth_donation_scene.png";
import { Utensils } from "lucide-react";

type AuthMode = "login" | "register";
type RegisterStep = "selectType" | "form";

const ACCOUNT_TYPES: {
	type: AccountType;
	icon: React.ReactNode;
	title: string;
	description: string;
}[] = [
		{
			type: "DONOR",
			icon: (
				<Utensils 
					size={40} 
					strokeWidth={1.8} 
					className="text-[#7DC542] transition-all duration-300 hover:scale-[1.15] hover:drop-shadow-[0_0_8px_rgba(125,197,66,0.5)]" 
				/>
			),
			title: "Donator",
			description: "Restaurants or individuals with surplus food to donate.",
		},
		{
			type: "DISTRIBUTION_CENTER",
			icon: (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-10 h-10 text-[#7DC542]">
					<path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21V11h6v10"/>
				</svg>
			),
			title: "Distributing Center",
			description:
				"Organizations that receive and distribute food to those in need.",
		},
	];

const INITIAL_LOGIN: LoginFormData = { email: "", password: "" };
const INITIAL_REGISTER: RegisterFormData = {
	accountType: "DONOR",
	fullName: "",
	email: "",
	password: "",
	confirmPassword: "",
	phone: "",
	address: "",
};

export default function Auth() {
	const navigate = useNavigate();

	const [mode, setMode] = useState<AuthMode>("login");
	const [registerStep, setRegisterStep] = useState<RegisterStep>("selectType");
	const [selectedType, setSelectedType] = useState<AccountType | null>(null);

	const [loginData, setLoginData] = useState<LoginFormData>(INITIAL_LOGIN);
	const [registerData, setRegisterData] =
		useState<RegisterFormData>(INITIAL_REGISTER);
	const [mapCenter, setMapCenter] = useState({ lat: 6.927079, lng: 79.861244 });
	const [loginError, setLoginError] = useState<string | null>(null);
	const [loginLoading, setLoginLoading] = useState(false);
	const [registerError, setRegisterError] = useState<string | null>(null);
	const [registerLoading, setRegisterLoading] = useState(false);
	const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(
		null,
	);

	const switchMode = (next: AuthMode) => {
		setMode(next);
		setRegistrationSuccess(null);
		setRegisterStep("selectType");
		setSelectedType(null);
		setLoginData(INITIAL_LOGIN);
		setRegisterData(INITIAL_REGISTER);
	};

	const handleSelectType = (type: AccountType) => {
		setSelectedType(type);
		setRegisterData((prev) => ({ ...prev, accountType: type }));
		setRegisterStep("form");
	};

	const handleLocationChange = useCallback(({ position, address }: { position: { lat: number; lng: number }; address: string }) => {
		const locString = address || `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
		setRegisterData((prev) => ({ ...prev, address: locString }));
	}, []);

	const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setLoginData((prev) => ({ ...prev, [name]: value }));
	};

	const handleRegisterChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setRegisterData((prev) => ({ ...prev, [name]: value }));
	};

	const handleLoginSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoginError(null);
		setLoginLoading(true);
		try {
			const user = await login(loginData.email, loginData.password);
			const dashboardPath =
				user.role === "DONOR" ? "/dashboard/donor" : "/dashboard/center";
			navigate(dashboardPath);
		} catch (err) {
			setLoginError(
				err instanceof Error ? err.message : "Login failed. Please try again.",
			);
		} finally {
			setLoginLoading(false);
		}
	};

	const handleRegisterSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (registerData.password !== registerData.confirmPassword) {
			setRegisterError("Passwords do not match.");
			return;
		}
		setRegisterError(null);
		setRegisterLoading(true);
		try {
			await register(registerData);

			// Clear the auto-saved session to force manual login
			logout();

			// Switch to login mode
			setMode("login");
			setRegistrationSuccess("Account created successfully! Please log in.");

			// Pre-fill login email with the newly registered one
			setLoginData((prev) => ({ ...prev, email: registerData.email }));
		} catch (err) {
			setRegisterError(
				err instanceof Error
					? err.message
					: "Registration failed. Please try again.",
			);
		} finally {
			setRegisterLoading(false);
		}
	};

	return (
		<>
			{/* Back to home */}
			<button
				type="button"
				onClick={() => navigate("/")}
				className="fixed top-5 left-5 z-50 flex items-center gap-2 text-[0.875rem] font-semibold cursor-pointer bg-transparent border-none text-[rgba(240,235,225,0.55)] transition-colors duration-200 hover:text-[#7DC542]"
			>
				<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
					<path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
				</svg>
				Home
			</button>

			<div className="flex h-[100dvh] w-screen overflow-hidden bg-[#0B1A08] box-border">
				{/* LEFT: Image panel */}
				<div className="hidden md:block md:w-1/2 h-full flex-shrink-0 relative">
					<img
						src={donationScene}
						alt="Food donation event"
						className="absolute inset-0 w-full h-full object-cover object-center"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-[#0B1A08]/60 to-transparent pointer-events-none" />
				</div>

				{/* RIGHT: Auth panel */}
				<div className="w-full md:w-1/2 h-full flex flex-col items-center overflow-y-auto bg-[#0B1A08] px-4 py-8">
					<div
						className="w-full max-w-[460px] rounded-2xl my-auto flex-shrink-0 p-6 sm:p-8"
						style={{
							background: "rgba(255,255,255,0.03)",
							border: "1px solid rgba(125,197,66,0.15)",
						}}
					>
						{/* Logo */}
					<div className="text-center mb-8 text-[#7DC542] text-[1.5rem] font-bold">
						🍃 RestroPlate
						</div>

						{/* Tabs */}
						<div className="flex mb-8">
							<button
								type="button"
								className={`tab-btn${mode === "login" ? " active" : ""}`}
								onClick={() => switchMode("login")}
							>
								LOGIN
							</button>
							<button
								type="button"
								className={`tab-btn${mode === "register" ? " active" : ""}`}
								onClick={() => switchMode("register")}
							>
								REGISTER
							</button>
						</div>

						{/* ── LOGIN FORM ── */}
						{mode === "login" && (
							<div className="flex flex-col gap-4">
								{registrationSuccess && (
									<div
										className="rounded-lg px-[14px] py-2.5 text-[0.82rem] text-[#7DC542] mb-2 text-center"
										style={{
											background: "rgba(125,197,66,0.1)",
											border: "1px solid rgba(125,197,66,0.3)",
										}}
									>
										{registrationSuccess}
									</div>
								)}
								<form
									onSubmit={handleLoginSubmit}
									className="flex flex-col gap-3.5"
								>
									<div className="flex flex-col gap-1">
										<label className="text-[rgba(240,235,225,0.65)] text-[0.8rem] font-semibold">
											EMAIL ADDRESS
										</label>
										<input
											className="auth-input"
											type="email"
											name="email"
											placeholder="you@example.com"
											value={loginData.email}
											onChange={handleLoginChange}
											required
											autoComplete="email"
										/>
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-[rgba(240,235,225,0.65)] text-[0.8rem] font-semibold">
											PASSWORD
										</label>
										<input
											className="auth-input"
											type="password"
											name="password"
											placeholder="••••••••"
											value={loginData.password}
											onChange={handleLoginChange}
											required
											autoComplete="current-password"
										/>
									</div>
									{loginError && (
										<div
											className="rounded-lg px-[14px] py-2.5 text-[0.82rem] text-[#ff6b6b]"
											style={{
												background: "rgba(255,80,80,0.1)",
												border: "1px solid rgba(255,80,80,0.3)",
											}}
										>
											{loginError}
										</div>
									)}
									<button
										type="submit"
										className="auth-submit mt-2"
										disabled={loginLoading}
									>
										{loginLoading ? "LOGGING IN..." : "LOG IN"}
									</button>
								</form>
							</div>
						)}

						{/* ── REGISTER — STEP 1: Select Account Type ── */}
						{mode === "register" && registerStep === "selectType" && (
							<div className="flex flex-col gap-5">
								<p className="text-[rgba(240,235,225,0.65)] text-[0.9rem] text-center">
									Choose how you'd like to join:
								</p>
								<div className="flex flex-col sm:flex-row gap-4">
									{ACCOUNT_TYPES.map(({ type, icon, title, description }) => (
										<button
											key={type}
											type="button"
											className="type-card"
											onClick={() => handleSelectType(type)}
										>
											<span className="text-[2.2rem]">{icon}</span>
											<span className="text-[#F0EBE1] font-bold text-base">
												{title}
											</span>
											<span className="text-[rgba(240,235,225,0.55)] text-[0.82rem] leading-[1.5]">
												{description}
											</span>
										</button>
									))}
								</div>
							</div>
						)}

						{/* ── REGISTER — STEP 2: Fill Form ── */}
						{mode === "register" && registerStep === "form" && (
							<form
								onSubmit={handleRegisterSubmit}
								className="flex flex-col gap-3.5"
							>
								{/* Account type badge */}
								<div className="flex items-center justify-between mb-1">
									<span className="text-[0.8rem] font-bold text-[#7DC542] bg-[rgba(125,197,66,0.12)] px-2.5 py-1 rounded-[20px] flex items-center gap-1.5">
										{selectedType === "DONOR" ? (
											<>
												<Utensils size={16} strokeWidth={1.8} className="w-4 h-4" />
												Donator
											</>
										) : (
											<>
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
													<path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21V11h6v10"/>
												</svg>
												Distributing Center
											</>
										)}
									</span>
									<button
										type="button"
										className="bg-none border-none text-[rgba(240,235,225,0.45)] text-[0.8rem] cursor-pointer underline"
										onClick={() => {
											setRegisterStep("selectType");
											setSelectedType(null);
										}}
									>
										Change
									</button>
								</div>

								{[
									{
										label: "FULL NAME / USERNAME",
										name: "fullName",
										type: "text",
										placeholder: "Your name or organisation",
										autoComplete: "name",
									},
									{
										label: "EMAIL ADDRESS",
										name: "email",
										type: "email",
										placeholder: "you@example.com",
										autoComplete: "email",
									},
									{
										label: "PASSWORD",
										name: "password",
										type: "password",
										placeholder: "••••••••",
										autoComplete: "new-password",
									},
									{
										label: "RE-ENTER PASSWORD",
										name: "confirmPassword",
										type: "password",
										placeholder: "••••••••",
										autoComplete: "new-password",
									},
									{
										label: "PHONE NUMBER",
										name: "phone",
										type: "tel",
										placeholder: "+1 234 567 890",
										autoComplete: "tel",
									},
									{
										label: "ADDRESS",
										name: "address",
										type: "text",
										placeholder: "Street, City, Country",
										autoComplete: "street-address",
									},
								].map(({ label, name, type, placeholder, autoComplete }) => (
									<div key={name} className="flex flex-col gap-1">
										<label className="text-[rgba(240,235,225,0.65)] text-[0.8rem] font-semibold">
											{label}
										</label>
										{name === "address" ? (
											<div className="space-y-2">
												<input
													type="text"
													placeholder="Manual Lat, Lng (e.g. 6.9271, 79.8612)"
													className="auth-input w-full text-xs"
													value={registerData.address}
													onChange={(e) => {
														const val = e.target.value;
														setRegisterData((prev) => ({ ...prev, address: val }));
														const parts = val.split(",").map((p) => p.trim());
														if (parts.length === 2) {
															const lat = parseFloat(parts[0]);
															const lng = parseFloat(parts[1]);
															if (!isNaN(lat) && !isNaN(lng)) {
																setMapCenter({ lat, lng });
															}
														}
													}}
												/>
												<div className="rounded-xl overflow-hidden border border-white/10 bg-[#111F0F] flex-shrink-0">
													<LocationPicker
														defaultPosition={mapCenter}
														onChange={handleLocationChange}
														mapContainerStyle={{ height: '150px', width: '100%' }}
													/>
													<div className="p-2 text-xs text-[#F0EBE1] break-all">
														<span className="opacity-50">Selected: </span>
														{registerData.address || "None"}
													</div>
												</div>
											</div>
										) : (
											<input
												className="auth-input"
												type={type}
												name={name}
												placeholder={placeholder}
												value={registerData[name as keyof RegisterFormData]}
												onChange={handleRegisterChange}
												required
												autoComplete={autoComplete}
											/>
										)}
									</div>
								))}

								{registerError && (
									<div
										className="rounded-lg px-[14px] py-2.5 text-[0.82rem] text-[#ff6b6b]"
										style={{
											background: "rgba(255,80,80,0.1)",
											border: "1px solid rgba(255,80,80,0.3)",
										}}
									>
										{registerError}
									</div>
								)}
								<button
									type="submit"
									className="auth-submit mt-2"
									disabled={registerLoading}
								>
									{registerLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
								</button>
							</form>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
