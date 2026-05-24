"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("cabride_token");
    router.replace(token ? "/dashboard" : "/auth");
  }, [router]);
  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
