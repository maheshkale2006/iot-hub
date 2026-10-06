import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";

import {
  clearCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../services/cartService";

type CartItem = {
  id: string;
  user_id: string;
  product_id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export default function Cart() {
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // LOAD CART
  // ================================
  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const cart = await getCart();

      setItems(cart as CartItem[]);
    } catch (error: any) {
      console.error("LOAD CART ERROR:", error);

      if (
        error?.message
          ?.toLowerCase()
          .includes("please login")
      ) {
        navigate("/login");
        return;
      }

      setError(
        error?.message ||
          "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // INITIAL LOAD
  // ================================
  useEffect(() => {
    loadCart();
  }, []);

  // ================================
  // INCREASE QUANTITY
  // ================================
  const increaseQuantity = async (
    item: CartItem
  ) => {
    try {
      await updateCartQuantity(
        item.id,
        item.quantity + 1
      );

      await loadCart();
    } catch (error: any) {
      alert(
        error?.message ||
          "Unable to update quantity."
      );
    }
  };

  // ================================
  // DECREASE QUANTITY
  // ================================
  const decreaseQuantity = async (
    item: CartItem
  ) => {
    try {
      await updateCartQuantity(
        item.id,
        item.quantity - 1
      );

      await loadCart();
    } catch (error: any) {
      alert(
        error?.message ||
          "Unable to update quantity."
      );
    }
  };

  // ================================
  // REMOVE ITEM
  // ================================
  const removeItem = async (
    item: CartItem
  ) => {
    try {
      await removeFromCart(item.id);

      await loadCart();
    } catch (error: any) {
      alert(
        error?.message ||
          "Unable to remove item."
      );
    }
  };

  // ================================
  // CLEAR CART
  // ================================
  const handleClearCart = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await clearCart();

      setItems([]);
    } catch (error: any) {
      alert(
        error?.message ||
          "Unable to clear cart."
      );
    }
  };

  // ================================
  // CALCULATIONS
  // ================================
  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.price) * item.quantity,
    0
  );

  const totalItems = items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 h-32 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  // ================================
  // UI
  // ================================
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">
              My Cart
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}{" "}
              in your cart
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="text-sm font-medium text-red-500 hover:text-red-600"
            >
              Clear Cart
            </button>
          )}

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* EMPTY CART */}
        {items.length === 0 && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-sky-50">
              <ShoppingCart className="h-9 w-9 text-sky-500" />
            </div>

            <h2 className="font-display text-2xl font-bold text-slate-900">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Browse our IoT products and add the
              components you need for your projects.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600"
            >
              Browse IoT Products
            </Link>

          </div>
        )}

        {/* CART */}
        {items.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            {/* ITEMS */}
            <div className="space-y-4">

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                >

                  {/* IMAGE */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        🔧
                      </div>
                    )}

                  </div>

                  {/* PRODUCT */}
                  <div className="min-w-0 flex-1">

                    <h3 className="font-display font-bold text-slate-900">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-sky-600">
                      ₹
                      {Number(
                        item.price
                      ).toLocaleString("en-IN")}
                    </p>

                    {/* QUANTITY */}
                    <div className="mt-4 flex items-center gap-3">

                      <span className="text-xs text-slate-400">
                        Quantity
                      </span>

                      <div className="flex items-center overflow-hidden rounded-lg border border-slate-200">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item)
                          }
                          className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <span className="flex h-8 min-w-10 items-center justify-center border-x border-slate-200 text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(item)
                          }
                          className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* PRICE */}
                  <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">

                    <div className="font-display text-lg font-bold text-slate-900">
                      ₹
                      {(
                        Number(item.price) *
                        item.quantity
                      ).toLocaleString("en-IN")}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item)
                      }
                      className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>

                  </div>

                </div>
              ))}

              {/* CONTINUE SHOPPING */}
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>

            </div>

            {/* SUMMARY */}
            <aside className="lg:sticky lg:top-24 lg:self-start">

              <div className="rounded-2xl border border-slate-200 bg-white p-6">

                <h2 className="font-display text-lg font-bold text-slate-900">
                  Order Summary
                </h2>

                <div className="mt-5 space-y-3">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Items
                    </span>

                    <span className="font-medium text-slate-900">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-slate-900">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Delivery
                    </span>

                    <span className="font-medium text-green-600">
                      Calculated at checkout
                    </span>
                  </div>

                </div>

                <div className="my-5 border-t border-slate-100" />

                <div className="flex items-center justify-between">

                  <span className="font-semibold text-slate-900">
                    Total
                  </span>

                  <span className="font-display text-2xl font-bold text-sky-600">
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <button
  type="button"
  onClick={() => navigate("/checkout")}
  className="mt-6 w-full rounded-xl bg-sky-500 py-3.5 text-sm font-bold text-white transition hover:bg-sky-600"
>
  Proceed to Checkout
</button>

              </div>

            </aside>

          </div>
        )}

      </main>

    </div>
  );
}