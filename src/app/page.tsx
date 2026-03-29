import { redirect } from "next/navigation";

import { getServerSessionUser } from "@/data/mock-backend";

export default async function HomePage() {
  const user = await getServerSessionUser();

  redirect(user ? "/dashboard" : "/login");
}
