import { Link } from "react-router-dom";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
  onAddToCart: (
    product: Product
  ) => void;
}

function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const discount =
    Number(
      product.discount_percentage || 0
    );

  const sellingPrice =
    Number(product.selling_price || 0);

  const actualPrice =
    Number(product.actual_price || 0);

  return (
    <div className="group overflow-hidden rounded-[16px] border border-[#dce5ee] bg-white shadow-[0_3px_8px_rgba(15,23,42,.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(15,23,42,.12)]">

      {/* IMAGE */}

      <Link
        to={`/products/${product.id}`}
        className="block"
      >
        <div className="relative h-[200px] overflow-hidden bg-[#f1f5f9]">

          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              🔧
            </div>
          )}

          {/* DISCOUNT */}

          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-[#ef4444] px-2.5 py-1 text-[11px] font-bold text-white">
              {discount}% OFF
            </span>
          )}

          {/* STOCK */}

          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-red-600">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* CONTENT */}

      <div className="p-4">

        {/* CATEGORY */}

        {product.category && (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0284c7]">
            {product.category}
          </p>
        )}

        {/* NAME */}

        <Link
          to={`/products/${product.id}`}
        >
          <h3 className="mt-1 line-clamp-2 min-h-[48px] text-[16px] font-extrabold text-[#0f172b] transition group-hover:text-[#0284c7]">
            {product.name}
          </h3>
        </Link>

        {/* FEATURE */}

        <p className="mt-1 line-clamp-2 min-h-[40px] text-[12px] leading-5 text-[#64748b]">
          {product.feature ||
            "Quality IoT component for your projects."}
        </p>

        {/* PRICE */}

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[19px] font-extrabold text-[#008bd0]">
            ₹{sellingPrice}
          </span>

          {actualPrice >
            sellingPrice && (
            <span className="text-[12px] text-[#94a3b8] line-through">
              ₹{actualPrice}
            </span>
          )}
        </div>

        {/* STOCK */}

        <p
          className={`mt-1 text-[11px] font-medium ${
            product.stock > 0
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {product.stock > 0
            ? `${product.stock} available`
            : "Out of stock"}
        </p>

        {/* BUTTONS */}

        <div className="mt-4 flex gap-2">

          <Link
            to={`/products/${product.id}`}
            className="flex-1 rounded-[9px] border border-[#0284c7] px-3 py-2.5 text-center text-[12px] font-bold text-[#0284c7] transition hover:bg-[#eff8ff]"
          >
            Details
          </Link>

          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() =>
              onAddToCart(product)
            }
            className={`flex-1 rounded-[9px] px-3 py-2.5 text-[12px] font-bold text-white transition ${
              product.stock <= 0
                ? "cursor-not-allowed bg-gray-400"
                : "bg-[#008bd0] hover:bg-[#0369a1]"
            }`}
          >
            {product.stock <= 0
              ? "Out of Stock"
              : "Add to Cart"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default ProductCard;