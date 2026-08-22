import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ProductInCart = {
  id: string;
  title: string;
  price: number;
  basePrice?: number;
  image: string;
  size?: string | null;
  color?: string | null;
  sizeOptions?: string[];
  colorOptions?: string[];
  variantPrices?: Record<string, number> | null;
  amount: number;
  inStock: number;
  couponCode?: string | null;
  couponPercent?: number;
  isNew?: boolean;
  isSold?: boolean;
  productId?: string;
};

export type State = {
  products: ProductInCart[];
  allQuantity: number;
  total: number;
};

export type Actions = {
  addToCart: (newProduct: ProductInCart) => void;
  removeFromCart: (id: string) => void;
  updateCartAmount: (id: string, quantity: number) => void;
  updateCartVariant: (id: string, size: string | null, color: string | null, price: number) => void;
  calculateTotals: () => void;
  clearCart: () => void;
};

export const useProductStore = create<State & Actions>()(
  persist(
    (set) => ({
      products: [],
      allQuantity: 0,
      total: 0,
      addToCart: (newProduct) => {
        set((state) => {
          const cartItem = state.products.find(
            (item) => item.id === newProduct.id
          );
          if (!cartItem) {
            return { products: [...state.products, newProduct] };
          } else {
            state.products.map((product) => {
              if (product.id === cartItem.id) {
                product.amount += newProduct.amount;
              }
            });
          }
          return { products: [...state.products] };
        });
      },
      clearCart: () => {
        set((state: any) => {
          
          return {
            products: [],
            allQuantity: 0,
            total: 0,
          };
        });
      },
      removeFromCart: (id) => {
        set((state) => {
          state.products = state.products.filter(
            (product: ProductInCart) => product.id !== id
          );
          return { products: state.products };
        });
      },

      calculateTotals: () => {
        set((state) => {
          let amount = 0;
          let total = 0;
          state.products.forEach((item) => {
            amount += item.amount;
            total += item.amount * item.price;
          });

          return {
            products: state.products,
            allQuantity: amount,
            total: total,
          };
        });
      },
      updateCartAmount: (id, amount) => {
        set((state) => {
          const cartItem = state.products.find((item) => item.id === id);

          if (!cartItem) {
            return { products: [...state.products] };
          } else {
            state.products.map((product) => {
              if (product.id === cartItem.id) {
                product.amount = amount;
              }
            });
          }

          return {
            products: [...state.products],
            total: state.products.reduce((sum, product) => sum + product.price * product.amount, 0),
          };
        });
      },
      updateCartVariant: (id, size, color, price) => {
        set((state) => {
          const products = state.products.map((product) => product.id === id ? { ...product, size, color, price } : product);
          return { products, total: products.reduce((sum, product) => sum + product.price * product.amount, 0) };
        });
      },
    }),
    {
      name: "products-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
