import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AccountType, LoginFormData, RegisterFormData } from "../types/Auth";
import { login, register } from "../services/authService";

type AuthMode = "login" | "register";
type RegisterStep = "selectType" | "form";

const ACCOUNT_TYPES: { type: AccountType; icon: string; title: string; description: string }[] = [
    {
        type: "DONOR",
        icon: "🍽️",
        title: "Donator",
        description: "Restaurants or individuals with surplus food to donate.",
    },
    {
        type: "DISTRIBUTION_CENTER",
        icon: "🏢",
        title: "Distributing Center",
        description: "Organizations that receive and distribute food to those in need.",
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
    const [registerData, setRegisterData] = useState<RegisterFormData>(INITIAL_REGISTER);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [loginLoading, setLoginLoading] = useState(false);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [registerLoading, setRegisterLoading] = useState(false);

    const switchMode = (next: AuthMode) => {
        setMode(next);
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

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRegisterData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        setLoginLoading(true);
        try {
            const user = await login(loginData.email, loginData.password);
            const dashboardPath = user.role === "DONOR" ? "/dashboard/donor" : "/dashboard/center";
            navigate(dashboardPath);
        } catch (err) {
            setLoginError(err instanceof Error ? err.message : "Login failed. Please try again.");
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
            const user = await register(registerData);
            const dashboardPath = user.role === "DONOR" ? "/dashboard/donor" : "/dashboard/center";
            navigate(dashboardPath);
        } catch (err) {
            setRegisterError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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
                ← Home
            </button>

            {/* Page wrapper */}
            <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#0B1A08]">
                {/* Card */}
                <div
                    className="w-full max-w-md rounded-2xl"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(125,197,66,0.15)",
                        padding: "40px 36px",
                    }}
                >
                    {/* Logo */}
                    <div className="text-center mb-8 text-[#7DC542] text-[1.5rem] font-bold">
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
                                <div className="rounded-lg px-[14px] py-2.5 text-[0.82rem] text-[#ff6b6b]"
                                    style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)" }}>
                                    {loginError}
                                </div>
                            )}
                            <button type="submit" className="auth-submit mt-2" disabled={loginLoading}>
                                {loginLoading ? "LOGGING IN..." : "LOG IN"}
                            </button>
                        </form>
                    )}

                    {/* ── REGISTER — STEP 1: Select Account Type ── */}
                    {mode === "register" && registerStep === "selectType" && (
                        <div className="flex flex-col gap-6">
                            <p className="text-[rgba(240,235,225,0.65)] text-[0.9rem] text-center">
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
                        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                            {/* Account type badge */}
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[0.8rem] font-bold text-[#7DC542] bg-[rgba(125,197,66,0.12)] px-2.5 py-1 rounded-[20px]">
                                    {selectedType === "DONOR" ? "🍽️ Donator" : "🏢 Distributing Center"}
                                </span>
                                <button
                                    type="button"
                                    className="bg-none border-none text-[rgba(240,235,225,0.45)] text-[0.8rem] cursor-pointer underline"
                                    onClick={() => { setRegisterStep("selectType"); setSelectedType(null); }}
                                >
                                    Change
                                </button>
                            </div>

                            {[
                                { label: "FULL NAME / USERNAME", name: "fullName", type: "text", placeholder: "Your name or organisation", autoComplete: "name" },
                                { label: "EMAIL ADDRESS", name: "email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
                                { label: "PASSWORD", name: "password", type: "password", placeholder: "••••••••", autoComplete: "new-password" },
                                { label: "RE-ENTER PASSWORD", name: "confirmPassword", type: "password", placeholder: "••••••••", autoComplete: "new-password" },
                                { label: "PHONE NUMBER", name: "phone", type: "tel", placeholder: "+1 234 567 890", autoComplete: "tel" },
                                { label: "ADDRESS", name: "address", type: "text", placeholder: "Street, City, Country", autoComplete: "street-address" },
                            ].map(({ label, name, type, placeholder, autoComplete }) => (
                                <div key={name} className="flex flex-col gap-1">
                                    <label className="text-[rgba(240,235,225,0.65)] text-[0.8rem] font-semibold">
                                        {label}
                                    </label>
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
                                </div>
                            ))}

                            {registerError && (
                                <div className="rounded-lg px-[14px] py-2.5 text-[0.82rem] text-[#ff6b6b]"
                                    style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)" }}>
                                    {registerError}
                                </div>
                            )}
                            <button type="submit" className="auth-submit mt-2" disabled={registerLoading}>
                                {registerLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
