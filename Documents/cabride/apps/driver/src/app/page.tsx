"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("driver_token");
    router.replace(token ? "/dashboard" : "/auth");
  }, [router]);
  return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <span className="spinner" />
    </div>
  );
}
