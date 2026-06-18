import { requireAuth } from "@/modules/auth/utils/auth-utils";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AuthCheck() {
  await requireAuth();
  return redirect("/dashboard");
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <AuthCheck />
    </Suspense>
  );
}