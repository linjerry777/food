'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Upload, 
  MapPin, 
  FileText, 
  Settings, 
  LogOut,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import { auth, db } from '@/lib/supabase/client';
import type { HealthReport, Recommendation } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { user } = await auth.getCurrentUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      await loadUserData(user.id);
    } catch (error) {
      console.error('檢查用戶狀態失敗:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // 載入健檢報告
      const { data: reportsData } = await db.healthReports.getByUserId(userId);
      if (reportsData) {
        setReports(reportsData);
      }

      // 載入推薦記錄
      const { data: recommendationsData } = await db.recommendations.getByUserId(userId);
      if (recommendationsData) {
        setRecommendations(recommendationsData);
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                歡迎，{user?.user_metadata?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/upload"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">上傳健檢報告</h3>
                <p className="text-gray-600">開始您的健康分析</p>
              </div>
            </div>
          </Link>

          <Link
            href="/recommendations"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">查看推薦</h3>
                <p className="text-gray-600">瀏覽餐廳推薦</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/settings"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">偏好設定</h3>
                <p className="text-gray-600">個人化您的體驗</p>
              </div>
            </div>
          </Link>
        </div>

        {/* 統計概覽 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">健檢報告</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">推薦餐廳</p>
                <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">健康評分</p>
                <p className="text-2xl font-bold text-gray-900">85</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">本月訪問</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* 最近活動 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近的健檢報告 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">最近的健檢報告</h3>
            </div>
            <div className="p-6">
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">還沒有上傳健檢報告</p>
                  <Link
                    href="/upload"
                    className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    立即上傳
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.slice(0, 3).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{report.file_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(report.created_at).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'completed' ? 'bg-green-100 text-green-800' :
                        report.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status === 'completed' ? '已完成' :
                         report.status === 'processing' ? '處理中' :
                         report.status === 'error' ? '錯誤' : '上傳中'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 最近的推薦 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">最近的推薦</h3>
            </div>
            <div className="p-6">
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">還沒有餐廳推薦</p>
                  <p className="text-sm text-gray-500 mt-2">上傳健檢報告後即可獲得推薦</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.slice(0, 3).map((recommendation) => (
                    <div key={recommendation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">餐廳推薦</p>
                        <p className="text-sm text-gray-600">
                          {new Date(recommendation.created_at).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                      <span className="text-sm text-gray-600">
                        評分: {(recommendation.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
