import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Product {
  id: number;
  name: string;
  feature: string | null;

  actual_price: number;
  selling_price: number;
  discount_percentage: number;

  key_features: string[];
  description: string | null;

  specifications: Record<string, string | number | boolean>;
  compatibility: string[];

  stock: number;
  category: string;
  image_url: string | null;

  rating: number;
  review_count: number;
}

interface Project {
  id: number;
  name: string;
  components: any;
}

type Tab = "description" | "specifications" | "compatibility";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("description");

  const [projectCount, setProjectCount] = useState(0);

  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchProjectCount(product.id);
    }
  }, [product]);

  async function fetchProduct() {
    if (!id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        feature,
        actual_price,
        selling_price,
        discount_percentage,
        key_features,
        description,
        specifications,
        compatibility,
        stock,
        category,
        image_url,
        rating,
        review_count
      `)
      .eq("id", Number(id))
      .single();

    if (error) {
      console.error("Failed to fetch product:", error);
      setProduct(null);
    } else {
      setProduct(data);
    }

    setLoading(false);
  }

  async function fetchProjectCount(productId: number) {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, components");

    if (error) {
      console.error("Project count error:", error);
      return;
    }

    const matchingProjects =
      data?.filter((project: Project) => {
        if (!project.components) return false;

        if (Array.isArray(project.components)) {
          return project.components.some(
            (component: any) =>
              Number(component?.product_id) === Number(productId)
          );
        }

        return false;
      }) || [];

    setProjectCount(matchingProjects.length);
  }

  function increaseQuantity() {
    if (!product) return;

    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }

  function addToCart() {
    if (!product) return;

    console.log("Add to cart:", {
      productId: product.id,
      quantity,
    });

    // Add your cart/Supabase logic here
  }

  function buyNow() {
    if (!product) return;

    console.log("Buy now:", {
      productId: product.id,
      quantity,
    });

    // Add your buy-now logic here
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-slate-500 text-sm">
          Loading product...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Product not found
          </h2>

          <Link
            to="/shop"
            className="inline-block mt-4 text-[#008bd0] hover:underline"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discount =
    product.discount_percentage ||
    Math.round(
      ((product.actual_price - product.selling_price) /
        product.actual_price) *
        100
    );

  const images = product.image_url
    ? [product.image_url, product.image_url]
    : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172b]">
      {/* PAGE CONTAINER */}
      <div className="max-w-[1240px] mx-auto px-6 pb-20">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 pt-8 pb-6 text-[14px]">
          <Link
            to="/"
            className="text-[#53708f] hover:text-[#008bd0]"
          >
            Home
          </Link>

          <span className="text-slate-400">›</span>

          <Link
            to="/shop"
            className="text-[#53708f] hover:text-[#008bd0]"
          >
            Products
          </Link>

          <span className="text-slate-400">›</span>

          <span className="text-[#0f172b] font-medium">
            {product.name}
          </span>
        </div>

        {/* MAIN PRODUCT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-[600px_1fr] gap-10">

          {/* ================= IMAGE SECTION ================= */}
          <div>
            {/* MAIN IMAGE */}
            <div className="w-full h-[385px] rounded-[16px] overflow-hidden bg-white">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No image available
                </div>
              )}
            </div>

            {/* THUMBNAILS */}
            {images.length > 0 && (
              <div className="flex gap-3 mt-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-[64px] h-[64px] rounded-[12px] overflow-hidden border-2 transition ${
                      selectedImage === index
                        ? "border-[#08a9e6]"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= PRODUCT INFO ================= */}
          <div>

            {/* BADGES */}
            <div className="flex items-center gap-2 mb-3">

              <span className="px-3 py-[5px] rounded-full bg-[#e0f2fe] text-[#0284c7] text-[12px] font-medium">
                {product.category}
              </span>

              <span className="px-3 py-[5px] rounded-full bg-[#dcfce7] text-[#00894b] text-[12px] font-medium">
                ✓ In Stock ({product.stock} units)
              </span>

            </div>

            {/* TITLE */}
            <h1 className="text-[30px] leading-[1.2] font-bold text-[#07152e]">
              {product.name}
            </h1>

            {/* FEATURE */}
            <p className="mt-2 text-[16px] text-[#52708e]">
              {product.feature ||
                "High-performance development board for IoT projects"}
            </p>

            {/* RATING */}
            <div className="flex items-center gap-3 mt-5">

              <div className="flex items-center gap-[2px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= Math.round(product.rating || 0)
                        ? "text-[#ffad00] text-[18px]"
                        : "text-[#d9e0e7] text-[18px]"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <span className="font-semibold text-[15px]">
                {product.rating || "0.0"}
              </span>

              <span className="text-[#8a9caf] text-[14px]">
                ({product.review_count || 0} reviews)
              </span>

            </div>

            {/* PRICE */}
            <div className="flex items-center gap-3 mt-6">

              <span className="text-[34px] font-bold text-[#07152e]">
                ₹{Number(product.selling_price).toLocaleString("en-IN")}
              </span>

              {product.actual_price > product.selling_price && (
                <>
                  <span className="text-[17px] text-[#8795a5] line-through">
                    ₹{Number(product.actual_price).toLocaleString("en-IN")}
                  </span>

                  <span className="px-2 py-1 rounded-full bg-[#dcfce7] text-[#079455] text-[13px] font-semibold">
                    {discount}% OFF
                  </span>
                </>
              )}

            </div>

            {/* ACTION ROW */}
            <div className="flex items-center gap-3 mt-7">

              {/* QUANTITY */}
              <div className="h-[46px] w-[130px] border border-[#dce5ed] bg-white rounded-[12px] flex items-center justify-between px-3">

                <button
                  onClick={decreaseQuantity}
                  className="text-[20px] text-[#52667b] hover:text-[#008bd0]"
                >
                  −
                </button>

                <span className="text-[15px] font-medium">
                  {quantity}
                </span>

                <button
                  onClick={increaseQuantity}
                  className="text-[20px] text-[#52667b] hover:text-[#008bd0]"
                >
                  +
                </button>

              </div>

              {/* ADD TO CART */}
              <button
                onClick={addToCart}
                className="h-[46px] flex-1 rounded-[12px] bg-[#0ea5df] hover:bg-[#0795cc] text-white font-semibold text-[14px] transition"
              >
                Add to Cart
              </button>

              {/* BUY NOW */}
              <button
                onClick={buyNow}
                className="h-[46px] flex-1 rounded-[12px] border-2 border-[#079ddd] bg-white text-[#008bd0] hover:bg-[#effaff] font-semibold text-[14px] transition"
              >
                Buy Now
              </button>

            </div>

            {/* USED IN PROJECTS */}
            <Link
              to="/iot-projects"
              className="mt-4 h-[47px] border border-[#a9ddf8] bg-[#effaff] rounded-[11px] flex items-center px-4 text-[#0879b4] text-[14px] hover:bg-[#e4f7ff] transition"
            >
              <span className="mr-2">📦</span>

              Used in {projectCount} IoT Project
              {projectCount !== 1 ? "s" : ""}
            </Link>

            {/* KEY FEATURES */}
            <div className="mt-8">

              <h3 className="text-[14px] font-bold text-[#07152e] mb-3">
                Key Features
              </h3>

              <div className="space-y-2">

                {(product.key_features || []).map(
                  (feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-[14px] text-[#365777]"
                    >
                      <span className="text-[#079ddd] font-bold mt-[1px]">
                        ✓
                      </span>

                      <span>{feature}</span>
                    </div>
                  )
                )}

              </div>

            </div>

          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="mt-[72px]">

          <div className="border border-[#dce5ed] rounded-[16px] overflow-hidden bg-white">

            {/* TAB HEADER */}
            <div className="flex border-b border-[#dce5ed]">

              <button
                onClick={() => setActiveTab("description")}
                className={`px-6 py-[17px] text-[14px] font-medium transition ${
                  activeTab === "description"
                    ? "text-[#008bd0] border-b-2 border-[#079ddd] bg-[#f8fdff]"
                    : "text-[#244361] hover:text-[#008bd0]"
                }`}
              >
                Description
              </button>

              <button
                onClick={() => setActiveTab("specifications")}
                className={`px-6 py-[17px] text-[14px] font-medium transition ${
                  activeTab === "specifications"
                    ? "text-[#008bd0] border-b-2 border-[#079ddd] bg-[#f8fdff]"
                    : "text-[#244361] hover:text-[#008bd0]"
                }`}
              >
                Specifications
              </button>

              <button
                onClick={() => setActiveTab("compatibility")}
                className={`px-6 py-[17px] text-[14px] font-medium transition ${
                  activeTab === "compatibility"
                    ? "text-[#008bd0] border-b-2 border-[#079ddd] bg-[#f8fdff]"
                    : "text-[#244361] hover:text-[#008bd0]"
                }`}
              >
                Compatibility
              </button>

            </div>

            {/* TAB CONTENT */}
            <div className="px-6 py-7 min-h-[100px]">

              {/* DESCRIPTION */}
              {activeTab === "description" && (
                <p className="text-[16px] leading-7 text-[#365777]">
                  {product.description ||
                    `The ${product.name} is a feature-rich development board designed for IoT projects. It is suitable for sensor integration, wireless connectivity, automation and real-time data processing.`}
                </p>
              )}

              {/* SPECIFICATIONS */}
              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {Object.entries(product.specifications || {}).length >
                  0 ? (
                    Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between gap-5 border-b border-slate-100 py-3"
                        >
                          <span className="font-medium text-slate-600">
                            {key}
                          </span>

                          <span className="text-slate-800 text-right">
                            {String(value)}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-slate-500">
                      Specifications not available.
                    </p>
                  )}

                </div>
              )}

              {/* COMPATIBILITY */}
              {activeTab === "compatibility" && (
                <div className="space-y-3">

                  {product.compatibility?.length > 0 ? (
                    product.compatibility.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-[15px] text-[#365777]"
                        >
                          <span className="text-[#079ddd]">
                            ✓
                          </span>

                          {item}
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-slate-500">
                      Compatibility information not available.
                    </p>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* ================= FLOATING AI BUTTON ================= */}
      <button
        onClick={() => {
          console.log("Open IoT AI");
        }}
        className="fixed right-7 bottom-6 h-[52px] px-5 rounded-[16px] bg-[#05a9dc] hover:bg-[#049acb] text-white shadow-[0_8px_30px_rgba(0,139,208,0.25)] flex items-center gap-3 font-semibold text-[14px] transition z-50"
      >
        <span className="text-[20px]">🤖</span>
        Ask IoT AI
      </button>
    </div>
  );
}