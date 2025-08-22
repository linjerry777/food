import Link from 'next/link';
import { Heart, MapPin, Upload, Users, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-green-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">健康餐點推薦</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                登入
              </Link>
              <Link
                href="/auth/register"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                註冊
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main>
        {/* Hero 區塊 */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              基於健檢報告的
              <span className="text-green-600"> 智能餐點推薦</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              上傳您的健檢報告，我們的 AI 系統將分析您的健康狀況，
              為您推薦附近最適合的健康餐廳和餐點。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/upload"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center justify-center"
              >
                <Upload className="mr-2 h-5 w-5" />
                開始上傳健檢報告
              </Link>
              <Link
                href="/auth/register"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg text-lg font-medium"
              >
                免費註冊
              </Link>
            </div>
          </div>
        </section>

        {/* 功能特色 */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                為什麼選擇我們的服務？
              </h2>
              <p className="text-xl text-gray-600">
                結合 AI 技術與專業醫療知識，為您提供個人化的健康飲食建議
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  簡單上傳
                </h3>
                <p className="text-gray-600">
                  支援 PDF 和圖片格式，輕鬆上傳您的健檢報告
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI 智能分析
                </h3>
                <p className="text-gray-600">
                  使用 Google Gemini AI 深度分析您的健康指標
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  地理位置推薦
                </h3>
                <p className="text-gray-600">
                  結合 Google Maps，推薦附近最適合的餐廳
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  個人化建議
                </h3>
                <p className="text-gray-600">
                  根據您的健康狀況和偏好提供專屬建議
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  即時更新
                </h3>
                <p className="text-gray-600">
                  餐廳資訊即時更新，確保推薦的準確性
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  健康追蹤
                </h3>
                <p className="text-gray-600">
                  追蹤您的健康改善進度，持續優化建議
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 使用流程 */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                使用流程
              </h2>
              <p className="text-xl text-gray-600">
                三個簡單步驟，開始您的健康飲食之旅
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  上傳健檢報告
                </h3>
                <p className="text-gray-600">
                  登入後上傳您的健檢報告，支援多種檔案格式
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI 分析健康狀況
                </h3>
                <p className="text-gray-600">
                  系統自動分析您的健康指標並生成飲食建議
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  獲得餐廳推薦
                </h3>
                <p className="text-gray-600">
                  查看附近符合您健康需求的餐廳和餐點推薦
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 區塊 */}
        <section className="py-20 bg-green-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              準備開始您的健康飲食之旅了嗎？
            </h2>
            <p className="text-xl text-green-100 mb-8">
              立即註冊，體驗 AI 驅動的個人化健康餐點推薦
            </p>
            <Link
              href="/auth/register"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium"
            >
              免費註冊開始使用
            </Link>
          </div>
        </section>
      </main>

      {/* 頁腳 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 text-green-400 mr-2" />
                <span className="text-lg font-bold">健康餐點推薦</span>
              </div>
              <p className="text-gray-400">
                基於 AI 技術的個人化健康餐點推薦系統
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">功能特色</h3>
              <ul className="space-y-2 text-gray-400">
                <li>健檢報告分析</li>
                <li>AI 健康評估</li>
                <li>餐廳推薦</li>
                <li>健康追蹤</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">技術支援</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Next.js 14</li>
                <li>Supabase</li>
                <li>Google Gemini AI</li>
                <li>Google Maps API</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">聯絡我們</h3>
              <ul className="space-y-2 text-gray-400">
                <li>客服信箱</li>
                <li>技術支援</li>
                <li>隱私政策</li>
                <li>使用條款</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 健康餐點推薦系統. 保留所有權利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
