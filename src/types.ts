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
  city: string | null;
  lat: number;
  lng: number;
  price_range: number;
  level: string;
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

export interface Notebook {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  place_ids: number[];
  created_at: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  image: string;
  notebook_id?: string;
}
