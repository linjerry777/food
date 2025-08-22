import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: '沒有找到上傳的檔案',
        },
        { status: 400 }
      );
    }

    // 驗證檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: '不支援的檔案類型',
        },
        { status: 400 }
      );
    }

    // 驗證檔案大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: '檔案大小超過限制',
        },
        { status: 400 }
      );
    }

    // 生成唯一檔案名
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // 上傳到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('health-reports')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('檔案上傳失敗:', uploadError);
      return NextResponse.json(
        {
          success: false,
          error: '檔案上傳失敗',
        },
        { status: 500 }
      );
    }

    // 取得檔案 URL
    const { data: { publicUrl } } = supabase.storage
      .from('health-reports')
      .getPublicUrl(fileName);

    // 建立健檢報告記錄
    const { data: reportData, error: reportError } = await supabase
      .from('health_reports')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
        status: 'uploading',
      })
      .select()
      .single();

    if (reportError) {
      console.error('建立報告記錄失敗:', reportError);
      return NextResponse.json(
        {
          success: false,
          error: '建立報告記錄失敗',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        report: reportData,
        message: '檔案上傳成功',
      },
    });

  } catch (error) {
    console.error('上傳處理錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '伺服器內部錯誤',
      },
      { status: 500 }
    );
  }
}
