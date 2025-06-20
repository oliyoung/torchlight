import { Suspense } from "react";
import AuthCallbackClient from "./AuthCallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Completing sign in...</div>}>
      <AuthCallbackClient />
    </Suspense>
  );
}