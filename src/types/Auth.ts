export type AccountType = "donator" | "distributing_center";

export interface LoginFormData {
	email: string;
	password: string;
}

export interface RegisterFormData {
	accountType: AccountType;
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
	phone: string;
	address: string;
}
