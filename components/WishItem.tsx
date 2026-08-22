"use client";

import Link from "next/link";
import { FaTrash } from "react-icons/fa";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";

type WishItemProps = {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  stockAvailabillity: number;
};

const WishItem = ({
  id,
  title,
  price,
  image,
  slug,
  stockAvailabillity,
}: WishItemProps) => {
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  return (
    <tr>
      <td />
      <td>
        <img src={image} alt={title} className="mx-auto h-20 w-20 object-contain" />
      </td>
      <td>
        <Link href={`/product/${slug}`} className="link link-hover">
          {title}
        </Link>
      </td>
      <td>{stockAvailabillity > 0 ? "In stock" : "Out of stock"}</td>
      <td>
        <button
          type="button"
          aria-label={`Remove ${title} from wishlist`}
          className="btn btn-ghost btn-sm"
          onClick={() => removeFromWishlist(id)}
        >
          <FaTrash />
        </button>
      </td>
    </tr>
  );
};

export default WishItem;