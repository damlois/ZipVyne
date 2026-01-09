
import { Restaurant, Product } from './types';

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'res-1',
    name: "Iya Meta Buka",
    rating: 4.8,
    deliveryTime: "20-30 min",
    deliveryFee: 500,
    image: "https://picsum.photos/seed/buka1/400/300",
    category: "Nigerian Swallows",
    location: "Ayeso Roundabout"
  },
  {
    id: 'res-2',
    name: "Express Chicken & Fries",
    rating: 4.5,
    deliveryTime: "15-25 min",
    deliveryFee: 400,
    image: "https://picsum.photos/seed/chicken/400/300",
    category: "Fast Food",
    location: "Ita Balogun"
  },
  {
    id: 'res-3',
    name: "Mama Cass Ilesha",
    rating: 4.2,
    deliveryTime: "25-40 min",
    deliveryFee: 600,
    image: "https://picsum.photos/seed/mamacass/400/300",
    category: "Continental",
    location: "Oremeji Area"
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: "Pounded Yam & Egusi Special",
    price: 3500,
    description: "Authentic Ilesha pounded yam with rich egusi soup and assorted meat.",
    image: "https://picsum.photos/seed/egusi/400/300",
    category: "Swallow",
    restaurantId: 'res-1'
  },
  {
    id: 'p2',
    name: "Jollof Rice & Grilled Chicken",
    price: 2800,
    description: "Smoky party jollof rice with a large piece of spiced grilled chicken.",
    image: "https://picsum.photos/seed/jollof/400/300",
    category: "Rice",
    restaurantId: 'res-2'
  },
  {
    id: 'p3',
    name: "Asun (Spicy Grilled Goat)",
    price: 2500,
    description: "Peppered goat meat grilled to perfection with local spices.",
    image: "https://picsum.photos/seed/asun/400/300",
    category: "Protein",
    restaurantId: 'res-1'
  }
];

export const ILESHA_NEIGHBORHOODS = [
  "Ayeso",
  "Ita Balogun",
  "Okesa",
  "Bolorunduro",
  "Iremo",
  "Isokun",
  "Ilesa Grammar School Area",
  "Roundabout"
];
