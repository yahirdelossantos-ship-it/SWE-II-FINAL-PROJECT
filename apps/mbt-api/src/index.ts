import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./env";
import { errorHandler } from "./middleware/error";

import apiV2Router from "./routes/v2/index";

const app: Express = express();
const PORT = env.PORT || 3001;

app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				"script-src": [
					"'self'",
					"'unsafe-inline'",
					"cdnjs.cloudflare.com",
				],
				"img-src": ["'self'", "data:", "https:", "ws:"],
			},
		},
	}),
);

// Logging middleware
app.use(morgan("combined"));

const corsOrigins = env.CORS_ORIGINS.split(",").map((origin) => origin.trim());
app.use(
	cors({
		origin: corsOrigins,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"User-Agent",
			"X-MBT-Website-Key",
		],
		credentials: true,
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v2", apiV2Router);

app.get("/", (_req, res) => {
	res.redirect("/api/v2");
});

app.use((_req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`🚀 Server listening on port ${PORT} in ${env.NODE_ENV} mode`);
	console.log(`📍 API available at http://localhost:${PORT}/api/v2`);
	console.log(`🌍 CORS enabled for: ${corsOrigins.join(", ")}`);
});

export default app;
