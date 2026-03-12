export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string | null;
  color: string | null;
}

export interface Place {
  id: number;
  name: string;
  description: string | null;
  category_id: string;
  subcategory_id: string | null;
  address: string | null;
  lat: number;
  lng: number;
  price_range: number;
  website: string | null;
  instagram: string | null;
  gentlemap_review: string | null;
  status: string;
  created_at: string;
  avg_rating: number | null;
  review_count: number;
  is_featured?: boolean;
}

export interface Review {
  id: number;
  place_id: number;
  rating: number;
  comment: string | null;
  user_name: string | null;
  created_at: string;
}
