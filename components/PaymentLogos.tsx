"use client";

import { useEffect, useState } from "react";

type PaymentLogo = { slot: string; name: string; url: string };

const PaymentLogos = () => {
  const [logos, setLogos] = useState<PaymentLogo[]>([]);

  useEffect(() => {
    fetch("/api/payment-logo?format=json", { cache: "no-store" })
      .then((response) => response.json())
      .then(setLogos)
      .catch(() => setLogos([]));
  }, []);

  return (
    <div className="flex flex-wrap gap-x-2">
      {logos.map((logo) => (
        <span key={logo.slot} className="flex h-[50px] w-[50px] items-center justify-center overflow-hidden">
          <img
            src={logo.url}
            width="50"
            height="50"
            alt={`${logo.name} card icon`}
            className="h-full w-full object-contain"
          />
        </span>
      ))}
    </div>
  );
};

export default PaymentLogos;
