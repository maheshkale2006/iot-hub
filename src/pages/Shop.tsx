import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Heart,
  ShoppingCart,
  RotateCcw,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { supabase } from "../lib/supabase";
import { addToCart } from "../services/cartService"

interface Product {
  id: number;
  name: string;
  feature: string | null;

  actual_price: number;
  selling_price: number;
  discount_percentage: number;

  key_features: string[];

  description: string | null;

  specifications: Record<string, string>;

  stock: number;

  category: string;

  image_url: string | null;

  created_at: string;
  updated_at: string;

  rating: number;
  review_count: number;

  compatibility: string[];
}

const CATEGORIES = [
  "Arduino",
  "ESP32",
  "ESP8266",
  "Raspberry Pi",
  "Sensors",
  "Modules",
  "Motors",
  "Relays",
  "Displays",
  "Communication",
  "Power Supply",
  "Accessories",
];

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) {
  const navigate = useNavigate();

  const discount =
    product.discount_percentage > 0
      ? product.discount_percentage
      : product.actual_price > product.selling_price
      ? Math.round(
          ((product.actual_price - product.selling_price) /
            product.actual_price) *
            100
        )
      : 0;

  const rating = Math.min(5, Math.max(0, Number(product.rating) || 0));

  const handleDetails = () => {
    console.log("Opening product:", product.id);

    // IMPORTANT:
    // App.tsx uses /products/:id
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-sky-200 transition-all group">

      {/* IMAGE */}

      <div className="relative overflow-hidden bg-slate-100 h-48">

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">
                🔧
              </div>

              <p className="text-xs text-slate-400">
                No image available
              </p>
            </div>
          </div>
        )}

        {/* CATEGORY */}

        <div className="absolute top-2 left-2">
          <span className="bg-sky-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>

        {/* DISCOUNT */}

        {discount > 0 && (
          <span className="absolute top-2 right-10 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {discount}% OFF
          </span>
        )}

        {/* FAVORITE */}

        <button
          type="button"
          className="absolute top-2 right-2 w-7 h-7 bg-white/95 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-sm"
        >
          <Heart className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* CONTENT */}

      <div className="p-4">

        <h3 className="font-display font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-slate-500 text-xs mb-2 line-clamp-2">
          {product.feature || "IoT Component"}
        </p>

        {/* RATING */}

        <div className="flex items-center gap-1 mb-3">

          <span className="text-amber-400 text-xs">
            {"★".repeat(Math.floor(rating))}
            {"☆".repeat(5 - Math.floor(rating))}
          </span>

          <span className="text-slate-500 text-xs font-medium">
            {rating.toFixed(1)}
          </span>

          <span className="text-slate-400 text-xs">
            ({product.review_count})
          </span>

        </div>

        {/* PRICE */}

        <div className="flex items-center justify-between mb-3">

          <div>

            <span className="font-display font-bold text-slate-900 text-xl">
              ₹{Number(product.selling_price).toLocaleString("en-IN")}
            </span>

            {Number(product.actual_price) >
              Number(product.selling_price) && (
              <span className="text-slate-400 text-xs line-through ml-2">
                ₹
                {Number(product.actual_price).toLocaleString("en-IN")}
              </span>
            )}

          </div>

          {/* STOCK */}

          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              product.stock > 0
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {product.stock > 0
              ? `In Stock (${product.stock})`
              : "Out of Stock"}
          </span>

        </div>

        {/* ACTIONS */}

        <div className="flex gap-2">

          {/* ADD TO CART */}

          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => onAddToCart(product)}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-sky-500 text-white hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <ShoppingCart className="w-4 h-4" />

            Add to Cart
          </button>

          {/* DETAILS */}

          <button
            type="button"
            onClick={handleDetails}
            className="relative z-10 cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs hover:border-sky-300 hover:text-sky-600 transition-all"
          >
            Details
          </button>

        </div>

      </div>

    </div>
  );
}

export default function Shop() {

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);

  const [minPrice, setMinPrice] = useState(0);

  const [maxPrice, setMaxPrice] = useState(5000);

  const [inStockOnly, setInStockOnly] = useState(false);

  const [minimumRating, setMinimumRating] = useState(0);

  const [sortBy, setSortBy] = useState("popular");

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {

    try {

      setLoading(true);

      setError("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setProducts((data || []) as Product[]);

    } catch (err) {

      console.error("Products error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products."
      );

    } finally {

      setLoading(false);

    }
  }

  /* =====================================================
     CATEGORY COUNTS
  ===================================================== */

  const categoryCounts = useMemo(() => {

    const counts: Record<string, number> = {};

    CATEGORIES.forEach((category) => {

      counts[category] = products.filter(
        (product) => product.category === category
      ).length;

    });

    return counts;

  }, [products]);

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {

    let result = [...products];

    /* SEARCH */

    if (search.trim()) {

      const query = search.toLowerCase().trim();

      result = result.filter((product) => {

        const name =
          product.name?.toLowerCase() || "";

        const feature =
          product.feature?.toLowerCase() || "";

        const category =
          product.category?.toLowerCase() || "";

        return (
          name.includes(query) ||
          feature.includes(query) ||
          category.includes(query)
        );

      });

    }

    /* CATEGORY */

    if (selectedCategories.length > 0) {

      result = result.filter((product) =>
        selectedCategories.includes(product.category)
      );

    }

    /* PRICE */

    result = result.filter(
      (product) =>
        Number(product.selling_price) >= minPrice &&
        Number(product.selling_price) <= maxPrice
    );

    /* STOCK */

    if (inStockOnly) {

      result = result.filter(
        (product) => product.stock > 0
      );

    }

    /* RATING */

    if (minimumRating > 0) {

      result = result.filter(
        (product) =>
          Number(product.rating) >= minimumRating
      );

    }

    /* SORT */

    if (sortBy === "popular") {

      result.sort(
        (a, b) =>
          Number(b.review_count) -
          Number(a.review_count)
      );

    }

    if (sortBy === "rating") {

      result.sort(
        (a, b) =>
          Number(b.rating) -
          Number(a.rating)
      );

    }

    if (sortBy === "price-asc") {

      result.sort(
        (a, b) =>
          Number(a.selling_price) -
          Number(b.selling_price)
      );

    }

    if (sortBy === "price-desc") {

      result.sort(
        (a, b) =>
          Number(b.selling_price) -
          Number(a.selling_price)
      );

    }

    if (sortBy === "new") {

      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

    }

    return result;

  }, [
    products,
    search,
    selectedCategories,
    minPrice,
    maxPrice,
    inStockOnly,
    minimumRating,
    sortBy,
  ]);

  /* =====================================================
     CATEGORY TOGGLE
  ===================================================== */

  function toggleCategory(category: string) {

    setSelectedCategories((current) => {

      if (current.includes(category)) {

        return current.filter(
          (item) => item !== category
        );

      }

      return [...current, category];

    });

  }

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  function clearFilters() {

    setSearch("");

    setSelectedCategories([]);

    setMinPrice(0);

    setMaxPrice(5000);

    setInStockOnly(false);

    setMinimumRating(0);

    setSortBy("popular");

  }

  /* =====================================================
     ADD TO CART
  ===================================================== */

 async function handleAddToCart(product: Product) {
  try {
    if (product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    await addToCart(product.id, 1);

    alert(`${product.name} added to cart!`);
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);

    if (err instanceof Error) {
      if (
        err.message.toLowerCase().includes("login") ||
        err.message.toLowerCase().includes("logged")
      ) {
        alert("Please login first to add products to cart.");
      } else {
        alert(err.message);
      }
    } else {
      alert("Unable to add product to cart.");
    }
  }
}

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <Navbar />

      <main className="flex-1">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* HEADER */}

          <div className="mb-8">

            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
              Explore IoT Products
            </h1>

            <p className="text-slate-500">
              Find the right components for your next IoT project
            </p>

          </div>

          {/* SEARCH */}

          <div className="relative mb-6">

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products... e.g., ESP32, Temperature Sensor, Relay Module"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 shadow-sm"
            />

          </div>

          <div className="flex gap-6">

            {/* SIDEBAR */}

            <aside className="hidden lg:block w-64 flex-shrink-0">

              <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">

                <div className="flex items-center justify-between mb-5">

                  <h2 className="font-display font-bold text-slate-900">
                    Filters
                  </h2>

                  <button
                    onClick={clearFilters}
                    className="text-xs text-sky-600 hover:text-sky-700"
                  >
                    Clear All
                  </button>

                </div>

                {/* CATEGORY */}

                <div className="mb-7">

                  <h3 className="font-display font-semibold text-slate-900 text-sm mb-3">
                    Category
                  </h3>

                  <div className="space-y-2">

                    {CATEGORIES.map((category) => (

                      <label
                        key={category}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >

                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(
                            category
                          )}
                          onChange={() =>
                            toggleCategory(category)
                          }
                          className="w-4 h-4 rounded accent-sky-500"
                        />

                        <span className="text-sm text-slate-600 group-hover:text-slate-900">
                          {category}
                        </span>

                        <span className="ml-auto text-xs text-slate-400">
                          {categoryCounts[category] || 0}
                        </span>

                      </label>

                    ))}

                  </div>

                </div>

                {/* PRICE */}

                <div className="mb-7">

                  <h3 className="font-display font-semibold text-slate-900 text-sm mb-3">

                    Price Range

                    <span className="font-normal text-sky-600 ml-2">
                      ₹{minPrice} — ₹{maxPrice}
                    </span>

                  </h3>

                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(Number(e.target.value))
                    }
                    className="w-full accent-sky-500"
                  />

                  <div className="flex gap-2 mt-3">

                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) =>
                        setMinPrice(
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-400"
                    />

                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) =>
                        setMaxPrice(
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-400"
                    />

                  </div>

                </div>

                {/* AVAILABILITY */}

                <div className="mb-7">

                  <h3 className="font-display font-semibold text-slate-900 text-sm mb-3">
                    Availability
                  </h3>

                  <label className="flex items-center gap-2.5 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) =>
                        setInStockOnly(
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 rounded accent-sky-500"
                    />

                    <span className="text-sm text-slate-600">
                      In Stock Only
                    </span>

                  </label>

                </div>

                {/* RATING */}

                <div>

                  <h3 className="font-display font-semibold text-slate-900 text-sm mb-3">
                    Minimum Rating
                  </h3>

                  <div className="space-y-2">

                    <label className="flex items-center gap-2.5 cursor-pointer">

                      <input
                        type="radio"
                        name="rating"
                        checked={minimumRating === 4}
                        onChange={() =>
                          setMinimumRating(4)
                        }
                        className="accent-sky-500"
                      />

                      <span className="text-sm text-slate-600">
                        ⭐ 4+ Stars
                      </span>

                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">

                      <input
                        type="radio"
                        name="rating"
                        checked={minimumRating === 3}
                        onChange={() =>
                          setMinimumRating(3)
                        }
                        className="accent-sky-500"
                      />

                      <span className="text-sm text-slate-600">
                        ⭐ 3+ Stars
                      </span>

                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">

                      <input
                        type="radio"
                        name="rating"
                        checked={minimumRating === 0}
                        onChange={() =>
                          setMinimumRating(0)
                        }
                        className="accent-sky-500"
                      />

                      <span className="text-sm text-slate-600">
                        All Ratings
                      </span>

                    </label>

                  </div>

                </div>

                <button
                  onClick={clearFilters}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:border-sky-300 hover:text-sky-600"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Filters
                </button>

              </div>

            </aside>

            {/* PRODUCTS */}

            <section className="flex-1 min-w-0">

              {/* TOP BAR */}

              <div className="flex items-center justify-between mb-4 gap-3">

                <div className="flex items-center gap-3">

                  <button
                    className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>

                  <span className="text-sm text-slate-500">
                    {filteredProducts.length} products
                  </span>

                </div>

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 outline-none focus:border-sky-400 bg-white"
                >

                  <option value="popular">
                    Most Popular
                  </option>

                  <option value="rating">
                    Highest Rated
                  </option>

                  <option value="price-asc">
                    Price: Low to High
                  </option>

                  <option value="price-desc">
                    Price: High to Low
                  </option>

                  <option value="new">
                    Newest First
                  </option>

                </select>

              </div>

              {/* LOADING */}

              {loading && (

                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

                  {Array.from({ length: 6 }).map(
                    (_, index) => (

                      <div
                        key={index}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
                      >

                        <div className="h-48 bg-slate-200" />

                        <div className="p-4 space-y-3">

                          <div className="h-4 bg-slate-200 rounded w-3/4" />

                          <div className="h-3 bg-slate-200 rounded w-full" />

                          <div className="h-3 bg-slate-200 rounded w-1/2" />

                          <div className="h-8 bg-slate-200 rounded" />

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

              {/* ERROR */}

              {!loading && error && (

                <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">

                  <div className="text-4xl mb-3">
                    ⚠️
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-2">
                    Unable to load products
                  </h3>

                  <p className="text-sm text-red-500 mb-5">
                    {error}
                  </p>

                  <button
                    onClick={fetchProducts}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600"
                  >
                    Try Again
                  </button>

                </div>

              )}

              {/* EMPTY DATABASE */}

              {!loading &&
                !error &&
                products.length === 0 && (

                  <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">

                    <div className="text-5xl mb-4">
                      📦
                    </div>

                    <h3 className="font-display font-bold text-xl text-slate-900">
                      No IoT products yet
                    </h3>

                    <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                      Products added to the Supabase products
                      table will automatically appear here.
                    </p>

                  </div>

                )}

              {/* FILTERED EMPTY */}

              {!loading &&
                !error &&
                products.length > 0 &&
                filteredProducts.length === 0 && (

                  <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">

                    <div className="text-5xl mb-4">
                      🔎
                    </div>

                    <h3 className="font-display font-bold text-xl text-slate-900">
                      No products found
                    </h3>

                    <p className="text-slate-500 text-sm mt-2">
                      Try changing your search or filters.
                    </p>

                    <button
                      onClick={clearFilters}
                      className="mt-5 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold"
                    >
                      Clear Filters
                    </button>

                  </div>

                )}

              {/* GRID */}

              {!loading &&
                !error &&
                filteredProducts.length > 0 && (

                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

                    {filteredProducts.map(
                      (product) => (

                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={
                            handleAddToCart
                          }
                        />

                      )
                    )}

                  </div>

                )}

            </section>

          </div>

        </div>

      </main>

      {/* AI BUTTON */}

      <button className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold shadow-xl hover:scale-105 transition-all">
        🤖

        <span className="hidden sm:inline">
          Ask IoT AI
        </span>
      </button>

      <Footer />

    </div>
  );
}