import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import {
  User,
  Package,
  MapPin,
  ShoppingCart,
  Heart,
  Settings,
  LogOut,
  Home,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Phone,
  Mail,
  MapPinned,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Menu,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { getCartCount } from "../services/cartService";

// =====================================================
// TYPES
// =====================================================

type Tab =
  | "dashboard"
  | "orders"
  | "profile"
  | "addresses"
  | "cart"
  | "wishlist"
  | "settings";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  status:
    | "Pending"
    | "Confirmed"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";
  payment_status:
    | "Pending"
    | "Paid"
    | "Failed"
    | "Refunded";
  payment_method: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: number | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

interface AddressForm {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  address_type: "Home" | "Work" | "Other";
  is_default: boolean;
}

// =====================================================
// INITIAL ADDRESS
// =====================================================

const emptyAddress: AddressForm = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  address_type: "Home",
  is_default: false,
};

// =====================================================
// DASHBOARD
// =====================================================

export default function Dashboard(){
  const navigate = useNavigate();

  // ===================================================
  // AUTH
  // ===================================================

  const [user, setUser] =
    useState<any>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  // ===================================================
  // NAVIGATION
  // ===================================================

  const [activeTab, setActiveTab] =
    useState<Tab>("dashboard");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ===================================================
  // DATA
  // ===================================================

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [orderItems, setOrderItems] =
    useState<OrderItem[]>([]);

  const [cartCount, setCartCount] =
    useState(0);

  // ===================================================
  // LOADING
  // ===================================================

  const [loading, setLoading] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingAddress, setSavingAddress] =
    useState(false);

  // ===================================================
  // MESSAGES
  // ===================================================

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ===================================================
  // PROFILE FORM
  // ===================================================

  const [profileName, setProfileName] =
    useState("");

  const [profilePhone, setProfilePhone] =
    useState("");

  // ===================================================
  // ADDRESS FORM
  // ===================================================

  const [addressModalOpen, setAddressModalOpen] =
    useState(false);

  const [editingAddress, setEditingAddress] =
    useState<Address | null>(null);

  const [addressForm, setAddressForm] =
    useState<AddressForm>(emptyAddress);

  // ===================================================
  // INITIAL AUTH
  // ===================================================

  useEffect(() => {
    checkUser();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ===================================================
  // CHECK USER
  // ===================================================

  async function checkUser() {
    try {
      setAuthLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      await Promise.all([
        loadProfile(user.id),
        loadAddresses(user.id),
        loadOrders(user.id),
        loadCartCount(),
      ]);
    } catch (err) {
      console.error(
        "DASHBOARD AUTH ERROR:",
        err
      );

      navigate("/login");
    } finally {
      setAuthLoading(false);
    }
  }

// LOAD PROFILE
// ===================================================

async function loadProfile(userId: string) {
  try {
    // Get the authenticated user directly from Supabase
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    // Get profile from public.profiles
    const {
      data,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (data) {
      // Profile exists in public.profiles
      setProfile(data);

      setProfileName(
        data.full_name ||
          authUser?.user_metadata?.full_name ||
          ""
      );

      setProfilePhone(
        data.phone ||
          authUser?.user_metadata?.phone ||
          ""
      );
    } else {
      // No profile row yet.
      // Use Supabase Auth user metadata.
      const fullName =
        authUser?.user_metadata?.full_name || "";

      const phone =
        authUser?.user_metadata?.phone || "";

      setProfileName(fullName);
      setProfilePhone(phone);

      // Create profile row in public.profiles
      const { data: newProfile, error: insertError } =
        await supabase
          .from("profiles")
          .insert({
            id: userId,
            full_name: fullName || null,
            phone: phone || null,
          })
          .select()
          .single();

      if (!insertError && newProfile) {
        setProfile(newProfile);
      } else if (insertError) {
        console.error(
          "PROFILE CREATE ERROR:",
          insertError
        );
      }
    }
  } catch (err) {
    console.error(
      "PROFILE LOAD ERROR:",
      err
    );
  }
}

  // ===================================================
  // LOAD ADDRESSES
  // ===================================================

  async function loadAddresses(
    userId: string
  ) {
    try {
      const {
        data,
        error: addressError,
      } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (addressError) {
        throw addressError;
      }

      setAddresses(
        (data ?? []) as Address[]
      );
    } catch (err) {
      console.error(
        "ADDRESS LOAD ERROR:",
        err
      );
    }
  }

  // ===================================================
  // LOAD ORDERS
  // ===================================================

  async function loadOrders(
    userId: string
  ) {
    try {
      const {
        data,
        error: orderError,
      } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        });

      if (orderError) {
        throw orderError;
      }

      setOrders(
        (data ?? []) as Order[]
      );
    } catch (err) {
      console.error(
        "ORDER LOAD ERROR:",
        err
      );
    }
  }

  // ===================================================
  // LOAD CART COUNT
  // ===================================================

  async function loadCartCount() {
    try {
      const count =
        await getCartCount();

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }

  // ===================================================
  // SAVE PROFILE
  // ===================================================

  async function saveProfile() {
    if (!user) return;

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const {
        data,
        error: saveError,
      } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name:
              profileName.trim() || null,
            phone:
              profilePhone.trim() || null,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        )
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      setProfile(data);

      setSuccess(
        "Profile updated successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "SAVE PROFILE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  // ===================================================
  // OPEN ADD ADDRESS
  // ===================================================

  function openAddAddress() {
    setEditingAddress(null);

    setAddressForm({
      ...emptyAddress,
      full_name:
        profileName ||
        user?.user_metadata?.full_name ||
        "",
      phone:
        profilePhone ||
        user?.user_metadata?.phone ||
        "",
      is_default:
        addresses.length === 0,
    });

    setAddressModalOpen(true);
    setError("");
  }

  // ===================================================
  // OPEN EDIT ADDRESS
  // ===================================================

  function openEditAddress(
    address: Address
  ) {
    setEditingAddress(address);

    setAddressForm({
      full_name: address.full_name,
      phone: address.phone,
      address_line1:
        address.address_line1,
      address_line2:
        address.address_line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark:
        address.landmark || "",
      address_type:
        address.address_type,
      is_default:
        address.is_default,
    });

    setAddressModalOpen(true);
    setError("");
  }

  // ===================================================
  // SAVE ADDRESS
  // ===================================================

  async function saveAddress() {
    if (!user) return;

    if (
      !addressForm.full_name.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.address_line1.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.pincode.trim()
    ) {
      setError(
        "Please fill all required address fields."
      );
      return;
    }

    try {
      setSavingAddress(true);
      setError("");
      setSuccess("");

      // If default address is selected,
      // remove default from all other addresses.
      if (addressForm.is_default) {
        await supabase
          .from("addresses")
          .update({
            is_default: false,
          })
          .eq("user_id", user.id);
      }

      const payload = {
        user_id: user.id,
        full_name:
          addressForm.full_name.trim(),
        phone:
          addressForm.phone.trim(),
        address_line1:
          addressForm.address_line1.trim(),
        address_line2:
          addressForm.address_line2.trim() ||
          null,
        city:
          addressForm.city.trim(),
        state:
          addressForm.state.trim(),
        pincode:
          addressForm.pincode.trim(),
        landmark:
          addressForm.landmark.trim() ||
          null,
        address_type:
          addressForm.address_type,
        is_default:
          addressForm.is_default,
        updated_at:
          new Date().toISOString(),
      };

      if (editingAddress) {
        const {
          error: updateError,
        } = await supabase
          .from("addresses")
          .update(payload)
          .eq(
            "id",
            editingAddress.id
          )
          .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }

        setSuccess(
          "Address updated successfully."
        );
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("addresses")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }

        setSuccess(
          "Address added successfully."
        );
      }

      await loadAddresses(user.id);

      setAddressModalOpen(false);
      setEditingAddress(null);
      setAddressForm(emptyAddress);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "SAVE ADDRESS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save address."
      );
    } finally {
      setSavingAddress(false);
    }
  }

  // ===================================================
  // DELETE ADDRESS
  // ===================================================

  async function deleteAddress(
    addressId: string
  ) {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const {
        error: deleteError,
      } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      await loadAddresses(user.id);

      setSuccess(
        "Address deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "DELETE ADDRESS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete address."
      );
    }
  }

  // ===================================================
  // SET DEFAULT ADDRESS
  // ===================================================

  async function setDefaultAddress(
    addressId: string
  ) {
    if (!user) return;

    try {
      await supabase
        .from("addresses")
        .update({
          is_default: false,
        })
        .eq("user_id", user.id);

      const {
        error,
      } = await supabase
        .from("addresses")
        .update({
          is_default: true,
        })
        .eq("id", addressId)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      await loadAddresses(user.id);

      setSuccess(
        "Default address updated."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "DEFAULT ADDRESS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update default address."
      );
    }
  }

  // ===================================================
  // LOAD ORDER DETAILS
  // ===================================================

  async function openOrder(
    order: Order
  ) {
    setSelectedOrder(order);

    try {
      const {
        data,
        error: itemError,
      } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", {
          ascending: true,
        });

      if (itemError) {
        throw itemError;
      }

      setOrderItems(
        (data ?? []) as OrderItem[]
      );
    } catch (err) {
      console.error(
        "ORDER ITEMS ERROR:",
        err
      );

      setOrderItems([]);
    }
  }

  // ===================================================
  // LOGOUT
  // ===================================================

  async function handleLogout() {
    try {
      const {
        error: logoutError,
      } = await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      navigate("/login");
    } catch (err) {
      console.error(
        "LOGOUT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to logout."
      );
    }
  }

  // ===================================================
  // TAB CHANGE
  // ===================================================

  function changeTab(tab: Tab) {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setSelectedOrder(null);
    setError("");
  }

  // ===================================================
  // STATUS ICON
  // ===================================================

  function getStatusIcon(
    status: Order["status"]
  ) {
    if (status === "Delivered") {
      return (
        <CheckCircle
          size={16}
        />
      );
    }

    if (status === "Cancelled") {
      return (
        <XCircle
          size={16}
        />
      );
    }

    if (
      status === "Shipped"
    ) {
      return (
        <Truck
          size={16}
        />
      );
    }

    return (
      <Clock
        size={16}
      />
    );
  }

  // ===================================================
  // STATUS CLASS
  // ===================================================

  function getStatusClass(
    status: Order["status"]
  ) {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      case "Shipped":
        return "bg-blue-100 text-blue-700";

      case "Processing":
        return "bg-purple-100 text-purple-700";

      case "Confirmed":
        return "bg-cyan-100 text-cyan-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  // ===================================================
  // FORMAT DATE
  // ===================================================

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#0284c7] border-t-transparent" />

          <p className="mt-4 text-sm text-[#64748b]">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // NO USER
  // ===================================================

  if (!user) {
    return null;
  }

  // ===================================================
  // SIDEBAR ITEMS
  // ===================================================

  const sidebarItems: {
    id: Tab;
    label: string;
    icon: any;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "orders",
      label: "My Orders",
      icon: Package,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: MapPin,
    },
    {
      id: "cart",
      label: "My Cart",
      icon: ShoppingCart,
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: Heart,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  // ===================================================
  // RENDER
  // ===================================================

return (
  <div className="min-h-screen bg-[#f8fafc]">

    {/* MAIN WEBSITE NAVBAR */}
    <Navbar />

    {/* =================================================
        MAIN
    ================================================= */}

    <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6 lg:py-8">

      {/* MESSAGES */}

      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="w-full shrink-0 lg:w-[245px]">

            <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">

              {/* USER */}

              <div className="border-b border-[#e2e8f0] bg-gradient-to-br from-[#eff8ff] to-white p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0284c7] text-white">
                    <User
                      size={23}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-[#0f172b]">
                      {profileName ||
                        "Welcome"}
                    </p>

                    <p className="truncate text-[11px] text-[#64748b]">
                      {user.email}
                    </p>
                  </div>

                </div>
              </div>

              {/* NAVIGATION */}

              <nav className="p-2">

                {sidebarItems.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    const active =
                      activeTab ===
                      item.id;

                    return (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        onClick={() =>
                          changeTab(
                            item.id
                          )
                        }
                        className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition ${
                          active
                            ? "bg-[#e0f2fe] text-[#0284c7]"
                            : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172b]"
                        }`}
                      >
                        <Icon
                          size={18}
                        />

                        <span>
                          {
                            item.label
                          }
                        </span>

                        {item.id ===
                          "cart" &&
                          cartCount >
                            0 && (
                            <span className="ml-auto rounded-full bg-[#0284c7] px-2 py-0.5 text-[10px] font-bold text-white">
                              {
                                cartCount
                              }
                            </span>
                          )}
                      </button>
                    );
                  }
                )}

                <div className="my-2 border-t border-[#e2e8f0]" />

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold text-red-500 transition hover:bg-red-50"
                >
                  <LogOut
                    size={18}
                  />
                  Logout
                </button>
              </nav>
            </div>

            {/* HELP CARD */}

            <div className="mt-4 rounded-2xl bg-[#0f172b] p-5 text-white">
              <p className="text-sm font-bold">
                Need Help?
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-300">
                Contact IoT Hub support for help with your order or account.
              </p>

              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#38bdf8]"
              >
                Contact Support
                <ChevronRight
                  size={14}
                />
              </Link>
            </div>
          </aside>

          {/* =================================================
              CONTENT
          ================================================= */}

          <section className="min-w-0 flex-1">

            {/* =================================================
                DASHBOARD
            ================================================= */}

            {activeTab ===
              "dashboard" && (
              <div>

                <div className="mb-6">
                  <h1 className="text-[26px] font-extrabold text-[#0f172b]">
                    Welcome back,{" "}
                    {profileName ||
                      "User"}{" "}
                    👋
                  </h1>

                  <p className="mt-1 text-sm text-[#64748b]">
                    Manage your IoT Hub account, orders and addresses.
                  </p>
                </div>

                {/* STAT CARDS */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <button
                    type="button"
                    onClick={() =>
                      changeTab(
                        "orders"
                      )
                    }
                    className="rounded-2xl border border-[#e2e8f0] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0284c7]">
                        <Package
                          size={21}
                        />
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-[#94a3b8]"
                      />
                    </div>

                    <p className="mt-4 text-2xl font-extrabold text-[#0f172b]">
                      {
                        orders.length
                      }
                    </p>

                    <p className="mt-1 text-xs text-[#64748b]">
                      Total Orders
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeTab(
                        "orders"
                      )
                    }
                    className="rounded-2xl border border-[#e2e8f0] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706]">
                        <Clock
                          size={21}
                        />
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-[#94a3b8]"
                      />
                    </div>

                    <p className="mt-4 text-2xl font-extrabold text-[#0f172b]">
                      {
                        orders.filter(
                          (order) =>
                            order.status !==
                              "Delivered" &&
                            order.status !==
                              "Cancelled"
                        ).length
                      }
                    </p>

                    <p className="mt-1 text-xs text-[#64748b]">
                      Active Orders
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeTab(
                        "addresses"
                      )
                    }
                    className="rounded-2xl border border-[#e2e8f0] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dcfce7] text-[#16a34a]">
                        <MapPin
                          size={21}
                        />
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-[#94a3b8]"
                      />
                    </div>

                    <p className="mt-4 text-2xl font-extrabold text-[#0f172b]">
                      {
                        addresses.length
                      }
                    </p>

                    <p className="mt-1 text-xs text-[#64748b]">
                      Saved Addresses
                    </p>
                  </button>

                  <Link
                    to="/cart"
                    className="rounded-2xl border border-[#e2e8f0] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fce7f3] text-[#db2777]">
                        <ShoppingCart
                          size={21}
                        />
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-[#94a3b8]"
                      />
                    </div>

                    <p className="mt-4 text-2xl font-extrabold text-[#0f172b]">
                      {
                        cartCount
                      }
                    </p>

                    <p className="mt-1 text-xs text-[#64748b]">
                      Cart Items
                    </p>
                  </Link>
                </div>

                {/* RECENT ORDERS */}

                <div className="mt-6 rounded-2xl border border-[#e2e8f0] bg-white">

                  <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
                    <div>
                      <h2 className="font-bold text-[#0f172b]">
                        Recent Orders
                      </h2>

                      <p className="mt-0.5 text-xs text-[#94a3b8]">
                        Your latest purchases
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        changeTab(
                          "orders"
                        )
                      }
                      className="text-xs font-bold text-[#0284c7]"
                    >
                      View All →
                    </button>
                  </div>

                  {orders.length ===
                  0 ? (
                    <div className="px-5 py-12 text-center">
                      <Package
                        size={38}
                        className="mx-auto text-[#cbd5e1]"
                      />

                      <p className="mt-3 text-sm font-semibold text-[#475569]">
                        No orders yet
                      </p>

                      <Link
                        to="/shop"
                        className="mt-4 inline-block rounded-lg bg-[#0284c7] px-4 py-2 text-xs font-bold text-white"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e2e8f0]">
                      {orders
                        .slice(
                          0,
                          5
                        )
                        .map(
                          (
                            order
                          ) => (
                            <button
                              key={
                                order.id
                              }
                              type="button"
                              onClick={() =>
                                openOrder(
                                  order
                                )
                              }
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#f8fafc]"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#0284c7]">
                                  <Package
                                    size={
                                      18
                                    }
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-[#0f172b]">
                                    {
                                      order.order_number
                                    }
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                                    {
                                      formatDate(
                                        order.created_at
                                      )
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-3">
                                <div className="text-right">
                                  <p className="text-sm font-bold text-[#0f172b]">
                                    ₹
                                    {Number(
                                      order.total_amount
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>

                                  <span
                                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${getStatusClass(
                                      order.status
                                    )}`}
                                  >
                                    {getStatusIcon(
                                      order.status
                                    )}

                                    {
                                      order.status
                                    }
                                  </span>
                                </div>

                                <ChevronRight
                                  size={
                                    17
                                  }
                                  className="text-[#94a3b8]"
                                />
                              </div>
                            </button>
                          )
                        )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                ORDERS
            ================================================= */}

            {activeTab ===
              "orders" && (
              <div>

                {selectedOrder ? (
                  <div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedOrder(
                          null
                        )
                      }
                      className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#0284c7]"
                    >
                      <ArrowLeft
                        size={17}
                      />
                      Back to Orders
                    </button>

                    <div className="mb-5">
                      <h1 className="text-[24px] font-extrabold text-[#0f172b]">
                        Order Details
                      </h1>

                      <p className="mt-1 text-sm text-[#64748b]">
                        {
                          selectedOrder.order_number
                        }{" "}
                        •{" "}
                        {formatDate(
                          selectedOrder.created_at
                        )}
                      </p>
                    </div>

                    {/* ORDER STATUS */}

                    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5">

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <div>
                          <p className="text-xs text-[#94a3b8]">
                            Order Status
                          </p>

                          <span
                            className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                              selectedOrder.status
                            )}`}
                          >
                            {getStatusIcon(
                              selectedOrder.status
                            )}

                            {
                              selectedOrder.status
                            }
                          </span>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-[#94a3b8]">
                            Total
                          </p>

                          <p className="mt-1 text-xl font-extrabold text-[#0284c7]">
                            ₹
                            {Number(
                              selectedOrder.total_amount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* ITEMS */}

                    <div className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white">

                      <div className="border-b border-[#e2e8f0] px-5 py-4">
                        <h2 className="font-bold text-[#0f172b]">
                          Order Items
                        </h2>
                      </div>

                      {orderItems.length ===
                      0 ? (
                        <div className="p-8 text-center text-sm text-[#94a3b8]">
                          No item details available.
                        </div>
                      ) : (
                        <div className="divide-y divide-[#e2e8f0]">
                          {orderItems.map(
                            (
                              item
                            ) => (
                              <div
                                key={
                                  item.id
                                }
                                className="flex items-center gap-4 px-5 py-4"
                              >
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f1f5f9]">
                                  {item.product_image ? (
                                    <img
                                      src={
                                        item.product_image
                                      }
                                      alt={
                                        item.product_name
                                      }
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      📦
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-[#0f172b]">
                                    {
                                      item.product_name
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-[#64748b]">
                                    ₹
                                    {Number(
                                      item.price
                                    ).toLocaleString(
                                      "en-IN"
                                    )}{" "}
                                    ×{" "}
                                    {
                                      item.quantity
                                    }
                                  </p>
                                </div>

                                <p className="text-sm font-bold text-[#0f172b]">
                                  ₹
                                  {Number(
                                    item.subtotal
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* SHIPPING */}

                    <div className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white p-5">

                      <h2 className="font-bold text-[#0f172b]">
                        Delivery Address
                      </h2>

                      <div className="mt-4 flex gap-3">
                        <MapPin
                          size={18}
                          className="mt-0.5 shrink-0 text-[#0284c7]"
                        />

                        <div className="text-sm text-[#475569]">
                          <p className="font-bold text-[#0f172b]">
                            {
                              selectedOrder.shipping_name
                            }
                          </p>

                          <p className="mt-1">
                            {
                              selectedOrder.shipping_phone
                            }
                          </p>

                          <p className="mt-1">
                            {
                              selectedOrder.shipping_address
                            }
                          </p>

                          <p>
                            {
                              selectedOrder.shipping_city
                            }
                            ,{" "}
                            {
                              selectedOrder.shipping_state
                            }{" "}
                            -{" "}
                            {
                              selectedOrder.shipping_pincode
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>

                    <div className="mb-6">
                      <h1 className="text-[26px] font-extrabold text-[#0f172b]">
                        My Orders
                      </h1>

                      <p className="mt-1 text-sm text-[#64748b]">
                        Track and manage your IoT Hub orders.
                      </p>
                    </div>

                    {orders.length ===
                    0 ? (
                      <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-16 text-center">
                        <Package
                          size={45}
                          className="mx-auto text-[#cbd5e1]"
                        />

                        <h3 className="mt-4 font-bold text-[#334155]">
                          No Orders Yet
                        </h3>

                        <p className="mt-1 text-sm text-[#94a3b8]">
                          Your completed orders will appear here.
                        </p>

                        <Link
                          to="/shop"
                          className="mt-5 inline-flex rounded-lg bg-[#0284c7] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0369a1]"
                        >
                          Browse Products
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map(
                          (
                            order
                          ) => (
                            <button
                              key={
                                order.id
                              }
                              type="button"
                              onClick={() =>
                                openOrder(
                                  order
                                )
                              }
                              className="w-full rounded-2xl border border-[#e2e8f0] bg-white p-5 text-left transition hover:border-[#bae6fd] hover:shadow-md"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-4">

                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0284c7]">
                                    <Package
                                      size={
                                        20
                                      }
                                    />
                                  </div>

                                  <div>
                                    <p className="font-bold text-[#0f172b]">
                                      {
                                        order.order_number
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-[#94a3b8]">
                                      {
                                        formatDate(
                                          order.created_at
                                        )
                                      }
                                    </p>
                                  </div>
                                </div>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${getStatusClass(
                                    order.status
                                  )}`}
                                >
                                  {getStatusIcon(
                                    order.status
                                  )}

                                  {
                                    order.status
                                  }
                                </span>
                              </div>

                              <div className="mt-5 flex items-end justify-between border-t border-[#f1f5f9] pt-4">
                                <div>
                                  <p className="text-[11px] text-[#94a3b8]">
                                    Total Amount
                                  </p>

                                  <p className="mt-1 text-lg font-extrabold text-[#0284c7]">
                                    ₹
                                    {Number(
                                      order.total_amount
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                </div>

                                <span className="flex items-center gap-1 text-xs font-bold text-[#0284c7]">
                                  View Details
                                  <ChevronRight
                                    size={
                                      15
                                    }
                                  />
                                </span>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                PROFILE
            ================================================= */}

            {activeTab ===
              "profile" && (
              <div>

                <div className="mb-6">
                  <h1 className="text-[26px] font-extrabold text-[#0f172b]">
                    My Profile
                  </h1>

                  <p className="mt-1 text-sm text-[#64748b]">
                    Manage your personal information.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-7">

                  {/* PROFILE HEADER */}

                  <div className="flex flex-col gap-4 border-b border-[#e2e8f0] pb-6 sm:flex-row sm:items-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e0f2fe] text-[#0284c7]">
                      <User
                        size={36}
                      />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-[#0f172b]">
                        {profileName ||
                          "Your Name"}
                      </h2>

                      <p className="mt-1 text-sm text-[#64748b]">
                        {user.email}
                      </p>

                      <p className="mt-1 text-xs text-[#94a3b8]">
                        IoT Hub Customer
                      </p>
                    </div>
                  </div>

                  {/* FORM */}

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#475569]">
                        Full Name
                      </label>

                      <div className="relative">
                        <User
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                        />

                        <input
                          value={
                            profileName
                          }
                          onChange={(
                            e
                          ) =>
                            setProfileName(
                              e.target.value
                            )
                          }
                          placeholder="Enter your full name"
                          className="w-full rounded-xl border border-[#dce5ee] bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#475569]">
                        Phone Number
                      </label>

                      <div className="relative">
                        <Phone
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                        />

                        <input
                          value={
                            profilePhone
                          }
                          onChange={(
                            e
                          ) =>
                            setProfilePhone(
                              e.target.value
                            )
                          }
                          placeholder="Enter phone number"
                          className="w-full rounded-xl border border-[#dce5ee] bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-bold text-[#475569]">
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                        />

                        <input
                          value={
                            user.email ||
                            ""
                          }
                          disabled
                          className="w-full cursor-not-allowed rounded-xl border border-[#e2e8f0] bg-[#f8fafc] py-3 pl-10 pr-3 text-sm text-[#64748b]"
                        />
                      </div>

                      <p className="mt-1.5 text-[11px] text-[#94a3b8]">
                        Email is managed through your account authentication.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={
                        saveProfile
                      }
                      disabled={
                        savingProfile
                      }
                      className="flex items-center gap-2 rounded-xl bg-[#0284c7] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0369a1] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save
                        size={17}
                      />

                      {savingProfile
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                ADDRESSES TOP BAR
            ================================================= */}

            {activeTab ===
              "addresses" && (
              <div>

                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div>
                    <h1 className="text-[26px] font-extrabold text-[#0f172b]">
                      My Addresses
                    </h1>

                    <p className="mt-1 text-sm text-[#64748b]">
                      Manage your delivery addresses.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      openAddAddress
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0284c7] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0369a1]"
                  >
                    <Plus
                      size={17}
                    />
                    Add Address
                  </button>
                </div>

                {addresses.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-16 text-center">
                    <MapPin
                      size={42}
                      className="mx-auto text-[#cbd5e1]"
                    />

                    <h3 className="mt-4 font-bold text-[#334155]">
                      No Saved Addresses
                    </h3>

                    <p className="mt-1 text-sm text-[#94a3b8]">
                      Add an address for faster checkout.
                    </p>

                    <button
                      type="button"
                      onClick={
                        openAddAddress
                      }
                      className="mt-5 rounded-lg bg-[#0284c7] px-5 py-2.5 text-sm font-bold text-white"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">

                    {addresses.map(
                      (
                        address
                      ) => (
                        <div
                          key={
                            address.id
                          }
                          className={`rounded-2xl border bg-white p-5 ${
                            address.is_default
                              ? "border-[#0284c7] ring-1 ring-[#0284c7]/20"
                              : "border-[#e2e8f0]"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e0f2fe] text-[#0284c7]">
                                {address.address_type ===
                                "Home" ? (
                                  <Home
                                    size={
                                      17
                                    }
                                  />
                                ) : (
                                  <MapPinned
                                    size={
                                      17
                                    }
                                  />
                                )}
                              </div>

                              <div>
                                <p className="text-sm font-bold text-[#0f172b]">
                                  {
                                    address.address_type
                                  }
                                </p>

                                {address.is_default && (
                                  <span className="text-[10px] font-bold text-[#0284c7]">
                                    Default Address
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditAddress(
                                    address
                                  )
                                }
                                className="rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0284c7]"
                              >
                                <Pencil
                                  size={
                                    15
                                  }
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteAddress(
                                    address.id
                                  )
                                }
                                className="rounded-lg p-2 text-[#64748b] hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2
                                  size={
                                    15
                                  }
                                />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 space-y-1 text-sm text-[#64748b]">
                            <p className="font-bold text-[#334155]">
                              {
                                address.full_name
                              }
                            </p>

                            <p>
                              {
                                address.phone
                              }
                            </p>

                            <p className="pt-1">
                              {
                                address.address_line1
                              }
                            </p>

                            {address.address_line2 && (
                              <p>
                                {
                                  address.address_line2
                                }
                              </p>
                            )}

                            {address.landmark && (
                              <p>
                                Landmark:{" "}
                                {
                                  address.landmark
                                }
                              </p>
                            )}

                            <p>
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
                          </div>

                          {!address.is_default && (
                            <button
                              type="button"
                              onClick={() =>
                                setDefaultAddress(
                                  address.id
                                )
                              }
                              className="mt-4 text-xs font-bold text-[#0284c7] hover:underline"
                            >
                              Make Default
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                CART
            ================================================= */}

            {activeTab ===
              "cart" && (
              <div>

                <div className="mb-6">
                  <h1 className="text-[26px] font-extrabold text-[#0f172b]">
                    My Cart
                  </h1>

                  <p className="mt-1 text-sm text-[#64748b]">
                    Review your selected IoT components.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center">

                  <ShoppingCart
                    size={45}
                    className="mx-auto text-[#0284c7]"
                  />

                  <h3 className="mt-4 font-bold text-[#0f172b]">
                    {cartCount > 0
                      ? `${cartCount} item${
                          cartCount !==
                          1
                            ? "s"
                            : ""
                        } in your cart`
                      : "Your cart is empty"}
                  </h3>

                  <p className="mt-1 text-sm text-[#64748b]">
                    Open your cart to review items and continue to checkout.
                  </p>

                  <Link
                    to="/cart"
                    className="mt-5 inline-flex rounded-xl bg-[#0284c7] px-5 py-3 text-sm font-bold text-white hover:bg-[#0369a1]"
                  >
                    Open Cart
                  </Link>
                </div>
              </div>
            )}

            {/* =================================================
                WISHLIST
            ================================================= */}

            {activeTab ===
              "wishlist" && (
              <div>

                <div className="mb-6">
                  <h1 className="text-[26px] font-extrabold text-[#0f172b]">
                    Wishlist
                  </h1>

                  <p className="mt-1 text-sm text-[#64748b]">
                    Products you want to save for later.
                  </p>
                </div>

                <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-16 text-center">

                  <Heart
                    size={44}
                    className="mx-auto text-[#f472b6]"
                  />

                  <h3 className="mt-4 font-bold text-[#334155]">
                    Wishlist Coming Soon
                  </h3>

                  <p className="mx-auto mt-1 max-w-md text-sm text-[#94a3b8]">
                    You can add a wishlist table later to save your favorite IoT components.
                  </p>

                  <Link
                    to="/shop"
                    className="mt-5 inline-flex rounded-lg bg-[#0284c7] px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            )}

            {/* =================================================
                SETTINGS
            ================================================= */}

            {activeTab ===
              "settings" && (
              <div>

                <div className="mb-6">
                  <h1 className="text-[26px] font-extrabold text-[#0f172b]">
                    Settings
                  </h1>

                  <p className="mt-1 text-sm text-[#64748b]">
                    Manage your account preferences.
                  </p>
                </div>

                <div className="space-y-4">

                  {/* ACCOUNT */}

                  <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5">

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0284c7]">
                        <Settings
                          size={19}
                        />
                      </div>

                      <div>
                        <h2 className="font-bold text-[#0f172b]">
                          Account Settings
                        </h2>

                        <p className="text-xs text-[#94a3b8]">
                          Manage your IoT Hub account.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 divide-y divide-[#e2e8f0]">

                      <div className="flex items-center justify-between py-4">
                        <div>
                          <p className="text-sm font-semibold text-[#334155]">
                            Email
                          </p>

                          <p className="mt-1 text-xs text-[#94a3b8]">
                            {
                              user.email
                            }
                          </p>
                        </div>

                        <Mail
                          size={18}
                          className="text-[#94a3b8]"
                        />
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div>
                          <p className="text-sm font-semibold text-[#334155]">
                            Account ID
                          </p>

                          <p className="mt-1 max-w-[230px] truncate text-xs text-[#94a3b8]">
                            {
                              user.id
                            }
                          </p>
                        </div>

                        <User
                          size={18}
                          className="text-[#94a3b8]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* LOGOUT */}

                  <div className="rounded-2xl border border-red-100 bg-white p-5">

                    <h2 className="font-bold text-[#0f172b]">
                      Sign Out
                    </h2>

                    <p className="mt-1 text-sm text-[#64748b]">
                      Sign out from your IoT Hub account on this device.
                    </p>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      <LogOut
                        size={17}
                      />
                      Logout
                    </button>
                  </div>

                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* =====================================================
          ADDRESS MODAL
      ===================================================== */}

      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-[650px] overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e2e8f0] bg-white px-5 py-4">

              <div>
                <h2 className="text-lg font-extrabold text-[#0f172b]">
                  {editingAddress
                    ? "Edit Address"
                    : "Add New Address"}
                </h2>

                <p className="mt-0.5 text-xs text-[#94a3b8]">
                  Enter your delivery information.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAddressModalOpen(
                    false
                  )
                }
                className="rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <div className="grid gap-4 p-5 sm:grid-cols-2">

              {/* NAME */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  Full Name *
                </label>

                <input
                  value={
                    addressForm.full_name
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      full_name:
                        e.target.value,
                    })
                  }
                  placeholder="Mahesh Kale"
                  className="w-full rounded-xl border border-[#dce5ee] px-3 py-3 text-sm outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  Phone *
                </label>

                <input
                  value={
                    addressForm.phone
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      phone:
                        e.target.value,
                    })
                  }
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-xl border border-[#dce5ee] px-3 py-3 text-sm outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                />
              </div>

              {/* ADDRESS */}

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  Address Line 1 *
                </label>

                <input
                  value={
                    addressForm.address_line1
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      address_line1:
                        e.target.value,
                    })
                  }
                  placeholder="House / Flat / Street"
                  className="w-full rounded-xl border border-[#dce5ee] px-3 py-3 text-sm outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  Address Line 2
                </label>

                <input
                  value={
                    addressForm.address_line2
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      address_line2:
                        e.target.value,
                    })
                  }
                  placeholder="Area / Locality"
                  className="w-full rounded-xl border border-[#dce5ee] px-3 py-3 text-sm outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                />
              </div>

              {/* CITY */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  City *
                </label>

                <input
                  value={
                    addressForm.city
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      city: e.target.value,
                    })
                  }
                  placeholder="Kopargaon"
                  className="w-full rounded-xl border border-[#dce5ee] px-3 py-3 text-sm outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                />
              </div>

              {/* STATE */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  State *
                </label>

                <input
                  value={
                    addressForm.state
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      state:
                        e.target.value,
                    })
                  }
                  placeholder="Maharashtra"
                  className="w-full rounded-xl border border-[#dce5ee] px-3 py-3 text-sm outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                />
              </div>

              {/* PINCODE */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  Pincode *
                </label>

                <input
                  value={
                    addressForm.pincode
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      pincode:
                        e.target.value,
                    })
                  }
                  placeholder="423601"
                  maxLength={6}
                  className="w-full rounded-xl border border-[#dce5ee] px-3 py-3 text-sm outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                />
              </div>

              {/* LANDMARK */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  Landmark
                </label>

                <input
                  value={
                    addressForm.landmark
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      landmark:
                        e.target.value,
                    })
                  }
                  placeholder="Near..."
                  className="w-full rounded-xl border border-[#dce5ee] px-3 py-3 text-sm outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                />
              </div>

              {/* TYPE */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#475569]">
                  Address Type
                </label>

                <select
                  value={
                    addressForm.address_type
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      address_type:
                        e.target.value as
                          | "Home"
                          | "Work"
                          | "Other",
                    })
                  }
                  className="w-full rounded-xl border border-[#dce5ee] bg-white px-3 py-3 text-sm outline-none focus:border-[#0284c7]"
                >
                  <option value="Home">
                    Home
                  </option>
                  <option value="Work">
                    Work
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* DEFAULT */}

              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id="default-address"
                  type="checkbox"
                  checked={
                    addressForm.is_default
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      is_default:
                        e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#0284c7]"
                />

                <label
                  htmlFor="default-address"
                  className="text-xs font-semibold text-[#475569]"
                >
                  Make this my default delivery address
                </label>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#e2e8f0] bg-white px-5 py-4">

              <button
                type="button"
                onClick={() =>
                  setAddressModalOpen(
                    false
                  )
                }
                className="rounded-xl border border-[#dce5ee] px-5 py-2.5 text-sm font-bold text-[#475569] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  saveAddress
                }
                disabled={
                  savingAddress
                }
                className="flex items-center gap-2 rounded-xl bg-[#0284c7] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0369a1] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />

                {savingAddress
                  ? "Saving..."
                  : editingAddress
                  ? "Update Address"
                  : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}