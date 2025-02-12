"use client";
import { Suspense, useState, useEffect } from "react";
import Experience from "@/components/Experience";
import Loading from "./loading";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate async loading completion
    const timeout = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      {isLoaded && (
        <div className="h-screen w-full bg-black fixed">
          <Experience />

          {/* PC Controls (Hidden on Small Screens) */}
          <div className="fixed top-0 left-0 bg-white text-black p-2 z-50 rounded-sm pointer-events-none hidden md:block">
            MOVE: W A S D <br />
            JUMP: SPACE <br />
          </div>

          {/* Mobile Controls (Hidden on Medium+ Screens) */}
          <div className="fixed top-0 left-0 bg-white text-black p-2 z-50 rounded-sm pointer-events-none block md:hidden">
            MOVE: TOUCH <br />
            JUMP: DOUBLETAP
          </div>
        </div>
      )}
    </Suspense>
  );
}
