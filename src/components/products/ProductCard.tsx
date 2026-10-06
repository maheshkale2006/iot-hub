import { useNavigate } from "react-router-dom";

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

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const navigate = useNavigate();

  const openProductDetails = () => {
    console.log("DETAILS CLICKED");
    console.log("PRODUCT ID:", product.id);

    navigate(`/products/${product.id}`);
  };

  return (
    <div className="group overflow-hidden rounded-[16px] border border-[#dce5ee] bg-white shadow-[0_3px_8px_rgba(15,23,42,.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(15,23,42,.12)]">

      {/* IMAGE */}
      <div className="relative h-[176px] overflow-hidden bg-[#eef5f9]">

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="text-5xl">📦</div>

            <span className="mt-2 text-xs text-gray-400">
              Product Image
            </span>
          </div>
        )}

        {/* CATEGORY */}
        <span className="absolute left-2 top-2 rounded-full bg-[#08a8dc] px-2.5 py-1 text-[11px] font-bold text-white">
          {product.category}
        </span>

        {/* DISCOUNT */}
        {product.discount_percentage > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-[#00c950] px-2.5 py-1 text-[11px] font-bold text-white">
            {product.discount_percentage}% OFF
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4">

        <h3 className="truncate text-[14px] font-bold text-[#0f172b]">
          {product.name}
        </h3>

        <p className="mt-1 min-h-[36px] text-[12px] leading-[18px] text-[#5f7694]">
          {product.feature || "IoT Component"}
        </p>

        {/* RATING */}
        <div className="mt-2 text-[13px] tracking-wide text-[#f59e0b]">
          ★★★★★
        </div>

        {/* PRICE */}
        <div className="mt-3 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span className="text-[18px] font-extrabold text-[#0f172b]">
              ₹{Number(product.selling_price).toLocaleString("en-IN")}
            </span>

            {Number(product.actual_price) >
              Number(product.selling_price) && (
              <del className="text-[12px] text-[#94a3b8]">
                ₹{Number(product.actual_price).toLocaleString("en-IN")}
              </del>
            )}

          </div>

          {/* STOCK */}
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              product.stock > 0
                ? "bg-[#edfff4] text-[#16a34a]"
                : "bg-[#fff1f2] text-[#e11d48]"
            }`}
          >
            {product.stock > 0
              ? `In Stock (${product.stock})`
              : "Out of Stock"}
          </span>

        </div>

        {/* BUTTONS */}
        <div className="relative z-50 mt-3 flex gap-2">

          {/* ADD TO CART */}
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => onAddToCart(product)}
            className="flex-1 rounded-[9px] bg-[#0ea5e9] py-[9px] text-[12px] font-bold text-white transition hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:bg-[#cbd5e1]"
          >
            Add to Cart
          </button>

          {/* DETAILS */}
          <button
            type="button"
            onClick={openProductDetails}
            className="relative z-[100] cursor-pointer rounded-[9px] border border-[#d8e1eb] bg-white px-3 py-[9px] text-[12px] font-medium text-[#475569] transition hover:border-[#0ea5e9] hover:text-[#0284c7]"
          >
            Details
          </button>

        </div>

      </div>
    </div>
  );
}

export default ProductCard;