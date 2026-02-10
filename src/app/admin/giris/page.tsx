import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import GirisForm from "./GirisForm";

export default async function GirisPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (session && (role === "ADMIN" || role === "AUTHOR")) {
    redirect("/admin");
  }

  return <GirisForm />;
}
