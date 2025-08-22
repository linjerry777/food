import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { geminiHealthAnalyzer } from '@/lib/gemini/client';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = createServerSupabaseClient();
    
    // 檢查用戶認證
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: '未授權的請求',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '5';

    if (!analysisId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少分析 ID',
        },
        { status: 400 }
      );
    }

    // 取得健康分析結果
    const { data: analysis, error: analysisError } = await supabase
      .from('health_analysis')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        {
          success: false,
          error: '找不到指定的健康分析',
        },
        { status: 404 }
      );
    }

    // 取得附近餐廳
    let restaurants;
    if (lat && lng) {
      const { data: nearbyData, error: nearbyError } = await supabase.rpc(
        'get_nearby_restaurants',
        {
          user_lat: parseFloat(lat),
          user_lng: parseFloat(lng),
          radius_km: parseInt(radius),
        }
      );

      if (nearbyError) {
        console.error('取得附近餐廳失敗:', nearbyError);
        return NextResponse.json(
          {
            success: false,
            error: '取得附近餐廳失敗',
          },
          { status: 500 }
        );
      }

      restaurants = nearbyData;
    } else {
      // 如果沒有位置資訊，取得所有餐廳
      const { data: allRestaurants, error: allError } = await supabase
        .from('restaurants')
        .select('*')
        .limit(20);

      if (allError) {
        console.error('取得餐廳失敗:', allError);
        return NextResponse.json(
          {
            success: false,
            error: '取得餐廳失敗',
          },
          { status: 500 }
        );
      }

      restaurants = allRestaurants;
    }

    // 根據健康狀況過濾餐廳
    const filteredRestaurants = restaurants.filter(restaurant => {
      // 根據健康焦點過濾
      const healthFocus = analysis.health_metrics;
      
      // 如果有高血壓，推薦低鈉餐廳
      if (healthFocus.blood_pressure?.systolic > 140 || healthFocus.blood_pressure?.diastolic > 90) {
        if (!restaurant.health_focus.includes('低鈉')) {
          return false;
        }
      }

      // 如果有高血糖，推薦低糖餐廳
      if (healthFocus.blood_sugar?.fasting > 126) {
        if (!restaurant.health_focus.includes('低糖') && !restaurant.health_focus.includes('生酮')) {
          return false;
        }
      }

      // 如果有高膽固醇，推薦低脂餐廳
      if (healthFocus.cholesterol?.total > 200) {
        if (!restaurant.health_focus.includes('低脂')) {
          return false;
        }
      }

      return true;
    });

    // 為每個餐廳生成推薦理由
    const recommendations = await Promise.all(
      filteredRestaurants.map(async (restaurant) => {
        const reason = await geminiHealthAnalyzer.generateRecommendationReason(
          restaurant.name,
          analysis
        );

        // 計算推薦評分
        let score = 0.5; // 基礎評分

        // 根據健康焦點加分
        const healthFocus = analysis.health_metrics;
        if (healthFocus.blood_pressure?.systolic > 140 && restaurant.health_focus.includes('低鈉')) {
          score += 0.2;
        }
        if (healthFocus.blood_sugar?.fasting > 126 && restaurant.health_focus.includes('低糖')) {
          score += 0.2;
        }
        if (healthFocus.cholesterol?.total > 200 && restaurant.health_focus.includes('低脂')) {
          score += 0.2;
        }

        // 根據評分加分
        score += restaurant.rating * 0.1;

        // 根據距離加分（如果有位置資訊）
        if (lat && lng && 'distance_km' in restaurant) {
          const distance = (restaurant as any).distance_km;
          if (distance < 1) score += 0.1;
          else if (distance < 3) score += 0.05;
        }

        // 確保評分在 0-1 之間
        score = Math.min(Math.max(score, 0), 1);

        return {
          restaurant,
          score,
          reason,
        };
      })
    );

    // 按評分排序
    recommendations.sort((a, b) => b.score - a.score);

    // 儲存推薦記錄
    const recommendationRecords = recommendations.slice(0, 10).map(rec => ({
      user_id: user.id,
      analysis_id: analysisId,
      restaurant_id: rec.restaurant.id,
      score: rec.score,
      reason: rec.reason,
    }));

    if (recommendationRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('recommendations')
        .insert(recommendationRecords);

      if (insertError) {
        console.error('儲存推薦記錄失敗:', insertError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations: recommendations.slice(0, 10),
        analysis,
        message: '餐廳推薦生成完成',
      },
    });

  } catch (error) {
    console.error('餐廳推薦錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '餐廳推薦失敗，請稍後再試',
      },
      { status: 500 }
    );
  }
}
