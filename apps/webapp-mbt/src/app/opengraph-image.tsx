import { ImageResponse } from "next/og";

export const size = {
	width: 1200,
	height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					alignItems: "stretch",
					background: "#092f3b",
					color: "white",
					display: "flex",
					height: "100%",
					justifyContent: "space-between",
					overflow: "hidden",
					position: "relative",
					width: "100%",
				}}
			>
				<div
					style={{
						background:
							"linear-gradient(135deg, #103f52 0%, #3278bc 54%, #29ac7e 100%)",
						borderRadius: "0 120px 120px 0",
						display: "flex",
						flexDirection: "column",
						height: "100%",
						justifyContent: "center",
						padding: "76px",
						width: "70%",
					}}
				>
					<div
						style={{
							fontSize: 26,
							fontWeight: 900,
							letterSpacing: 6,
							marginBottom: 28,
							textTransform: "uppercase",
						}}
					>
						MB Transfers
					</div>
					<div
						style={{
							fontSize: 76,
							fontWeight: 900,
							lineHeight: 0.98,
						}}
					>
						Private Airport Transfers
					</div>
					<div
						style={{
							fontSize: 34,
							fontWeight: 700,
							lineHeight: 1.25,
							marginTop: 30,
							maxWidth: 790,
						}}
					>
						Reliable transportation and tours across Punta Cana and
						Dominican Republic destinations.
					</div>
				</div>
				<div
					style={{
						alignItems: "center",
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						paddingRight: 70,
						width: "30%",
					}}
				>
					<div
						style={{
							alignItems: "center",
							background: "rgba(255,255,255,0.13)",
							border: "2px solid rgba(255,255,255,0.25)",
							borderRadius: 48,
							display: "flex",
							fontSize: 110,
							fontWeight: 900,
							height: 230,
							justifyContent: "center",
							width: 230,
						}}
					>
						MB
					</div>
					<div
						style={{
							color: "#29ac7e",
							fontSize: 28,
							fontWeight: 900,
							marginTop: 28,
						}}
					>
						mbtransferpuntacana.com
					</div>
				</div>
			</div>
		),
		size,
	);
}
