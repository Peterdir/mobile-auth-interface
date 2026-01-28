import { Banner, Category, homeApi, Product } from '@/src/api/homeApi';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, IconButton, Searchbar, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const user = useSelector((state: any) => state.auth.user);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel data fetching
                const [bannersData, categoriesData, productsData] = await Promise.all([
                    homeApi.getBanners(),
                    homeApi.getCategories(),
                    homeApi.getFeaturedProducts()
                ]);
                setBanners(bannersData);
                setCategories(categoriesData);
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    const renderBanner = ({ item }: { item: Banner }) => (
        <View className="mr-4 rounded-2xl overflow-hidden shadow-sm bg-white" style={{ width: width * 0.85, height: 180 }}>
            <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute bottom-0 left-0 right-0 bg-black/40 p-3">
                <Text className="text-white font-bold text-lg">{item.title}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <StatusBar style="dark" />
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View className="px-5 pt-2 pb-6 bg-white rounded-b-[30px] shadow-sm mb-4">
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text variant="bodyLarge" className="text-gray-500">Good Morning,</Text>
                            <Text variant="headlineMedium" className="font-bold text-gray-800">{user?.user || 'Guest'}!</Text>
                        </View>
                        <Surface className="rounded-full bg-gray-50" elevation={0}>
                            <IconButton icon="bell-outline" size={26} onPress={() => { }} />
                        </Surface>
                    </View>
                    <Searchbar
                        placeholder="Search products..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        className="bg-gray-100 rounded-xl elevation-0"
                        inputStyle={{ minHeight: 0 }}
                        style={{ height: 50 }}
                    />
                </View>

                {/* Banners */}
                <View className="py-2 mb-4">
                    <FlatList
                        horizontal
                        data={banners}
                        renderItem={renderBanner}
                        keyExtractor={item => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    />
                </View>

                {/* Categories */}
                <View className="px-5 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text variant="titleLarge" className="font-bold text-gray-800">Categories</Text>
                        <TouchableOpacity onPress={() => console.log('See all categories')}>
                            <Text variant="bodyMedium" className="text-purple-600 font-bold">See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row flex-wrap justify-between">
                        {categories.map((item) => (
                            <TouchableOpacity key={item.id} className="w-[22%] items-center mb-4" onPress={() => console.log(`Pressed ${item.name}`)}>
                                <View className="w-16 h-16 rounded-2xl items-center justify-center bg-purple-50 mb-2">
                                    <IconButton icon={item.icon} size={28} iconColor="#6200ee" style={{ margin: 0 }} />
                                </View>
                                <Text variant="labelMedium" className="text-gray-600 font-medium text-center" numberOfLines={1}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Featured Products */}
                <View className="px-3 mb-20">
                    <View className="flex-row justify-between items-center px-2 mb-4">
                        <Text variant="titleLarge" className="font-bold text-gray-800">Featured</Text>
                        <TouchableOpacity onPress={() => console.log('See all products')}>
                            <Text variant="bodyMedium" className="text-purple-600 font-bold">See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row flex-wrap">
                        {products.map((item) => (
                            <View key={item.id} className="w-[50%] p-2">
                                <Surface className="bg-white rounded-2xl overflow-hidden shadow-sm h-full" elevation={1}>
                                    <View className="relative">
                                        <Image source={{ uri: item.imageUrl }} className="w-full h-40 bg-gray-200" resizeMode="cover" />
                                        <TouchableOpacity className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm">
                                            <IconButton icon="heart-outline" size={16} iconColor="red" style={{ margin: 0 }} />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="p-3">
                                        <Text variant="titleMedium" numberOfLines={1} className="font-semibold text-gray-800 mb-1">{item.name}</Text>
                                        <View className="flex-row justify-between items-center mt-2">
                                            <Text variant="headlineSmall" className="text-purple-600 font-bold text-[18px]">${item.price}</Text>
                                            <TouchableOpacity className="bg-purple-600 rounded-lg p-2" onPress={() => console.log(`Add ${item.name}`)}>
                                                <IconButton icon="plus" size={16} iconColor="white" style={{ margin: 0 }} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Surface>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
