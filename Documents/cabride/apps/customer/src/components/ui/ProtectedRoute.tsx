"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("cabride_token");
    if (!token) {
      router.replace("/auth");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-sm">4J</span>
        </div>
        <span className="spinner" />
      </div>
    </div>
  );

  return <>{children}</>;
}
