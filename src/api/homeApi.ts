// Mock data interfaces
export interface Banner {
    id: string;
    imageUrl: string;
    title: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
}

// Mock data implementation
const MOCK_BANNERS: Banner[] = [
    { id: '1', imageUrl: 'https://picsum.photos/800/400', title: 'Summer Sale' },
    { id: '2', imageUrl: 'https://picsum.photos/800/401', title: 'New Arrivals' },
    { id: '3', imageUrl: 'https://picsum.photos/800/402', title: 'Exclusive Items' },
];

const MOCK_CATEGORIES: Category[] = [
    { id: '1', name: 'Technology', icon: 'laptop' },
    { id: '2', name: 'Fashion', icon: 'tshirt-crew' },
    { id: '3', name: 'Home', icon: 'home-variant' },
    { id: '4', name: 'Beauty', icon: 'flower' },
    { id: '5', name: 'Sports', icon: 'basketball' },
    { id: '6', name: 'Books', icon: 'book-open-variant' },
    { id: '7', name: 'Toys', icon: 'gamepad-variant' },
    { id: '8', name: 'More', icon: 'dots-horizontal' },
];

const MOCK_PRODUCTS: Product[] = [
    { id: '1', name: 'Smartphone X', price: 999, imageUrl: 'https://picsum.photos/300' },
    { id: '2', name: 'Headphones Pro', price: 199, imageUrl: 'https://picsum.photos/301' },
    { id: '3', name: 'Smart Watch 5', price: 299, imageUrl: 'https://picsum.photos/302' },
    { id: '4', name: 'Laptop Ultra', price: 1499, imageUrl: 'https://picsum.photos/303' },
    { id: '5', name: 'Camera 4K', price: 599, imageUrl: 'https://picsum.photos/304' },
    { id: '6', name: 'Gaming Console', price: 499, imageUrl: 'https://picsum.photos/305' },
    { id: '7', name: 'Wireless Mouse', price: 49, imageUrl: 'https://picsum.photos/306' },
    { id: '8', name: 'Mechanical Keyboard', price: 129, imageUrl: 'https://picsum.photos/307' },
]

export const homeApi = {
    getBanners: async (): Promise<Banner[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_BANNERS), 500));
    },
    getCategories: async (): Promise<Category[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_CATEGORIES), 500));
    },
    getFeaturedProducts: async (): Promise<Product[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS), 500));
    }
};
