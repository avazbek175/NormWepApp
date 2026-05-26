export const DEFAULT_MENU_ITEMS = [
  {
    id: "lone-star-double",
    name: "Lone Star Double Burger",
    category: "burgers",
    price: 65000,
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    description: "Ikkita olovda pishirilgan suvli mol go'shti kotleti, erigan cheddar pishlog'i, dudlangan mol go'shti beconi, qarsildoq piyoz halqalari va maxsus Texas BBQ sousi.",
    ingredients: ["Mol go'shti kotleti (x2)", "Cheddar pishlog'i", "Dudlangan becon", "Qarsildoq piyoz", "Texas BBQ sousi"],
    customization: [
      { id: "extra-cheese", name: "Qo'shimcha pishloq", price: 7000 },
      { id: "extra-patty", name: "Qo'shimcha kotlet", price: 18000 },
      { id: "jalapenos", name: "Achchiq Jalapeno", price: 4000 }
    ]
  },
  {
    id: "jalapeno-inferno",
    name: "Spicy Jalapeno Inferno",
    category: "burgers",
    price: 58000,
    rating: 4.8,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80",
    description: "Achchiqni xush ko'ruvchilar uchun! Suvli kotlet, achchiq Pepper Jack pishlog'i, grilda pishirilgan achchiq jalapeno qalampiri va achchiq chipotle sousi.",
    ingredients: ["Mol go'shti kotleti", "Pepper Jack pishlog'i", "Grildagi Jalapeno", "Chipotle sousi", "Salat bargi"],
    customization: [
      { id: "extra-cheese", name: "Qo'shimcha pishloq", price: 7000 },
      { id: "extra-sauce", name: "Ko'proq sous", price: 3000 }
    ]
  },
  {
    id: "austin-garden",
    name: "Austin Garden Classic",
    category: "burgers",
    price: 49000,
    rating: 4.7,
    reviews: 64,
    image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&q=80",
    description: "Vegetarianlar uchun ajoyib tanlov. Dudlangan o'simlik go'shtidan kotlet, barra avokado, yangi uzilgan pomidor, salat bargi va uy sharoitida tayyorlangan relish sousi.",
    ingredients: ["O'simlik kotleti", "Avokado", "Pomidor", "Salat bargi", "Relish sousi"],
    customization: [
      { id: "extra-cheese", name: "Cheddar pishlog'i", price: 7000 },
      { id: "extra-avocado", name: "Ko'proq avokado", price: 8000 }
    ]
  },
  {
    id: "texas-chili-fries",
    name: "Texas Chili Cheese Fries",
    category: "sides",
    price: 32000,
    rating: 4.9,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
    description: "Maxsus retsept bo'yicha qovurilgan qarsildoq kartoshka, ustidan quyuq Texas chili go'shtli sousi va erigan cheddar pishlog'i quyilgan.",
    ingredients: ["Fri kartoshkasi", "Texas chili sousi", "Erigan cheddar pishlog'i", "Ko'k piyoz"],
    customization: [
      { id: "extra-chili", name: "Ko'proq chili sousi", price: 6000 },
      { id: "jalapenos", name: "Achchiq Jalapeno", price: 4000 }
    ]
  },
  {
    id: "beer-onion-rings",
    name: "Shiner Bock Onion Rings",
    category: "sides",
    price: 25000,
    rating: 4.6,
    reviews: 73,
    image: "https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?w=500&q=80",
    description: "Maxsus pivo xamiriga botirib, oltin tusga kirguncha qovurilgan ulkan, shirin piyoz halqalari. Ranch sousi bilan birga yetkaziladi.",
    ingredients: ["Katta piyoz halqalari", "Maxsus xamir", "Ranch sousi"],
    customization: [
      { id: "extra-sauce", name: "Qo'shimcha Ranch sousi", price: 3000 }
    ]
  },
  {
    id: "sweet-tea",
    name: "Southern Sweet Tea",
    category: "drinks",
    price: 15000,
    rating: 4.8,
    reviews: 110,
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&q=80",
    description: "Klassik janubiy uslubda qaynatilgan muzdek shirin qora choy, limon bo'laklari va yalpiz bargi bilan.",
    ingredients: ["Qora choy", "Shakar", "Limon", "Muz", "Yalpiz"],
    customization: [
      { id: "extra-lemon", name: "Ko'proq limon", price: 1000 },
      { id: "no-sugar", name: "Shakarsiz (Achchiq)", price: 0 }
    ]
  },
  {
    id: "bourbon-shake",
    name: "Bourbon Vanilla Shake",
    category: "drinks",
    price: 28000,
    rating: 4.9,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&q=80",
    description: "Premium vanil muzqaymog'i, alkogolsiz burbon ekstrakti va karamel sousi bilan blenderda ko'pirtirilgan quyuq kokteyl.",
    ingredients: ["Vanil muzqaymog'i", "Sut", "Karamel", "Ko'pirtirilgan qaymoq"],
    customization: [
      { id: "extra-caramel", name: "Ko'proq karamel", price: 3000 }
    ]
  }
];

export const CATEGORIES = [
  { id: "all", name: "Barchasi", icon: "🍽️" },
  { id: "burgers", name: "Burgerlar", icon: "🍔" },
  { id: "sides", name: "Gazaklar", icon: "🍟" },
  { id: "drinks", name: "Ichimliklar", icon: "🥤" }
];
