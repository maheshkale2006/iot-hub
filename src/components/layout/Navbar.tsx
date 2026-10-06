import {
  CircleUserRound,
  Menu,
  Search,
  ShoppingCart,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { getCartCount } from "../../services/cartService";

// =====================================================
// LOGO
// =====================================================

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#0ea5e9] text-white shadow-[0_8px_22px_rgba(14,165,233,.25)]">
        <span className="grid h-5 w-5 grid-cols-2 grid-rows-2 gap-[2px] rounded-[3px] border-2 border-white p-[2px]">
          <span className="rounded-[1px] bg-white" />
          <span className="rounded-[1px] bg-white" />
          <span className="rounded-[1px] bg-white" />
          <span className="rounded-[1px] bg-white" />
        </span>
      </span>

      <span className="text-[20px] font-extrabold text-[#0f172b]">
        IoT<span className="text-[#0ea5e9]">Hub</span>
      </span>
    </Link>
  );
}

// =====================================================
// NAVBAR
// =====================================================

function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  // Logged-in user
  const [user, setUser] = useState<any>(null);

  // Profile name
  const [profileName, setProfileName] = useState("");

  // Cart count
  const [cartCount, setCartCount] = useState(0);

  // Auth loading
  const [authLoading, setAuthLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // =====================================================
  // ACTIVE NAVIGATION
  // =====================================================

  const isActive = (path: string) => {
    // Home should ONLY be active on "/"
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  // =====================================================
  // NAVIGATION STYLE
  // =====================================================

  const getNavClass = (path: string) => {
    const active = isActive(path);

    return `
      rounded-[9px]
      px-4
      py-2.5
      text-[14px]
      font-medium
      transition-all
      duration-200
      ${
        active
          ? "bg-[#eff8ff] text-[#008bd0]"
          : "text-[#475569] hover:bg-slate-50 hover:text-[#008bd0]"
      }
    `;
  };

  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        setAuthLoading(true);

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        setUser(user);

        if (user) {
          // ---------------------------------------------
          // Default name from Auth metadata
          // ---------------------------------------------

          const authName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User";

          setProfileName(authName);

          // ---------------------------------------------
          // Load profile from profiles table
          // ---------------------------------------------

          const { data: profile, error: profileError } =
            await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", user.id)
              .maybeSingle();

          if (profileError) {
            console.error(
              "PROFILE LOAD ERROR:",
              profileError
            );
          }

          if (
            mounted &&
            profile?.full_name
          ) {
            setProfileName(profile.full_name);
          }

          // ---------------------------------------------
          // Load cart count
          // ---------------------------------------------

          try {
            const count = await getCartCount();

            if (mounted) {
              setCartCount(count);
            }
          } catch (cartError) {
            console.error(
              "CART COUNT ERROR:",
              cartError
            );

            if (mounted) {
              setCartCount(0);
            }
          }
        } else {
          setProfileName("");
          setCartCount(0);
        }
      } catch (error) {
        console.error(
          "NAVBAR AUTH ERROR:",
          error
        );

        if (mounted) {
          setUser(null);
          setProfileName("");
          setCartCount(0);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    loadUser();

    // ===================================================
    // SUPABASE AUTH LISTENER
    // ===================================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser =
          session?.user ?? null;

        if (!mounted) return;

        setUser(currentUser);

        if (currentUser) {
          const authName =
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split("@")[0] ||
            "User";

          setProfileName(authName);

          // Load profile name
          const { data: profile } =
            await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", currentUser.id)
              .maybeSingle();

          if (
            mounted &&
            profile?.full_name
          ) {
            setProfileName(profile.full_name);
          }

          // Load cart count
          try {
            const count =
              await getCartCount();

            if (mounted) {
              setCartCount(count);
            }
          } catch {
            if (mounted) {
              setCartCount(0);
            }
          }
        } else {
          setProfileName("");
          setCartCount(0);
        }
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {
    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setProfileName("");
      setCartCount(0);

      setMobileMenu(false);

      navigate("/");
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );

      alert(
        "Unable to logout. Please try again."
      );
    }
  }

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  function closeMobileMenu() {
    setMobileMenu(false);
  }

  // =====================================================
  // REFRESH CART COUNT
  // =====================================================

  useEffect(() => {
    async function refreshCart() {
      if (!user) {
        setCartCount(0);
        return;
      }

      try {
        const count = await getCartCount();
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    }

    refreshCart();
  }, [user, location.pathname]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <header className="sticky top-0 z-50 h-[65px] border-b border-slate-200 bg-white shadow-[0_1px_8px_rgba(15,23,42,.08)]">

      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-4 lg:px-0">

        {/* =================================================
            LOGO
        ================================================= */}

        <Logo />

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav className="hidden items-center gap-1 lg:flex">

          {/* HOME */}

          <Link
            to="/"
            className={getNavClass("/")}
          >
            Home
          </Link>

          {/* IOT PRODUCTS */}

          <Link
            to="/shop"
            className={getNavClass("/shop")}
          >
            IoT Products
          </Link>

          {/* IOT PROJECTS */}

          <Link
            to="/iot-projects"
            className={getNavClass(
              "/iot-projects"
            )}
          >
            IoT Projects
          </Link>

          {/* CONTACT */}

          <Link
            to="/contact"
            className={getNavClass(
              "/contact"
            )}
          >
            Contact &amp; Support
          </Link>
        </nav>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="hidden items-center gap-3 lg:flex">

          {/* AI ASSISTANT */}

          <Link
            to="/ai"
            className="rounded-[9px] bg-[#0ea5e9] px-4 py-2 text-[14px] font-bold text-white transition-colors hover:bg-[#0284c7]"
          >
            🤖 AI Assistant
          </Link>

          {/* SEARCH */}

          <button
            type="button"
            className="grid h-9 w-9 place-items-center text-[#334155] transition-colors hover:text-[#0ea5e9]"
          >
            <Search size={20} />
          </button>

          {/* CART */}

          <Link
            to="/cart"
            className="relative grid h-9 w-9 place-items-center text-[#334155] transition-colors hover:text-[#0ea5e9]"
          >
            <ShoppingCart size={20} />

            {/* CART BADGE */}

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0ea5e9] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* =================================================
              AUTH SECTION
          ================================================= */}

          {authLoading ? (
            // Loading
            <div className="h-10 w-[100px] animate-pulse rounded-[9px] bg-slate-100" />
          ) : user ? (
            // =================================================
            // LOGGED IN
            // =================================================

            <div className="flex items-center gap-2">

              {/* PROFILE / DASHBOARD */}

              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-[9px] border border-slate-200 bg-white px-3.5 py-2 text-[14px] font-medium text-[#475569] transition-all duration-200 hover:border-[#0ea5e9] hover:bg-[#eff8ff] hover:text-[#008bd0]"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#eff8ff] text-[#008bd0]">
                  <CircleUserRound size={17} />
                </span>

                <span className="max-w-[110px] truncate">
                  {profileName || "Profile"}
                </span>
              </Link>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="grid h-9 w-9 place-items-center rounded-[9px] text-[#64748b] transition-all hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            // =================================================
            // LOGGED OUT
            // =================================================

            <Link
              to="/login"
              className="flex items-center gap-2 rounded-[9px] border border-slate-200 bg-white px-3.5 py-2 text-[14px] font-medium text-[#475569] transition-all duration-200 hover:border-[#0ea5e9] hover:bg-[#eff8ff] hover:text-[#008bd0] active:scale-[0.98]"
            >
              <CircleUserRound size={17} />
              Login
            </Link>
          )}
        </div>

        {/* =================================================
            MOBILE MENU BUTTON
        ================================================= */}

        <button
          type="button"
          className="text-[#334155] lg:hidden"
          onClick={() =>
            setMobileMenu(!mobileMenu)
          }
        >
          {mobileMenu ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      {mobileMenu && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 shadow-md lg:hidden">

          <div className="flex flex-col gap-1">

            {/* HOME */}

            <Link
              to="/"
              onClick={closeMobileMenu}
              className={getNavClass("/")}
            >
              Home
            </Link>

            {/* PRODUCTS */}

            <Link
              to="/shop"
              onClick={closeMobileMenu}
              className={getNavClass("/shop")}
            >
              IoT Products
            </Link>

            {/* PROJECTS */}

            <Link
              to="/iot-projects"
              onClick={closeMobileMenu}
              className={getNavClass(
                "/iot-projects"
              )}
            >
              IoT Projects
            </Link>

            {/* CONTACT */}

            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className={getNavClass(
                "/contact"
              )}
            >
              Contact &amp; Support
            </Link>

            {/* AI */}

            <Link
              to="/ai"
              onClick={closeMobileMenu}
              className="mt-2 rounded-[9px] bg-[#0ea5e9] px-4 py-2.5 text-[14px] font-bold text-white"
            >
              🤖 AI Assistant
            </Link>

            {/* CART */}

            <Link
              to="/cart"
              onClick={closeMobileMenu}
              className="mt-1 flex items-center justify-between rounded-[9px] border border-slate-200 px-4 py-2.5 text-[14px] font-medium text-[#475569]"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={17} />
                Cart
              </span>

              {cartCount > 0 && (
                <span className="rounded-full bg-[#0ea5e9] px-2 py-0.5 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* =================================================
                MOBILE AUTH
            ================================================= */}

            {authLoading ? (
              <div className="mt-1 h-10 animate-pulse rounded-[9px] bg-slate-100" />
            ) : user ? (
              <>
                {/* DASHBOARD */}

                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="mt-1 flex items-center gap-3 rounded-[9px] bg-[#eff8ff] px-4 py-2.5 text-[14px] font-semibold text-[#008bd0]"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white">
                    <CircleUserRound size={18} />
                  </span>

                  <span>
                    {profileName || "My Dashboard"}
                  </span>
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="mt-1 flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-left text-[14px] font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </>
            ) : (
              // LOGIN

              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="mt-1 flex items-center gap-2 rounded-[9px] border border-slate-200 bg-white px-4 py-2.5 text-[14px] text-[#475569] transition-all hover:border-[#0ea5e9] hover:bg-[#eff8ff] hover:text-[#008bd0]"
              >
                <CircleUserRound size={17} />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;