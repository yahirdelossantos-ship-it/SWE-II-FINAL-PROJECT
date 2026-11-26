import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/session";
export default async function Home() {
	redirect((await getCurrentEmployee()) ? "/app/itinerary/view" : "/login");
}
