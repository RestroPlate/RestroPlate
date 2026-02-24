import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AccountType, LoginFormData, RegisterFormData } from "../types/Auth";

type AuthMode = "login" | "register";
type RegisterStep = "selectType" | "form";

const ACCOUNT_TYPES: { type: AccountType; icon: string; title: string; description: string }[] = [
    {
        type: "donator",
        icon: "🍽️",
        title: "Donator",
        description: "Restaurants or individuals with surplus food to donate.",
    },
    {
        type: "distributing_center",
        icon: "🏢",
        title: "Distributing Center",
        description: "Organizations that receive and distribute food to those in need.",
    },
];

const INITIAL_LOGIN: LoginFormData = { email: "", password: "" };
const INITIAL_REGISTER: RegisterFormData = {
    accountType: "donator",
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
    const [registerData, setRegisterData] = useState<RegisterFormData>(INITIAL_REGISTER);

    // ── Mode switch reset ──────────────────────────────────────────────────
    const switchMode = (next: AuthMode) => {
        setMode(next);
        setRegisterStep("selectType");
        setSelectedType(null);
        setLoginData(INITIAL_LOGIN);
        setRegisterData(INITIAL_REGISTER);
    };

    // ── Account type selection ─────────────────────────────────────────────
    const handleSelectType = (type: AccountType) => {
        setSelectedType(type);
        setRegisterData((prev) => ({ ...prev, accountType: type }));
        setRegisterStep("form");
    };

    // ── Form change helpers ────────────────────────────────────────────────
    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRegisterData((prev) => ({ ...prev, [name]: value }));
    };

    // ── Submit stubs ───────────────────────────────────────────────────────
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: wire to authService
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: wire to authService
    };

    // ──────────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
				@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700;900&family=Nunito:wght@400;600;800&display=swap');

				*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

				html, body {
					background: #0B1A08;
					min-height: 100vh;
				}

				::-webkit-scrollbar { width: 6px; }
				::-webkit-scrollbar-track { background: #0B1A08; }
				::-webkit-scrollbar-thumb { background: #7DC542; border-radius: 3px; }

				.auth-input {
					width: 100%;
					background: rgba(255,255,255,0.04);
					border: 1px solid rgba(125,197,66,0.25);
					border-radius: 8px;
					padding: 12px 14px;
					color: #F0EBE1;
					font-family: 'Nunito', sans-serif;
					font-size: 0.92rem;
					outline: none;
					transition: border-color 0.2s ease;
				}

				.auth-input::placeholder { color: rgba(240,235,225,0.35); }
				.auth-input:focus { border-color: #7DC542; }

				.auth-submit {
					width: 100%;
					background: #7DC542;
					color: #0B1A08;
					border: none;
					border-radius: 8px;
					padding: 13px;
					font-family: 'Nunito', sans-serif;
					font-size: 0.92rem;
					font-weight: 800;
					letter-spacing: 0.08em;
					cursor: pointer;
					transition: transform 0.2s ease, box-shadow 0.2s ease;
				}

				.auth-submit:hover {
					transform: translateY(-2px);
					box-shadow: 0 8px 24px rgba(125,197,66,0.35);
				}

				.type-card {
					display: flex;
					flex-direction: column;
					align-items: center;
					text-align: center;
					gap: 12px;
					padding: 28px 20px;
					border: 1.5px solid rgba(125,197,66,0.2);
					border-radius: 12px;
					background: rgba(255,255,255,0.03);
					cursor: pointer;
					transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s ease;
					flex: 1;
				}

				.type-card:hover {
					border-color: #7DC542;
					background: rgba(125,197,66,0.07);
					transform: translateY(-3px);
				}

				.tab-btn {
					flex: 1;
					padding: 11px;
					background: none;
					border: none;
					border-bottom: 2px solid rgba(125,197,66,0.15);
					color: rgba(240,235,225,0.5);
					font-family: 'Nunito', sans-serif;
					font-size: 0.88rem;
					font-weight: 700;
					letter-spacing: 0.06em;
					cursor: pointer;
					transition: color 0.2s ease, border-color 0.2s ease;
				}

				.tab-btn.active {
					color: #7DC542;
					border-bottom-color: #7DC542;
				}
			`}</style>

            {/* Back to home */}
            <button
                type="button"
                onClick={() => navigate("/")}
                className="fixed top-5 left-5 z-50 flex items-center gap-2 text-sm font-semibold cursor-pointer bg-transparent border-none"
                style={{
                    color: "rgba(240,235,225,0.55)",
                    fontFamily: "'Nunito', sans-serif",
                    transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#7DC542"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,235,225,0.55)"; }}
            >
                ← Home
            </button>

            {/* Page wrapper */}
            <div
                className="min-h-screen flex items-center justify-center px-4 py-16"
                style={{ background: "#0B1A08" }}
            >
                {/* Card */}
                <div
                    className="w-full max-w-md"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(125,197,66,0.15)",
                        borderRadius: "16px",
                        padding: "40px 36px",
                    }}
                >
                    {/* Logo */}
                    <div
                        className="text-center mb-8"
                        style={{ fontFamily: "'Roboto', sans-serif", color: "#7DC542", fontSize: "1.5rem", fontWeight: 700 }}
                    >
                        🍃 RestroPlate
                    </div>

                    {/* Tabs */}
                    <div className="flex mb-8">
                        <button type="button" className={`tab-btn${mode === "login" ? " active" : ""}`} onClick={() => switchMode("login")}>
                            LOGIN
                        </button>
                        <button type="button" className={`tab-btn${mode === "register" ? " active" : ""}`} onClick={() => switchMode("register")}>
                            REGISTER
                        </button>
                    </div>

                    {/* ── LOGIN FORM ── */}
                    {mode === "login" && (
                        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label style={{ color: "rgba(240,235,225,0.65)", fontFamily: "'Nunito', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}>
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
                                <label style={{ color: "rgba(240,235,225,0.65)", fontFamily: "'Nunito', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}>
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
                            <button type="submit" className="auth-submit mt-2">
                                LOG IN
                            </button>
                        </form>
                    )}

                    {/* ── REGISTER — STEP 1: Select Account Type ── */}
                    {mode === "register" && registerStep === "selectType" && (
                        <div className="flex flex-col gap-6">
                            <p style={{ color: "rgba(240,235,225,0.65)", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem", textAlign: "center" }}>
                                Choose how you&apos;d like to join:
                            </p>
                            <div className="flex gap-4">
                                {ACCOUNT_TYPES.map(({ type, icon, title, description }) => (
                                    <button
                                        key={type}
                                        type="button"
                                        className="type-card"
                                        onClick={() => handleSelectType(type)}
                                    >
                                        <span style={{ fontSize: "2.2rem" }}>{icon}</span>
                                        <span style={{ color: "#F0EBE1", fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: "1rem" }}>
                                            {title}
                                        </span>
                                        <span style={{ color: "rgba(240,235,225,0.55)", fontFamily: "'Nunito', sans-serif", fontSize: "0.82rem", lineHeight: 1.5 }}>
                                            {description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── REGISTER — STEP 2: Fill Form ── */}
                    {mode === "register" && registerStep === "form" && (
                        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                            {/* Account type badge */}
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    style={{
                                        fontFamily: "'Nunito', sans-serif",
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        color: "#7DC542",
                                        background: "rgba(125,197,66,0.12)",
                                        padding: "4px 10px",
                                        borderRadius: "20px",
                                    }}
                                >
                                    {selectedType === "donator" ? "🍽️ Donator" : "🏢 Distributing Center"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => { setRegisterStep("selectType"); setSelectedType(null); }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "rgba(240,235,225,0.45)",
                                        fontFamily: "'Nunito', sans-serif",
                                        fontSize: "0.8rem",
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                    }}
                                >
                                    Change
                                </button>
                            </div>

                            {/* Full Name */}
                            <div className="flex flex-col gap-1">
                                <label style={{ color: "rgba(240,235,225,0.65)", fontFamily: "'Nunito', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}>
                                    FULL NAME / USERNAME
                                </label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    name="fullName"
                                    placeholder="Your name or organisation"
                                    value={registerData.fullName}
                                    onChange={handleRegisterChange}
                                    required
                                    autoComplete="name"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1">
                                <label style={{ color: "rgba(240,235,225,0.65)", fontFamily: "'Nunito', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}>
                                    EMAIL ADDRESS
                                </label>
                                <input
                                    className="auth-input"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1">
                                <label style={{ color: "rgba(240,235,225,0.65)", fontFamily: "'Nunito', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}>
                                    PASSWORD
                                </label>
                                <input
                                    className="auth-input"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-1">
                                <label style={{ color: "rgba(240,235,225,0.65)", fontFamily: "'Nunito', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}>
                                    RE-ENTER PASSWORD
                                </label>
                                <input
                                    className="auth-input"
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={registerData.confirmPassword}
                                    onChange={handleRegisterChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col gap-1">
                                <label style={{ color: "rgba(240,235,225,0.65)", fontFamily: "'Nunito', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}>
                                    PHONE NUMBER
                                </label>
                                <input
                                    className="auth-input"
                                    type="tel"
                                    name="phone"
                                    placeholder="+1 234 567 890"
                                    value={registerData.phone}
                                    onChange={handleRegisterChange}
                                    required
                                    autoComplete="tel"
                                />
                            </div>

                            {/* Address */}
                            <div className="flex flex-col gap-1">
                                <label style={{ color: "rgba(240,235,225,0.65)", fontFamily: "'Nunito', sans-serif", fontSize: "0.8rem", fontWeight: 600 }}>
                                    ADDRESS
                                </label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    name="address"
                                    placeholder="Street, City, Country"
                                    value={registerData.address}
                                    onChange={handleRegisterChange}
                                    required
                                    autoComplete="street-address"
                                />
                            </div>

                            <button type="submit" className="auth-submit mt-2">
                                CREATE ACCOUNT
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
