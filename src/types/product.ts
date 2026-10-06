export interface Product {
  id: number

  name: string

  feature: string | null

  actual_price: number

  selling_price: number

  discount_percentage: number

  key_features: string[]

  description: string | null

  specifications: Record<string, string>

  compatibility: string[]

  stock: number

  category: string

  image_url: string | null

  rating: number

  review_count: number

  created_at: string

  updated_at: string
}