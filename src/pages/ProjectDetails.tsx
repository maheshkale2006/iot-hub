import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/layout/Navbar";

import {
  getProjectById,
  type Project,
} from "../services/projectService";

import {
  addProjectToCart,
  addToCart,
} from "../services/cartService";

import { supabase } from "../lib/supabase";

type StoreProduct = {
  id: number;
  name: string;
  selling_price: number;
  actual_price: number;
  stock: number;
  image_url: string | null;
  category: string;
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] =
    useState<Project | null>(null);

  const [products, setProducts] =
    useState<StoreProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [addingProduct, setAddingProduct] =
    useState<number | null>(null);

  const [addingProject, setAddingProject] =
    useState(false);

  // =========================================
  // LOAD PROJECT
  // =========================================

  useEffect(() => {
    if (!id) return;

    loadProject(Number(id));
  }, [id]);

  async function loadProject(projectId: number) {
    try {
      setLoading(true);
      setError("");

      const data =
        await getProjectById(projectId);

      if (!data) {
        setError("Project not found.");
        return;
      }

      setProject(data);

      // =====================================
      // GET LINKED PRODUCT IDS
      // =====================================

      const productIds =
        (data.components || [])
          .map(
            (component) =>
              component.product_id
          )
          .filter(
            (productId): productId is number =>
              typeof productId === "number"
          );

      if (productIds.length === 0) {
        setProducts([]);
        return;
      }

      // =====================================
      // GET PRODUCTS FROM PRODUCTS TABLE
      // =====================================

      const {
        data: productData,
        error: productError,
      } = await supabase
        .from("products")
        .select(
          "id,name,selling_price,actual_price,stock,image_url,category"
        )
        .in("id", productIds);

      if (productError) {
        throw productError;
      }

      setProducts(
        (productData || []) as StoreProduct[]
      );
    } catch (err) {
      console.error(
        "PROJECT DETAILS ERROR:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to load project."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // GET PRODUCT FOR COMPONENT
  // =========================================

  function getProduct(
    productId?: number
  ) {
    if (!productId) {
      return undefined;
    }

    return products.find(
      (product) =>
        product.id === productId
    );
  }

  // =========================================
  // PROJECT TOTAL
  // =========================================

  const projectTotal = useMemo(() => {
    if (!project) return 0;

    return project.components.reduce(
      (total, component) => {
        const product = getProduct(
          component.product_id
        );

        if (!product) {
          return total;
        }

        return (
          total +
          Number(product.selling_price) *
            (component.quantity || 1)
        );
      },
      0
    );
  }, [project, products]);

  // =========================================
  // ADD SINGLE COMPONENT
  // =========================================

  async function handleAddComponent(
    productId: number,
    quantity: number,
    componentName: string
  ) {
    try {
      setAddingProduct(productId);

      await addToCart(
        productId,
        quantity
      );

      alert(
        `${componentName} added to cart!`
      );
    } catch (err) {
      console.error(
        "ADD COMPONENT ERROR:",
        err
      );

      if (
        err instanceof Error &&
        err.message
          .toLowerCase()
          .includes("login")
      ) {
        navigate("/login");
        return;
      }

      alert(
        err instanceof Error
          ? err.message
          : "Unable to add component to cart."
      );
    } finally {
      setAddingProduct(null);
    }
  }

  // =========================================
  // ADD ENTIRE PROJECT
  // =========================================

  async function handleAddProject() {
    if (!project) return;

    try {
      setAddingProject(true);

      const result =
        await addProjectToCart(
          project.components
        );

      if (result.skippedCount > 0) {
        alert(
          `${result.addedCount} components added to cart. ${result.skippedCount} components are not currently available in the store.`
        );
      } else {
        alert(
          "All project components have been added to your cart!"
        );
      }
    } catch (err) {
      console.error(
        "ADD PROJECT ERROR:",
        err
      );

      if (
        err instanceof Error &&
        err.message
          .toLowerCase()
          .includes("login")
      ) {
        navigate("/login");
        return;
      }

      alert(
        err instanceof Error
          ? err.message
          : "Unable to add project to cart."
      );
    } finally {
      setAddingProject(false);
    }
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="h-10 w-72 animate-pulse rounded bg-slate-200" />

          <div className="mt-5 h-6 w-full max-w-2xl animate-pulse rounded bg-slate-200" />

          <div className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <h1 className="text-xl font-bold text-red-700">
              Project could not be loaded
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error || "Project not found."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/iot-projects")
              }
              className="mt-6 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Back to Projects
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================
  // MAIN PAGE
  // =========================================

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* BACK */}
        <button
          type="button"
          onClick={() =>
            navigate("/iot-projects")
          }
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-sky-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

        {/* HERO */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="grid lg:grid-cols-2">

            {/* IMAGE */}
            <div className="h-[280px] lg:h-[430px]">
              <img
                src={project.image_url}
                alt={project.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* INFO */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">

              <div className="mb-4 flex flex-wrap gap-2">

                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                  {project.category}
                </span>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                  {project.difficulty}
                </span>

              </div>

              <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {project.name}
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                {project.short_description}
              </p>

              <div className="mt-6">
                <p className="text-xs text-slate-400">
                  Estimated Project Cost
                </p>

                <p className="mt-1 text-3xl font-extrabold text-sky-600">
                  ₹
                  {Number(
                    project.estimated_cost
                  ).toLocaleString("en-IN")}
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* DESCRIPTION */}
        {project.description && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

            <h2 className="font-display text-xl font-bold text-slate-900">
              About This Project
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
              {project.description}
            </p>

          </section>
        )}

        {/* =====================================
            COMPONENTS
        ===================================== */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Components Required
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Get the components required to build this project.
              </p>
            </div>

            <div className="text-left sm:text-right">

              <p className="text-xs text-slate-400">
                Available Project Kit
              </p>

              <p className="text-2xl font-extrabold text-sky-600">
                ₹
                {projectTotal.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

          </div>

          {/* COMPONENT LIST */}
          <div className="mt-6 space-y-3">

            {project.components.map(
              (component, index) => {

                const product =
                  getProduct(
                    component.product_id
                  );

                const quantity =
                  component.quantity || 1;

                const available =
                  !!product &&
                  product.stock >= quantity;

                return (
                  <div
                    key={`${component.name}-${index}`}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                  >

                    {/* IMAGE */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">

                      {product?.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          🔧
                        </div>
                      )}

                    </div>

                    {/* COMPONENT INFO */}
                    <div className="min-w-0 flex-1">

                      <h3 className="font-semibold text-slate-900">
                        {component.name}
                      </h3>

                      {product ? (
                        <p className="mt-1 text-xs text-slate-500">
                          IoT Hub Product:{" "}
                          <span className="font-medium text-sky-600">
                            {product.name}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-amber-600">
                          This component is not currently available in the IoT Hub store.
                        </p>
                      )}

                    </div>

                    {/* QUANTITY */}
                    <div className="text-sm text-slate-500">
                      Qty:{" "}
                      <span className="font-semibold text-slate-900">
                        {quantity}
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="min-w-[90px] text-left sm:text-right">

                      {product ? (
                        <>
                          <p className="font-bold text-slate-900">
                            ₹
                            {(
                              Number(
                                product.selling_price
                              ) * quantity
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          {product.stock > 0 && (
                            <p
                              className={`mt-1 text-[11px] ${
                                available
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {available
                                ? `In stock (${product.stock})`
                                : `Only ${product.stock} available`}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Not available
                        </p>
                      )}

                    </div>

                    {/* ADD BUTTON */}
                    <button
                      type="button"
                      disabled={
                        !product ||
                        !available ||
                        addingProduct ===
                          product.id
                      }
                      onClick={() =>
                        product &&
                        handleAddComponent(
                          product.id,
                          quantity,
                          component.name
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >

                      {addingProduct ===
                      product?.id ? (
                        "Adding..."
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </>
                      )}

                    </button>

                  </div>
                );
              }
            )}

          </div>

          {/* PROJECT CART */}
          <div className="mt-6 rounded-2xl bg-sky-50 p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h3 className="font-bold text-slate-900">
                  Build the Complete Project
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Add all available linked components to your cart at once.
                </p>

              </div>

              <button
                type="button"
                disabled={
                  addingProject ||
                  project.components.every(
                    (component) =>
                      !component.product_id
                  )
                }
                onClick={
                  handleAddProject
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >

                <ShoppingCart className="h-5 w-5" />

                {addingProject
                  ? "Adding Project..."
                  : "Add Entire Project to Cart"}

              </button>

            </div>

          </div>

        </section>

        {/* =====================================
            HOW IT WORKS
        ===================================== */}

        {project.how_it_works &&
          project.how_it_works.length > 0 && (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

              <h2 className="font-display text-2xl font-bold text-slate-900">
                How It Works
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {project.how_it_works.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-slate-50 p-5"
                    >
                      <div className="text-3xl">
                        {item.icon || "🔧"}
                      </div>

                      <h3 className="mt-3 font-bold text-slate-900">
                        {item.title}
                      </h3>
                    </div>
                  )
                )}

              </div>

            </section>
          )}

        {/* =====================================
            BUILD STEPS
        ===================================== */}

        {project.build_steps &&
          project.build_steps.length > 0 && (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

              <h2 className="font-display text-2xl font-bold text-slate-900">
                Build Steps
              </h2>

              <div className="mt-6 space-y-5">

                {project.build_steps.map(
                  (step) => (
                    <div
                      key={step.step}
                      className="flex gap-4"
                    >

                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                        {step.step}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {step.title}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {step.description}
                        </p>
                      </div>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

        {/* =====================================
            CODE
        ===================================== */}

        {project.code && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-950 p-6 sm:p-8">

            <h2 className="font-display text-xl font-bold text-white">
              Source Code
            </h2>

            <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-900 p-5 text-sm leading-6 text-slate-200">
              <code>
                {project.code}
              </code>
            </pre>

          </section>
        )}

      </main>

    </div>
  );
}