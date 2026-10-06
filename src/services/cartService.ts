import { supabase } from "../lib/supabase";

export type CartItem = {
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

// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Please login to use the cart.");
  }

  return user;
}

// =====================================================
// GET CART
// =====================================================

export async function getCart(): Promise<CartItem[]> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("cart")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET CART ERROR:", error);
    throw error;
  }

  return (data ?? []) as CartItem[];
}

// =====================================================
// ADD PRODUCT TO CART
// =====================================================

export async function addToCart(
  productId: number,
  quantity: number = 1
) {
  const user = await getCurrentUser();

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  // Get product
  const {
    data: product,
    error: productError,
  } = await supabase
    .from("products")
    .select(
      "id,name,selling_price,image_url,stock"
    )
    .eq("id", productId)
    .single();

  if (productError) {
    console.error("PRODUCT FETCH ERROR:", productError);
    throw productError;
  }

  if (!product) {
    throw new Error("Product not found.");
  }

  // Check stock
  if (product.stock <= 0) {
    throw new Error(
      `${product.name} is out of stock.`
    );
  }

  // Check existing cart item
  const {
    data: existingItem,
    error: existingError,
  } = await supabase
    .from("cart")
    .select("*")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existingError) {
    console.error(
      "EXISTING CART ITEM ERROR:",
      existingError
    );
    throw existingError;
  }

  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  // Check stock against final quantity
  if (newQuantity > product.stock) {
    throw new Error(
      `Only ${product.stock} ${product.name} available in stock.`
    );
  }

  // ===================================================
  // UPDATE EXISTING CART ITEM
  // ===================================================

  if (existingItem) {
    const {
      data,
      error,
    } = await supabase
      .from("cart")
      .update({
        quantity: newQuantity,
        price: product.selling_price,
        name: product.name,
        image: product.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingItem.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error(
        "UPDATE CART ERROR:",
        error
      );
      throw error;
    }

    return data;
  }

  // ===================================================
  // INSERT NEW CART ITEM
  // ===================================================

  const {
    data,
    error,
  } = await supabase
    .from("cart")
    .insert({
      user_id: user.id,
      product_id: product.id,
      name: product.name,
      price: product.selling_price,
      image: product.image_url,
      quantity,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "INSERT CART ERROR:",
      error
    );
    throw error;
  }

  return data;
}

// =====================================================
// UPDATE CART QUANTITY
// =====================================================

export async function updateCartQuantity(
  cartId: string,
  quantity: number
) {
  const user = await getCurrentUser();

  // If quantity is zero, remove item
  if (quantity <= 0) {
    return removeFromCart(cartId);
  }

  // Find cart item
  const {
    data: cartItem,
    error: cartError,
  } = await supabase
    .from("cart")
    .select("product_id")
    .eq("id", cartId)
    .eq("user_id", user.id)
    .single();

  if (cartError) {
    throw cartError;
  }

  // Get product stock
  const {
    data: product,
    error: productError,
  } = await supabase
    .from("products")
    .select("stock,name,selling_price")
    .eq("id", cartItem.product_id)
    .single();

  if (productError) {
    throw productError;
  }

  if (quantity > product.stock) {
    throw new Error(
      `Only ${product.stock} ${product.name} available.`
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("cart")
    .update({
      quantity,
      price: product.selling_price,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error(
      "UPDATE QUANTITY ERROR:",
      error
    );
    throw error;
  }

  return data;
}

// =====================================================
// REMOVE ITEM FROM CART
// =====================================================

export async function removeFromCart(
  cartId: string
) {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("id", cartId)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "REMOVE CART ERROR:",
      error
    );
    throw error;
  }
}

// =====================================================
// CLEAR CART
// =====================================================

export async function clearCart() {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "CLEAR CART ERROR:",
      error
    );
    throw error;
  }
}

// =====================================================
// CART COUNT
// =====================================================

export async function getCartCount(): Promise<number> {
  const user = await getCurrentUser();

  const {
    data,
    error,
  } = await supabase
    .from("cart")
    .select("quantity")
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );
}

// =====================================================
// ADD COMPLETE PROJECT TO CART
// =====================================================

export async function addProjectToCart(
  components: Array<{
    name: string;
    quantity?: number;
    product_id?: number;
  }>
) {
  const linkedComponents =
    components.filter(
      (component) =>
        component.product_id !== undefined &&
        component.product_id !== null
    );

  if (linkedComponents.length === 0) {
    throw new Error(
      "No project components are connected to IoT Hub products."
    );
  }

  for (const component of linkedComponents) {
    await addToCart(
      component.product_id as number,
      component.quantity || 1
    );
  }

  return {
    addedCount: linkedComponents.length,
    skippedCount:
      components.length -
      linkedComponents.length,
  };
}