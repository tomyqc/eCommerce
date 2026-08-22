interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  rating: number;
  description: string;
  mainImage: string;
  manufacturer: string;
  size?: string | null;
  color?: string | null;
  categoryId: string;
  merchantId: string;
  category: {name: string}?;
  inStock: number;
  quantity: number;
  isNew: boolean;
  isSold: boolean;
  couponCode?: string | null;
  couponPercent: number;
}

interface Merchant {
  id: string;
  name: string;
  email: string;
  description: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface SingleProductPageProps {
  params: {
    id: string;
    productSlug: string;
  };
}

type ProductInWishlist = {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  stockAvailabillity: number;
};

interface OtherImages {
  imageID: string;
  productID: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  password: string | null;
  role: string;
}

interface Order {
  id: string;
  adress: string;
  apartment: string;
  company: string;
  dateTime: string;
  email: string;
  lastname: string;
  name: string;
  phone: string;
  postalCode: string;
  status: "processing" | "canceled" | "delivered";
  city: string;
  country: string;
  orderNotice: string?;
  total: number;
  paymentMethod?: string;
  paymentProvider?: string | null;
  paymentStatus?: string | null;
  cardLastFour?: string | null;
}

interface SingleProductBtnProps {
  product: Product;
  quantityCount: number;
}


interface Category {
  id: string;
  name: string;
}

interface WishListItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
}


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: string;
    };
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}