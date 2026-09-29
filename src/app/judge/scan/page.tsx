"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";

export default function JudgeScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [message, setMessage] = useState("Scan the program QR code");

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          setMessage("QR detected...");

          try {
            await scanner.stop();

            if (decodedText.startsWith("/judge/program/")) {
              router.push(decodedText);
              return;
            }

            if (decodedText.includes("/judge/program/")) {
              const url = new URL(decodedText);
              router.push(url.pathname);
              return;
            }

            setMessage("Invalid KALARGE program QR code.");
          } catch (error) {
            console.error(error);
            setMessage("Unable to open this QR code.");
          }
        },
        () => {}
      )
      .catch((error) => {
        console.error(error);
        setMessage("Camera permission is required.");
      });

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">
          KALARGE 2K26
        </h1>

        <h2 className="text-lg font-semibold mb-6">
          Judge QR Scanner
        </h2>

        <div
          id="qr-reader"
          className="overflow-hidden rounded-2xl bg-white"
        />

        <p className="text-center text-slate-300 mt-5">
          {message}
        </p>

        <button
          onClick={() => router.push("/judge")}
          className="w-full mt-6 rounded-xl bg-slate-800 px-4 py-3 font-semibold"
        >
          Back to Judge Panel
        </button>
      </div>
    </main>
  );
}