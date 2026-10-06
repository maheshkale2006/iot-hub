import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Upload,
  Wallet,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import Navbar from "../components/layout/Navbar";
import { supabase } from "../lib/supabase";
import { getCart } from "../services/cartService";

// ============================================================
// TYPES
// ============================================================

type PaymentType =
  | "FULL_PAYMENT"
  | "PARTIAL_ADVANCE";

interface CartItem {
  id: string;
  user_id: string;
  product_id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  address_type: "Home" | "Work" | "Other";
  is_default: boolean;
}

// ============================================================
// CONFIGURATION
// ============================================================

// IMPORTANT:
// Replace this with your actual UPI ID.
//
// Example:
// const UPI_ID = "9876543210@upi";
//
const UPI_ID = "8080956639-2@ybl";

const UPI_NAME = "IoT Hub";

const ADVANCE_AMOUNT = 30;

// ============================================================
// CHECKOUT PAGE
// ============================================================

export default function Checkout() {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [user, setUser] = useState<any>(null);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [addresses, setAddresses] = useState<Address[]>(
    []
  );

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [paymentType, setPaymentType] =
    useState<PaymentType>("FULL_PAYMENT");

  const [transactionId, setTransactionId] =
    useState("");

  const [paymentProof, setPaymentProof] =
    useState<File | null>(null);

  const [loading, setLoading] = useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD CHECKOUT DATA
  // ==========================================================

  useEffect(() => {
    loadCheckoutData();
  }, []);

  async function loadCheckoutData() {
    try {
      setLoading(true);
      setError("");

      // ------------------------------------------------------
      // GET CURRENT USER
      // ------------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      // ------------------------------------------------------
      // GET CART
      // ------------------------------------------------------

      const cartData = await getCart();

      if (!cartData || cartData.length === 0) {
        navigate("/cart");
        return;
      }

      setCart(cartData as CartItem[]);

      // ------------------------------------------------------
      // GET ADDRESSES
      // ------------------------------------------------------

      const {
        data: addressData,
        error: addressError,
      } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (addressError) {
        throw addressError;
      }

      const loadedAddresses =
        (addressData || []) as Address[];

      setAddresses(loadedAddresses);

      // ------------------------------------------------------
      // SELECT DEFAULT ADDRESS
      // ------------------------------------------------------

      if (loadedAddresses.length > 0) {
        const defaultAddress =
          loadedAddresses.find(
            (address) => address.is_default
          ) || loadedAddresses[0];

        setSelectedAddressId(defaultAddress.id);
      }
    } catch (err: any) {
      console.error(
        "Checkout loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load checkout."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // SUBTOTAL
  // ==========================================================

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return (
        total +
        Number(item.price) *
          Number(item.quantity)
      );
    }, 0);
  }, [cart]);

  // ==========================================================
  // ONLINE PAYMENT AMOUNT
  // ==========================================================

  const onlineAmount = useMemo(() => {
    if (paymentType === "FULL_PAYMENT") {
      return subtotal;
    }

    return Math.min(
      ADVANCE_AMOUNT,
      subtotal
    );
  }, [paymentType, subtotal]);

  // ==========================================================
  // REMAINING PAYMENT
  // ==========================================================

  const remainingAmount = useMemo(() => {
    return Math.max(
      subtotal - onlineAmount,
      0
    );
  }, [subtotal, onlineAmount]);

  // ==========================================================
  // SELECTED ADDRESS
  // ==========================================================

  const selectedAddress = useMemo(() => {
    return addresses.find(
      (address) =>
        address.id === selectedAddressId
    );
  }, [
    addresses,
    selectedAddressId,
  ]);

  // ==========================================================
  // CREATE UPI PAYMENT URL
  // ==========================================================

  const upiPaymentUrl = useMemo(() => {
    const amount = onlineAmount.toFixed(2);

    return (
      `upi://pay` +
      `?pa=${encodeURIComponent(
        UPI_ID
      )}` +
      `&pn=${encodeURIComponent(
        UPI_NAME
      )}` +
      `&am=${amount}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(
        "IoT Hub Order Payment"
      )}`
    );
  }, [onlineAmount]);

  // ==========================================================
  // HANDLE PAYMENT SCREENSHOT
  // ==========================================================

  function handlePaymentScreenshot(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    // Maximum 5 MB
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Payment screenshot must be smaller than 5 MB."
      );

      return;
    }

    // Image validation
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please upload a valid image file."
      );

      return;
    }

    setPaymentProof(file);
  }

  // ==========================================================
  // UPLOAD PAYMENT SCREENSHOT
  // ==========================================================

  async function uploadPaymentProof(
    orderId: string
  ): Promise<string | null> {
    if (
      !paymentProof ||
      !user
    ) {
      return null;
    }

    const extension =
      paymentProof.name
        .split(".")
        .pop() || "jpg";

    const filePath =
      `${user.id}/` +
      `${orderId}-` +
      `${Date.now()}.` +
      extension;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("payment-proofs")
      .upload(
        filePath,
        paymentProof,
        {
          cacheControl: "3600",
          upsert: false,
        }
      );

    if (uploadError) {
      throw new Error(
        `Payment screenshot upload failed: ${uploadError.message}`
      );
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("payment-proofs")
      .getPublicUrl(filePath);

    return (
      publicUrlData?.publicUrl ||
      null
    );
  }

  // ==========================================================
  // VALIDATE CHECKOUT
  // ==========================================================

  function validateCheckout(): string | null {
    if (!user) {
      return "Please login before checkout.";
    }

    if (cart.length === 0) {
      return "Your cart is empty.";
    }

    if (!selectedAddress) {
      return "Please select a delivery address.";
    }

    if (
      subtotal <= 0
    ) {
      return "Invalid order amount.";
    }

    if (
      UPI_ID ===
      "YOUR_UPI_ID@upi"
    ) {
      return "Please configure your real UPI ID in Checkout.tsx.";
    }

    if (
      !transactionId.trim()
    ) {
      return "Please enter your UPI transaction/reference ID.";
    }

    if (
      paymentType ===
        "PARTIAL_ADVANCE" &&
      subtotal <= ADVANCE_AMOUNT
    ) {
      return "₹30 advance payment is not available for orders of ₹30 or less.";
    }

    return null;
  }

  // ==========================================================
  // CREATE ORDER
  // ==========================================================

  async function handlePlaceOrder() {
    try {
      setError("");

      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      const validationError =
        validateCheckout();

      if (validationError) {
        setError(validationError);
        return;
      }

      if (!user || !selectedAddress) {
        return;
      }

      setPlacingOrder(true);

      // ------------------------------------------------------
      // GENERATE ORDER NUMBER
      // ------------------------------------------------------

      const orderNumber =
        `IOT-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;

      // ------------------------------------------------------
      // PAYMENT STATUS
      //
      // User has submitted payment details.
      // Admin will verify it.
      // ------------------------------------------------------

      const paymentStatus =
        "Verification";

      // ------------------------------------------------------
      // PAYMENT METHOD
      // ------------------------------------------------------

      const paymentMethod =
        "UPI_QR";

      // ------------------------------------------------------
      // CREATE ORDER
      // ------------------------------------------------------

      const {
        data: order,
        error: orderError,
      } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,

          order_number: orderNumber,

          total_amount: subtotal,

          status: "Pending",

          payment_status:
            paymentStatus,

          payment_method:
            paymentMethod,

          paid_amount:
            onlineAmount,

          remaining_amount:
            remainingAmount,

          payment_type:
            paymentType,

          payment_reference:
            transactionId.trim(),

          shipping_name:
            selectedAddress.full_name,

          shipping_phone:
            selectedAddress.phone,

          shipping_address:
            [
              selectedAddress.address_line1,

              selectedAddress.address_line2,

              selectedAddress.landmark
                ? `Landmark: ${selectedAddress.landmark}`
                : "",
            ]
              .filter(Boolean)
              .join(", "),

          shipping_city:
            selectedAddress.city,

          shipping_state:
            selectedAddress.state,

          shipping_pincode:
            selectedAddress.pincode,
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      if (!order) {
        throw new Error(
          "Order creation failed."
        );
      }

      // ------------------------------------------------------
      // UPLOAD PAYMENT PROOF
      // ------------------------------------------------------

      let paymentProofUrl:
        | string
        | null = null;

      if (paymentProof) {
        paymentProofUrl =
          await uploadPaymentProof(
            order.id
          );

        // Save proof URL
        const {
          error: proofUpdateError,
        } = await supabase
          .from("orders")
          .update({
            payment_proof_url:
              paymentProofUrl,
          })
          .eq("id", order.id)
          .eq(
            "user_id",
            user.id
          );

        if (proofUpdateError) {
          console.error(
            "Payment proof update error:",
            proofUpdateError
          );
        }
      }

      // ------------------------------------------------------
      // CREATE ORDER ITEMS
      // ------------------------------------------------------

      const orderItems =
        cart.map((item) => ({
          order_id:
            order.id,

          product_id:
            item.product_id,

          product_name:
            item.name,

          product_image:
            item.image || null,

          price:
            Number(item.price),

          quantity:
            Number(item.quantity),

          subtotal:
            Number(item.price) *
            Number(item.quantity),
        }));

      const {
        error: orderItemsError,
      } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (orderItemsError) {
        throw orderItemsError;
      }

      // ------------------------------------------------------
      // CREATE PAYMENT RECORD
      // ------------------------------------------------------

      const {
        error: paymentRecordError,
      } = await supabase
        .from("order_payments")
        .insert({
          order_id:
            order.id,

          user_id:
            user.id,

          amount:
            onlineAmount,

          payment_method:
            "UPI_QR",

          payment_reference:
            transactionId.trim(),

          payment_proof_url:
            paymentProofUrl,

          status:
            "Pending",
        });

      if (paymentRecordError) {
        throw paymentRecordError;
      }

      // ------------------------------------------------------
      // CLEAR CART
      // ------------------------------------------------------

      const {
        error: cartClearError,
      } = await supabase
        .from("cart")
        .delete()
        .eq(
          "user_id",
          user.id
        );

      if (cartClearError) {
        console.error(
          "Cart clear error:",
          cartClearError
        );
      }

      // ------------------------------------------------------
      // GO TO SUCCESS PAGE
      // ------------------------------------------------------

      navigate(
        `/order-success?order=${encodeURIComponent(
          orderNumber
        )}`
      );
    } catch (err: any) {
      console.error(
        "Place order error:",
        err
      );

      setError(
        err?.message ||
          "Unable to place order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-sky-100 border-t-[#0284c7]" />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading checkout...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="mx-auto max-w-[1250px] px-4 py-8 lg:px-6">
        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/cart")
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-[#0284c7]"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </button>

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#0284c7]">
            IoT Hub
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#0f172b]">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Complete your order securely using
            UPI payment.
          </p>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-extrabold">
                Checkout Error
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_390px]">
          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div className="space-y-6">
            {/* =================================================
                DELIVERY ADDRESS
            ================================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-[#0284c7]">
                  <MapPin size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-[#0f172b]">
                    Delivery Address
                  </h2>

                  <p className="text-xs text-slate-500">
                    Select where your order
                    should be delivered.
                  </p>
                </div>
              </div>

              {addresses.length ===
              0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <MapPin
                    size={30}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 font-bold text-slate-700">
                    No delivery address
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Please add an address
                    before placing your
                    order.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/dashboard"
                      )
                    }
                    className="mt-5 rounded-xl bg-[#0284c7] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0369a1]"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(
                    (address) => {
                      const selected =
                        selectedAddressId ===
                        address.id;

                      return (
                        <button
                          key={
                            address.id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedAddressId(
                              address.id
                            )
                          }
                          className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                            selected
                              ? "border-[#0284c7] bg-sky-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* RADIO */}

                            <div
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                selected
                                  ? "border-[#0284c7]"
                                  : "border-slate-300"
                              }`}
                            >
                              {selected && (
                                <div className="h-2.5 w-2.5 rounded-full bg-[#0284c7]" />
                              )}
                            </div>

                            {/* ADDRESS */}

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-extrabold text-slate-800">
                                  {
                                    address.full_name
                                  }
                                </p>

                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                  {
                                    address.address_type
                                  }
                                </span>

                                {address.is_default && (
                                  <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-sm text-slate-600">
                                {
                                  address.address_line1
                                }
                              </p>

                              {address.address_line2 && (
                                <p className="text-sm text-slate-600">
                                  {
                                    address.address_line2
                                  }
                                </p>
                              )}

                              {address.landmark && (
                                <p className="text-sm text-slate-600">
                                  Landmark:{" "}
                                  {
                                    address.landmark
                                  }
                                </p>
                              )}

                              <p className="text-sm text-slate-600">
                                {
                                  address.city
                                }
                                ,{" "}
                                {
                                  address.state
                                }{" "}
                                -{" "}
                                {
                                  address.pincode
                                }
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                Phone:{" "}
                                {
                                  address.phone
                                }
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            {/* =================================================
                PAYMENT OPTION
            ================================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-[#0284c7]">
                  <Wallet size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-[#0f172b]">
                    Payment Option
                  </h2>

                  <p className="text-xs text-slate-500">
                    Choose how much you want to
                    pay online.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* FULL PAYMENT */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentType(
                      "FULL_PAYMENT"
                    )
                  }
                  className={`rounded-2xl border-2 p-5 text-left transition ${
                    paymentType ===
                    "FULL_PAYMENT"
                      ? "border-[#0284c7] bg-sky-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0284c7] shadow-sm">
                      <CreditCard size={20} />
                    </div>

                    {paymentType ===
                      "FULL_PAYMENT" && (
                      <CheckCircle2
                        size={21}
                        className="text-[#0284c7]"
                      />
                    )}
                  </div>

                  <h3 className="mt-4 font-extrabold text-slate-800">
                    Full Payment
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Pay the complete order
                    amount through UPI now.
                  </p>

                  <p className="mt-4 text-2xl font-extrabold text-[#0284c7]">
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-green-600">
                    Nothing due on delivery
                  </p>
                </button>

                {/* ₹30 ADVANCE */}

                <button
                  type="button"
                  disabled={
                    subtotal <=
                    ADVANCE_AMOUNT
                  }
                  onClick={() =>
                    setPaymentType(
                      "PARTIAL_ADVANCE"
                    )
                  }
                  className={`rounded-2xl border-2 p-5 text-left transition ${
                    paymentType ===
                    "PARTIAL_ADVANCE"
                      ? "border-[#0284c7] bg-sky-50"
                      : "border-slate-200 hover:border-slate-300"
                  } ${
                    subtotal <=
                    ADVANCE_AMOUNT
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0284c7] shadow-sm">
                      <Wallet size={20} />
                    </div>

                    {paymentType ===
                      "PARTIAL_ADVANCE" && (
                      <CheckCircle2
                        size={21}
                        className="text-[#0284c7]"
                      />
                    )}
                  </div>

                  <h3 className="mt-4 font-extrabold text-slate-800">
                    ₹30 Advance
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Pay ₹30 now and pay the
                    remaining amount when
                    delivered.
                  </p>

                  <p className="mt-4 text-2xl font-extrabold text-[#0284c7]">
                    ₹30
                  </p>

                  <p className="mt-1 text-xs font-semibold text-amber-600">
                    Remaining amount on delivery
                  </p>
                </button>
              </div>
            </section>

            {/* =================================================
                QR PAYMENT
            ================================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0f172b]">
                      Scan & Pay
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Scan this QR code using
                      any UPI app.
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                    UPI
                  </div>
                </div>
              </div>

              <div className="grid items-center gap-7 md:grid-cols-[270px_1fr]">
                {/* QR CODE */}

                <div className="flex justify-center">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <QRCodeCanvas
                      value={
                        upiPaymentUrl
                      }
                      size={220}
                      bgColor="#ffffff"
                      fgColor="#0f172b"
                      level="H"
                      includeMargin
                    />

                    <p className="mt-3 text-center text-xs font-bold text-slate-500">
                      Scan to pay
                    </p>
                  </div>
                </div>

                {/* PAYMENT INFORMATION */}

                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Pay now
                      </span>

                      <span className="text-xl font-extrabold text-[#0284c7]">
                        ₹
                        {onlineAmount.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Remaining
                        </span>

                        <span className="font-extrabold text-slate-700">
                          ₹
                          {remainingAmount.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* UPI ID */}

                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                      UPI ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm font-extrabold text-sky-900">
                      {UPI_ID}
                    </p>
                  </div>

                  {/* REMAINING */}

                  {remainingAmount >
                    0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="font-bold text-amber-800">
                        Payment on Delivery
                      </p>

                      <p className="mt-1 text-sm leading-5 text-amber-700">
                        ₹
                        {remainingAmount.toLocaleString(
                          "en-IN"
                        )}{" "}
                        will be collected when
                        your order is delivered.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* =================================================
                PAYMENT CONFIRMATION
            ================================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-extrabold text-[#0f172b]">
                  Payment Confirmation
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  After completing your UPI payment,
                  enter the transaction ID below.
                </p>
              </div>

              {/* TRANSACTION ID */}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  UPI Transaction / Reference ID
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={
                    transactionId
                  }
                  onChange={(event) =>
                    setTransactionId(
                      event.target.value
                    )
                  }
                  placeholder="Enter UPI transaction ID"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-[#0284c7] focus:ring-4 focus:ring-sky-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  You can find this number in
                  your UPI payment receipt.
                </p>
              </div>

              {/* SCREENSHOT */}

              <div className="mt-6">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Payment Screenshot
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-[#0284c7] hover:bg-sky-50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#0284c7] shadow-sm">
                    <Upload size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-700">
                      {paymentProof
                        ? paymentProof.name
                        : "Upload payment screenshot"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      PNG, JPG or JPEG • Maximum
                      5 MB
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={
                      handlePaymentScreenshot
                    }
                  />
                </label>

                {paymentProof && (
                  <p className="mt-2 text-xs font-semibold text-green-600">
                    ✓ Screenshot selected
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* HEADER */}

              <div className="border-b border-slate-200 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-[#0284c7]">
                    <Package size={20} />
                  </div>

                  <div>
                    <h2 className="font-extrabold text-[#0f172b]">
                      Order Summary
                    </h2>

                    <p className="text-xs text-slate-500">
                      {cart.length}{" "}
                      {cart.length ===
                      1
                        ? "item"
                        : "items"}{" "}
                      in your cart
                    </p>
                  </div>
                </div>
              </div>

              {/* PRODUCTS */}

              <div className="max-h-[350px] space-y-4 overflow-y-auto p-5 sm:p-6">
                {cart.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="flex gap-3"
                    >
                      {/* IMAGE */}

                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <Package
                              size={
                                20
                              }
                            />
                          </div>
                        )}
                      </div>

                      {/* NAME */}

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold text-slate-700">
                          {
                            item.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Qty:{" "}
                          {
                            item.quantity
                          }
                        </p>
                      </div>

                      {/* PRICE */}

                      <p className="shrink-0 text-sm font-extrabold text-slate-800">
                        ₹
                        {(
                          Number(
                            item.price
                          ) *
                          Number(
                            item.quantity
                          )
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* SUMMARY */}

              <div className="border-t border-slate-200 p-5 sm:p-6">
                <div className="space-y-3">
                  {/* SUBTOTAL */}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-semibold text-slate-700">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  {/* DELIVERY */}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Delivery
                    </span>

                    <span className="font-bold text-green-600">
                      Free
                    </span>
                  </div>

                  {/* TOTAL */}

                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="text-base font-extrabold text-[#0f172b]">
                      Total
                    </span>

                    <span className="text-2xl font-extrabold text-[#0f172b]">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>

                {/* PAYMENT BREAKDOWN */}

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Pay now
                    </span>

                    <span className="font-extrabold text-[#0284c7]">
                      ₹
                      {onlineAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Pay on delivery
                    </span>

                    <span className="font-bold text-slate-700">
                      ₹
                      {remainingAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>

                {/* PAYMENT TYPE */}

                <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                    Selected Payment
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-sky-900">
                    {paymentType ===
                    "FULL_PAYMENT"
                      ? "Full Payment"
                      : "₹30 Advance + Cash on Delivery"}
                  </p>
                </div>

                {/* PLACE ORDER */}

                <button
                  type="button"
                  onClick={
                    handlePlaceOrder
                  }
                  disabled={
                    placingOrder ||
                    !selectedAddress ||
                    !transactionId.trim()
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0284c7] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-sky-100 transition hover:bg-[#0369a1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placingOrder ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={19}
                      />

                      Place Order
                    </>
                  )}
                </button>

                {/* SECURITY */}

                <div className="mt-5 flex gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">
                  <ShieldCheck
                    size={21}
                    className="shrink-0 text-green-600"
                  />

                  <p className="text-xs leading-5 text-green-700">
                    Your payment information is
                    submitted securely for
                    verification. Your order will be
                    confirmed after payment verification.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}