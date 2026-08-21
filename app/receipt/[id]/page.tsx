"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/api";
import { formatDZD } from "@/lib/currency";

const ReceiptPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    apiClient.get(`/api/orders/${id}`).then(async (response) => {
      if (response.ok) setOrder(await response.json());
    });
  }, [id]);

  const downloadReceipt = () => {
    const receipt = document.getElementById("receipt");
    if (!receipt) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;
    const width = receipt.scrollWidth * 2;
    const height = receipt.scrollHeight * 2;
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${receipt.scrollWidth}" height="${receipt.scrollHeight}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${receipt.innerHTML}</div></foreignObject></svg>`;
    const image = new Image();
    image.onload = () => {
      context.drawImage(image, 0, 0, width, height);
      const link = document.createElement("a");
      link.download = `receipt-${order?.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  if (!order) return <main className="p-10 text-center">Loading receipt...</main>;
  const code = order.id.replace(/-/g, "").slice(0, 24);
  return (
    <main className="min-h-screen p-5 flex flex-col items-center">
      <div id="receipt" className="bg-white border border-gray-200 p-8 w-full max-w-lg text-black">
        <h1 className="text-3xl font-bold">Payment receipt</h1>
        <p className="mt-2">Order: {order.id}</p>
        <p className="mt-5 text-xl font-semibold">{order.paymentStatus === "paid" ? "PAID / مدفوع" : "NOT PAID / غير مدفوع"}</p>
        <p className="mt-2">Payment: {order.paymentMethod === "online" ? `Online payment / دفع إلكتروني (${order.paymentProvider || "card"})` : "Payment at delivery / الدفع عند الاستلام"}</p>
        {order.cardLastFour && <p>Card: **** {order.cardLastFour}</p>}
        <p className="mt-5">Customer: {order.name} {order.lastname}</p>
        <p>Wilaya: {order.city}</p>
        <p>Address: {order.adress}, {order.apartment}</p>
        <p className="mt-5 text-2xl font-bold">Total: {formatDZD(order.total)}</p>
        <svg ref={barcodeRef} className="mt-8 w-full h-20" viewBox="0 0 240 80" role="img" aria-label="Order barcode">
          {Array.from(code).map((character, index) => <rect key={`${character}-${index}`} x={index * 9} y={8} width={Number.parseInt(character, 16) % 6 + 2} height={54} fill="black" />)}
          <text x="120" y="76" textAnchor="middle" fontSize="8">{order.id}</text>
        </svg>
      </div>
      <button type="button" onClick={downloadReceipt} className="mt-5 bg-blue-500 text-white px-6 py-3 font-semibold">Download receipt image</button>
    </main>
  );
};

export default ReceiptPage;
