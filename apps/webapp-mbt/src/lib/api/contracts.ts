export type Employee = {
	id: string;
	name: string;
	email: string | null;
	identification: string | null;
	role: string;
	state: string;
	photo: string | null;
	darkMode: boolean;
	minimized: boolean;
	background: string | null;
};

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = {
	success: false;
	error: { code: string; message: string; fields?: Record<string, string[]> };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
