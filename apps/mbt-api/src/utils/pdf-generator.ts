import { spawn } from "child_process";
import path from "path";
import fsSync from "fs";
import fs from "fs/promises";

export interface PDFGeneratorInput {
	name: string;
	hotel: string;
	pax: number;
	time: string;
	date: string;
	company: "at" | "st" | "mbt";
	service_type: "arrivals" | "departures";
	flight_code?: string;
}

export interface PDFGeneratorResult {
	success: boolean;
	message: string;
	path?: string;
	buffer?: Buffer;
}

function resolvePdfServicePaths(): {
	pdfServiceDir: string;
	pythonScript: string;
	pythonExecutable: string;
	pythonPackagesDir: string;
} {
	const envServiceDir = process.env.PDF_SERVICE_DIR;
	const envPythonExecutable = process.env.PDF_PYTHON_EXECUTABLE;

	const candidateDirs = [
		envServiceDir,
		path.join(__dirname, "..", "pdf-service"),
		path.join(__dirname, "..", "..", "src", "pdf-service"),
		path.join(process.cwd(), "src", "pdf-service"),
		path.join(process.cwd(), "pdf-service"),
	].filter((value): value is string => Boolean(value));

	let pdfServiceDir: string | null = null;
	for (const dir of candidateDirs) {
		const scriptPath = path.join(dir, "generator.py");
		if (fsSync.existsSync(scriptPath)) {
			pdfServiceDir = dir;
			break;
		}
	}

	if (!pdfServiceDir) {
		throw new Error(
			`Could not find pdf-service/generator.py. Checked: ${candidateDirs.join(", ")}`,
		);
	}

	const pythonScript = path.join(pdfServiceDir, "generator.py");
	const venvPython = path.join(pdfServiceDir, "venv", "bin", "python3");
	const venvWindowsPython = path.join(
		pdfServiceDir,
		"venv",
		"Scripts",
		"python.exe",
	);
	const pythonExecutable =
		envPythonExecutable ||
		(fsSync.existsSync(venvPython)
			? venvPython
			: fsSync.existsSync(venvWindowsPython)
				? venvWindowsPython
				: "python3");
	const pythonPackagesDir = path.join(pdfServiceDir, "python-packages");

	return {
		pdfServiceDir,
		pythonScript,
		pythonExecutable,
		pythonPackagesDir,
	};
}

/**
 * Generate a PDF voucher using the Python WeasyPrint service
 *
 * @param data - The service data for generating the PDF
 * @param returnBuffer - If true, returns PDF as Buffer; if false, returns file path
 * @returns Promise with generation result
 */
export async function generatePDF(
	data: PDFGeneratorInput,
	returnBuffer: boolean = true,
): Promise<PDFGeneratorResult> {
	return new Promise((resolve, reject) => {
		let resolvedPaths: ReturnType<typeof resolvePdfServicePaths>;
		try {
			resolvedPaths = resolvePdfServicePaths();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : String(error);
			return resolve({
				success: false,
				message,
			});
		}

		// Spawn Python process
		const extraPythonPath = fsSync.existsSync(
			resolvedPaths.pythonPackagesDir,
		)
			? resolvedPaths.pythonPackagesDir
			: "";
		const pythonPath = extraPythonPath
			? `${extraPythonPath}${process.env.PYTHONPATH ? `:${process.env.PYTHONPATH}` : ""}`
			: process.env.PYTHONPATH;

		const pythonProcess = spawn(
			resolvedPaths.pythonExecutable,
			[resolvedPaths.pythonScript],
			{
				cwd: resolvedPaths.pdfServiceDir,
				env: {
					...process.env,
					...(pythonPath ? { PYTHONPATH: pythonPath } : {}),
				},
			},
		);

		let stdout = "";
		let stderr = "";

		// Send JSON data to Python script via stdin
		pythonProcess.stdin.write(JSON.stringify(data));
		pythonProcess.stdin.end();

		// Capture stdout
		pythonProcess.stdout.on("data", (data) => {
			stdout += data.toString();
		});

		// Capture stderr
		pythonProcess.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		// Handle process completion
		pythonProcess.on("close", async (code) => {
			if (code !== 0) {
				console.error("PDF generation failed:", stderr);
				return resolve({
					success: false,
					message: `Python process exited with code ${code}: ${stderr}`,
				});
			}

			try {
				// Parse JSON output from Python
				const result = JSON.parse(stdout.trim());

				if (!result.success) {
					return resolve(result);
				}

				// If returnBuffer is true, read the file and return as buffer
				if (returnBuffer && result.path) {
					try {
						const buffer = await fs.readFile(result.path);

						// Optionally delete the file after reading
						await fs.unlink(result.path).catch(() => {
							console.warn(
								"Could not delete temporary PDF file:",
								result.path,
							);
						});

						return resolve({
							success: true,
							message: result.message,
							buffer,
						});
					} catch (error) {
						return resolve({
							success: false,
							message: `Failed to read generated PDF: ${error}`,
						});
					}
				}

				// Return file path
				return resolve(result);
			} catch (error) {
				console.error("Failed to parse Python output:", stdout);
				return resolve({
					success: false,
					message: `Failed to parse Python output: ${error}`,
				});
			}
		});

		// Handle process errors
		pythonProcess.on("error", (error) => {
			console.error("Failed to start Python process:", error);
			resolve({
				success: false,
				message: `Failed to start Python process: ${error.message}`,
			});
		});
	});
}

/**
 * Check if Python and required dependencies are installed
 * @returns Promise<boolean>
 */
export async function checkPythonEnvironment(): Promise<{
	available: boolean;
	message: string;
}> {
	return new Promise((resolve) => {
		let resolvedPaths: ReturnType<typeof resolvePdfServicePaths>;
		try {
			resolvedPaths = resolvePdfServicePaths();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : String(error);
			resolve({
				available: false,
				message,
			});
			return;
		}

		const extraPythonPath = fsSync.existsSync(
			resolvedPaths.pythonPackagesDir,
		)
			? resolvedPaths.pythonPackagesDir
			: "";
		const pythonPath = extraPythonPath
			? `${extraPythonPath}${process.env.PYTHONPATH ? `:${process.env.PYTHONPATH}` : ""}`
			: process.env.PYTHONPATH;

		const pythonProcess = spawn(
			resolvedPaths.pythonExecutable,
			["-c", 'import weasyprint; print("OK")'],
			{
				cwd: resolvedPaths.pdfServiceDir,
				env: {
					...process.env,
					...(pythonPath ? { PYTHONPATH: pythonPath } : {}),
				},
			},
		);

		let output = "";
		pythonProcess.stdout.on("data", (data) => {
			output += data.toString();
		});

		pythonProcess.on("close", (code) => {
			if (code === 0 && output.includes("OK")) {
				resolve({
					available: true,
					message: "Python environment is ready",
				});
			} else {
				resolve({
					available: false,
					message: `Python or WeasyPrint not installed. Run: ${resolvedPaths.pythonExecutable} -m pip install -r ${path.join(resolvedPaths.pdfServiceDir, "requirements.txt")}`,
				});
			}
		});

		pythonProcess.on("error", () => {
			resolve({
				available: false,
				message: "Python3 not found. Please install Python 3.x",
			});
		});
	});
}
