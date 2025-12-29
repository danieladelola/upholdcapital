import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) {
    redirect("/admin/login");
  }
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    redirect("/admin/login");
  }
}