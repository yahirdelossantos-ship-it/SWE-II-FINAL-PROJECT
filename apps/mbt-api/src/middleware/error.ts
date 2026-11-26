import { ZodError } from "zod";

export const errorHandler = (err: any, _req: any, res: any, _next: any) => {
	if (err instanceof ZodError) {
		return res.status(400).json({
			success: false,
			message: "Validation error",
			errors: err.issues,
		});
	}
	console.error(err);
	res.status(500).json({
		success: false,
		message: "Internal server error",
		error: "InternalError",
	});
};
