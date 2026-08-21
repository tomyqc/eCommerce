import { formatDZD, getDiscountedPrice } from "@/lib/currency";

type DiscountedPriceProps = {
  price: number;
  couponPercent?: number | null;
  className?: string;
};

const DiscountedPrice = ({ price, couponPercent, className = "" }: DiscountedPriceProps) => {
  const discountPercent = Math.max(0, Math.min(100, Number(couponPercent) || 0));

  if (discountPercent <= 0) {
    return <p className={className}>{formatDZD(price)}</p>;
  }

  return (
    <div className={className}>
      <p className="text-red-600 line-through decoration-red-600">{formatDZD(price)}</p>
      <p className="font-semibold text-red-600">{formatDZD(getDiscountedPrice(price, discountPercent))}</p>
    </div>
  );
};

export default DiscountedPrice;
