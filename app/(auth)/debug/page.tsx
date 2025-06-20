import { Suspense } from "react";
import DebugClient from "./DebugClient";

export default function DebugPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading debug info...</div>}>
      <DebugClient />
    </Suspense>
  );
}