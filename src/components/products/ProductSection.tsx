import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "./ProductCard";
import { getPopularProducts } from "../../services/productService";
import { addToCart } from "../../services/cartService";

interface Product {
  id: number;
  name: string;
  feature: string | null;
  actual_price: number;
  selling_price: number;
  discount_percentage: number;
  stock: number;
  category: string;
  image_url: string | null;
}

function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getPopularProducts();

        console.log(
          "HOME PRODUCTS:",
          data
        );

        setProducts(data);
      } catch (err) {
        console.error(
          "PRODUCT ERROR:",
          err
        );

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Unable to load products"
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // =====================================================
  // ADD TO CART
  // =====================================================

  async function handleAddToCart(
    product: Product
  ) {
    try {
      if (product.stock <= 0) {
        alert(
          "This product is out of stock."
        );
        return;
      }

      await addToCart(
        product.id,
        1
      );

      alert(
        `${product.name} added to cart!`
      );
    } catch (err) {
      console.error(
        "ADD TO CART ERROR:",
        err
      );

      if (err instanceof Error) {
        const message =
          err.message.toLowerCase();

        if (
          message.includes("login") ||
          message.includes("logged") ||
          message.includes("user")
        ) {
          alert(
            "Please login first to add products to cart."
          );
        } else {
          alert(err.message);
        }
      } else {
        alert(
          "Unable to add product to cart."
        );
      }
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="bg-[#f8fafc] py-[64px]">
      <div className="mx-auto max-w-[1240px] px-4 lg:px-0">

        {/* HEADER */}

        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="text-[30px] font-extrabold text-[#0f172b]">
              Popular Components
            </h2>

            <p className="mt-1 text-[16px] text-[#5f7694]">
              Top-rated IoT components trusted by makers
            </p>
          </div>

          <Link
            to="/shop"
            className="text-[14px] font-semibold text-[#008bd0] transition hover:text-[#0369a1]"
          >
            View All →
          </Link>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-[365px] animate-pulse rounded-[16px] bg-white"
                />
              )
            )}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-[16px] border border-red-200 bg-red-50 p-10 text-center">
            <div className="text-4xl">
              ⚠️
            </div>

            <h3 className="mt-3 font-bold text-red-600">
              Products could not be loaded
            </h3>

            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="rounded-[16px] border border-dashed border-[#cbd5e1] bg-white p-16 text-center">
              <div className="text-5xl">
                📦
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#0f172b]">
                No Products Found
              </h3>

              <p className="mt-2 text-sm text-[#64748b]">
                Add products to your Supabase database.
              </p>
            </div>
          )}

        {/* PRODUCTS */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map(
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
      </div>
    </section>
  );
}

export default ProductSection;