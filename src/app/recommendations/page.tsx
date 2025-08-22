'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Star, 
  Phone, 
  Globe, 
  Clock, 
  Heart,
  Filter,
  Search
} from 'lucide-react';
import type { Restaurant, Recommendation } from '@/types';

// 模擬餐廳資料
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: '健康蔬食坊',
    address: '台北市信義區松仁路100號',
    latitude: 25.0330,
    longitude: 121.5654,
    phone: '02-2345-6789',
    website: 'https://healthy-vegan.com',
    rating: 4.5,
    price_range: 'medium',
    cuisine_types: ['素食', '蔬食'],
    health_focus: ['低脂', '高纖', '無麩質'],
    opening_hours: '週一至週日 11:00-21:00',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: '地中海料理',
    address: '台北市大安區忠孝東路四段50號',
    latitude: 25.0419,
    longitude: 121.5478,
    phone: '02-2345-6790',
    website: 'https://mediterranean-taipei.com',
    rating: 4.3,
    price_range: 'high',
    cuisine_types: ['地中海', '海鮮'],
    health_focus: ['低鈉', '高蛋白', '心臟健康'],
    opening_hours: '週一至週日 12:00-22:00',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: '輕食沙拉吧',
    address: '台北市中山區南京東路三段100號',
    latitude: 25.0522,
    longitude: 121.5444,
    phone: '02-2345-6791',
    website: 'https://salad-bar.com',
    rating: 4.1,
    price_range: 'low',
    cuisine_types: ['沙拉', '輕食'],
    health_focus: ['低卡', '高纖', '生酮'],
    opening_hours: '週一至週五 08:00-20:00',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export default function RecommendationsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedHealthFocus, setSelectedHealthFocus] = useState('');

  const cuisineTypes = Array.from(new Set(restaurants.flatMap(r => r.cuisine_types)));
  const healthFocuses = Array.from(new Set(restaurants.flatMap(r => r.health_focus)));

  useEffect(() => {
    let filtered = restaurants;

    // 搜尋過濾
    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 菜系過濾
    if (selectedCuisine) {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisine_types.includes(selectedCuisine)
      );
    }

    // 價格範圍過濾
    if (selectedPriceRange) {
      filtered = filtered.filter(restaurant =>
        restaurant.price_range === selectedPriceRange
      );
    }

    // 健康焦點過濾
    if (selectedHealthFocus) {
      filtered = filtered.filter(restaurant =>
        restaurant.health_focus.includes(selectedHealthFocus)
      );
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, searchTerm, selectedCuisine, selectedPriceRange, selectedHealthFocus]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCuisine('');
    setSelectedPriceRange('');
    setSelectedHealthFocus('');
  };

  const getPriceRangeText = (range: string) => {
    switch (range) {
      case 'low':
        return '平價';
      case 'medium':
        return '中價位';
      case 'high':
        return '高價位';
      default:
        return range;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-green-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">健康餐點推薦</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            餐廳推薦
          </h1>
          <p className="text-lg text-gray-600">
            根據您的健康狀況，為您推薦最適合的餐廳
          </p>
        </div>

        {/* 搜尋和過濾 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 搜尋 */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜尋餐廳名稱或地址..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* 菜系過濾 */}
            <div>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">所有菜系</option>
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* 價格範圍過濾 */}
            <div>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">所有價格</option>
                <option value="low">平價</option>
                <option value="medium">中價位</option>
                <option value="high">高價位</option>
              </select>
            </div>

            {/* 健康焦點過濾 */}
            <div>
              <select
                value={selectedHealthFocus}
                onChange={(e) => setSelectedHealthFocus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">所有健康焦點</option>
                {healthFocuses.map(focus => (
                  <option key={focus} value={focus}>{focus}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 清除過濾 */}
          {(searchTerm || selectedCuisine || selectedPriceRange || selectedHealthFocus) && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={clearFilters}
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
              >
                <Filter className="h-4 w-4 mr-1" />
                清除所有過濾條件
              </button>
            </div>
          )}
        </div>

        {/* 餐廳列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 餐廳圖片 */}
              <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-green-600" />
              </div>

              {/* 餐廳資訊 */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {restaurant.rating}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {restaurant.address}
                </p>

                {/* 標籤 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {getPriceRangeText(restaurant.price_range)}
                  </span>
                  {restaurant.cuisine_types.map(cuisine => (
                    <span
                      key={cuisine}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {cuisine}
                    </span>
                  ))}
                  {restaurant.health_focus.map(focus => (
                    <span
                      key={focus}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {focus}
                    </span>
                  ))}
                </div>

                {/* 營業時間 */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  {restaurant.opening_hours}
                </div>

                {/* 聯絡資訊 */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    {restaurant.phone && (
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="text-green-600 hover:text-green-700 flex items-center text-sm"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        電話
                      </a>
                    )}
                    {restaurant.website && (
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 flex items-center text-sm"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        網站
                      </a>
                    )}
                  </div>
                  
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    查看詳情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 無結果 */}
        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              沒有找到符合條件的餐廳
            </h3>
            <p className="text-gray-600 mb-4">
              請嘗試調整搜尋條件或過濾器
            </p>
            <button
              onClick={clearFilters}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              清除所有過濾條件
            </button>
          </div>
        )}

        {/* 結果統計 */}
        <div className="mt-8 text-center text-sm text-gray-600">
          顯示 {filteredRestaurants.length} 家餐廳
          {filteredRestaurants.length !== restaurants.length && (
            <span>（共 {restaurants.length} 家）</span>
          )}
        </div>
      </div>
    </div>
  );
}
