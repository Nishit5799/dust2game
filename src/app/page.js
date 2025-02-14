import { Suspense } from "react";
import Experience from "@/components/Experience";
import Loading from "./loading";

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="h-screen w-full bg-black fixed">
        <Experience />

        {/* PC Controls (Hidden on Small Screens) */}
        <div className="fixed top-0 left-0 bg-white text-black p-2 z-50 rounded-sm pointer-events-none hidden md:block">
          MOVE: W A S D <br />
          RUN: SHIFT + MOVE <br />
          JUMP: SPACE <br />
        </div>

        {/* Mobile Controls (Hidden on Medium+ Screens) */}
        <div className="fixed top-0 left-0 bg-white text-black p-2 z-50 rounded-sm pointer-events-none block md:hidden">
          USE ONE FINGER <br /> MOVE: TOUCH <br />
          JUMP: TAP
        </div>
      </div>
    </Suspense>
  );
}
