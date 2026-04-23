import OutOfStockAlerts from "@/components/AllProducts/OutOfStockAlerts/OutOfStockAlerts";
import { TProduct } from "@/types/product.type";

const mockProducts: TProduct[] = [
  {
    _id: "P-001",
    productId: "PROD-001",
    sku: "PIZZA-MARG-01",
    name: "Margherita Pizza",
    slug: "margherita-pizza",
    description: "Classic cheese and tomato pizza.",
    isDeleted: false,
    isApproved: true,
    category: {
      _id: "C-1",
      name: "Pizza",
    },
    pricing: {
      price: 12,
      finalPrice: 12,
      currency: "€",
    },
    variations: [],
    addonGroups: [],
    stock: {
      quantity: 0,
      unit: "items",
      availabilityStatus: "Out of Stock",
      hasVariations: false,
    },
    images: [
      "https://res.cloudinary.com/dmbyhqmbf/image/upload/v1775284749/fooml89g9bp-1775284749009-files-p1.jpg",
    ],
    vendorId: {
      _id: "V-1",
      businessDetails: {
        businessName: "Pizza Palace",
        businessType: "Restaurant",
      },
      businessLocation: {
        latitude: 0,
        longitude: 0,
      },
      documents: {
        storePhoto: "",
      },
    },
    meta: {
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    _id: "P-002",
    productId: "PROD-002",
    sku: "SUSHI-PLAT-01",
    name: "Deluxe Sushi Platter",
    slug: "deluxe-sushi-platter",
    description: "Assorted premium sushi.",
    isDeleted: false,
    isApproved: true,
    category: {
      _id: "C-2",
      name: "Sushi",
    },
    pricing: {
      price: 45,
      finalPrice: 45,
      currency: "€",
    },
    variations: [],
    addonGroups: [],
    stock: {
      quantity: 3,
      unit: "platters",
      availabilityStatus: "Limited",
      hasVariations: false,
    },
    images: [
      "https://res.cloudinary.com/dmbyhqmbf/image/upload/v1775284749/fooml89g9bp-1775284749009-files-p1.jpg",
    ],
    vendorId: {
      _id: "V-2",
      businessDetails: {
        businessName: "Tokyo Bites",
        businessType: "Restaurant",
      },
      businessLocation: {
        latitude: 0,
        longitude: 0,
      },
      documents: {
        storePhoto: "",
      },
    },
    meta: {
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    _id: "P-003",
    productId: "PROD-003",
    sku: "BURGER-CUST-01",
    name: "Custom Build Burger",
    slug: "custom-build-burger",
    description: "Build your own burger.",
    isDeleted: false,
    isApproved: true,
    category: {
      _id: "C-3",
      name: "Burgers",
    },
    pricing: {
      price: 10,
      finalPrice: 10,
      currency: "€",
    },
    variations: [
      {
        name: "Patty Type",
        options: [
          {
            label: "Beef",
            price: 0,
            stockQuantity: 50,
            sku: "BEEF-01",
            isOutOfStock: false,
            totalAddedQuantity: 0,
          },
          {
            label: "Chicken",
            price: 0,
            stockQuantity: 2,
            sku: "CHK-01",
            isOutOfStock: false,
            totalAddedQuantity: 0,
          },
          {
            label: "Veggie",
            price: 0,
            stockQuantity: 0,
            sku: "VEG-01",
            isOutOfStock: true,
            totalAddedQuantity: 0,
          },
        ],
      },
    ],
    addonGroups: [],
    stock: {
      quantity: 52,
      unit: "items",
      availabilityStatus: "Limited",
      hasVariations: true,
    },
    images: [
      "https://res.cloudinary.com/dmbyhqmbf/image/upload/v1775284749/fooml89g9bp-1775284749009-files-p1.jpg",
    ],
    vendorId: {
      _id: "V-3",
      businessDetails: {
        businessName: "Burger Joint",
        businessType: "Restaurant",
      },
      businessLocation: {
        latitude: 0,
        longitude: 0,
      },
      documents: {
        storePhoto: "",
      },
    },
    meta: {
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    _id: "P-004",
    productId: "PROD-004",
    sku: "DRINK-COLA-01",
    name: "Cola Drink",
    slug: "cola-drink",
    description: "Refreshing cola.",
    isDeleted: false,
    isApproved: true,
    category: {
      _id: "C-4",
      name: "Beverages",
    },
    pricing: {
      price: 2.5,
      finalPrice: 2.5,
      currency: "€",
    },
    variations: [
      {
        name: "Size",
        options: [
          {
            label: "Small",
            price: 0,
            stockQuantity: 0,
            sku: "COLA-S",
            isOutOfStock: true,
            totalAddedQuantity: 0,
          },
          {
            label: "Medium",
            price: 0.5,
            stockQuantity: 0,
            sku: "COLA-M",
            isOutOfStock: true,
            totalAddedQuantity: 0,
          },
          {
            label: "Large",
            price: 1,
            stockQuantity: 15,
            sku: "COLA-L",
            isOutOfStock: false,
            totalAddedQuantity: 0,
          },
        ],
      },
    ],
    addonGroups: [],
    stock: {
      quantity: 15,
      unit: "items",
      availabilityStatus: "Limited",
      hasVariations: true,
    },
    images: [
      "https://res.cloudinary.com/dmbyhqmbf/image/upload/v1775284749/fooml89g9bp-1775284749009-files-p1.jpg",
    ],
    vendorId: {
      _id: "V-1",
      businessDetails: {
        businessName: "Pizza Palace",
        businessType: "Restaurant",
      },
      businessLocation: {
        latitude: 0,
        longitude: 0,
      },
      documents: {
        storePhoto: "",
      },
    },
    meta: {
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    _id: "P-005",
    productId: "PROD-005",
    sku: "DESSERT-CAKE-01",
    name: "Chocolate Cake Slice",
    slug: "chocolate-cake-slice",
    description: "Rich chocolate cake.",
    isDeleted: false,
    isApproved: true,
    category: {
      _id: "C-5",
      name: "Desserts",
    },
    pricing: {
      price: 6,
      finalPrice: 6,
      currency: "€",
    },
    variations: [],
    addonGroups: [],
    stock: {
      quantity: 8,
      unit: "slices",
      availabilityStatus: "Limited",
      hasVariations: false,
    },
    images: [
      "https://res.cloudinary.com/dmbyhqmbf/image/upload/v1775284749/fooml89g9bp-1775284749009-files-p1.jpg",
    ],
    vendorId: {
      _id: "V-4",
      businessDetails: {
        businessName: "Sweet Treats",
        businessType: "Bakery",
      },
      businessLocation: {
        latitude: 0,
        longitude: 0,
      },
      documents: {
        storePhoto: "",
      },
    },
    meta: {
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];

export default function OutOfStockAlertsPage() {
  return (
    <OutOfStockAlerts
      productsData={{
        data: mockProducts,
        meta: { page: 1, limit: 10, total: 5, totalPage: 1 },
      }}
    />
  );
}
