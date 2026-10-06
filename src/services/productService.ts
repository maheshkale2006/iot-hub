import { supabase } from "../lib/supabase"

export async function getPopularProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      feature,
      actual_price,
      selling_price,
      discount_percentage,
      stock,
      category,
      image_url
    `)
    .limit(8)

  console.log("PRODUCTS FROM SUPABASE:", data)
  console.log("SUPABASE ERROR:", error)

  if (error) {
    console.error("Failed to fetch products:", error)
    throw error
  }

  return data ?? []
}