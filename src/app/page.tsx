import { redirect } from "next/navigation";

import { getServerSessionUser } from "@/app/mock-backend";

export default async function HomePage() {
  const user = await getServerSessionUser();

  redirect(user ? "/dashboard" : "/login");
}
