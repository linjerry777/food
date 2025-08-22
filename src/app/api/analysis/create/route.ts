import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { geminiHealthAnalyzer } from '@/lib/gemini/client';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
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

    const { reportId } = await request.json();
    
    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少報告 ID',
        },
        { status: 400 }
      );
    }

    // 取得健檢報告
    const { data: report, error: reportError } = await supabase
      .from('health_reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        {
          success: false,
          error: '找不到指定的健檢報告',
        },
        { status: 404 }
      );
    }

    if (report.status !== 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: '報告尚未處理完成',
        },
        { status: 400 }
      );
    }

    if (!report.ocr_text) {
      return NextResponse.json(
        {
          success: false,
          error: '報告內容無法識別',
        },
        { status: 400 }
      );
    }

    // 使用 Gemini AI 分析健康報告
    const analysis = await geminiHealthAnalyzer.analyzeHealthReport(report.ocr_text);
    
    // 設定報告 ID
    analysis.report_id = reportId;

    // 儲存分析結果
    const { data: analysisData, error: analysisError } = await supabase
      .from('health_analysis')
      .insert(analysis)
      .select()
      .single();

    if (analysisError) {
      console.error('儲存分析結果失敗:', analysisError);
      return NextResponse.json(
        {
          success: false,
          error: '儲存分析結果失敗',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis: analysisData,
        message: '健康分析完成',
      },
    });

  } catch (error) {
    console.error('AI 分析錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'AI 分析失敗，請稍後再試',
      },
      { status: 500 }
    );
  }
}
