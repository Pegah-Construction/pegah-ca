"use client";

import { useState } from "react";

/**
 * "Bids managed via SmartBid" banner shown above the public tender list.
 * Shows /smartbid.png if present; falls back to a clean wordmark otherwise.
 */
export default function SmartbidBanner() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="mb-8 flex flex-col items-center gap-3 rounded-xl border border-concrete-200 bg-white px-6 py-6 text-center">
      <p className="font-mono text-[11px] uppercase tracking-label text-concrete-500">Bids managed via</p>
      {failed ? (
        <span className="font-display text-2xl font-black tracking-tight text-ink">
          SMART<span className="text-brand-600">BID</span>
          <span className="ml-2 align-middle font-mono text-[11px] font-normal uppercase tracking-label text-concrete-400">
            by ConstructConnect
          </span>
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/smartbid.png"
          alt="SmartBid by ConstructConnect"
          onError={() => setFailed(true)}
          className="h-12 w-auto max-w-[240px] object-contain"
        />
      )}
    </div>
  );
}
