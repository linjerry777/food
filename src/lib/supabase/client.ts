import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// 服務端 Supabase 客戶端（使用 service role key）
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// 認證相關工具函數
export const auth = {
  // 註冊
  async signUp(email: string, password: string, metadata?: { name?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },

  // 登入
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 取得當前用戶
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // 監聽認證狀態變化
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// 資料庫操作工具函數
export const db = {
  // 健檢報告相關
  healthReports: {
    async create(report: Omit<import('@/types').HealthReport, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('health_reports')
        .insert(report)
        .select()
        .single();
      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async update(id: string, updates: Partial<import('@/types').HealthReport>) {
      const { data, error } = await supabase
        .from('health_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // 健康分析相關
  healthAnalysis: {
    async create(analysis: Omit<import('@/types').HealthAnalysis, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('health_analysis')
        .insert(analysis)
        .select()
        .single();
      return { data, error };
    },

    async getByReportId(reportId: string) {
      const { data, error } = await supabase
        .from('health_analysis')
        .select('*')
        .eq('report_id', reportId)
        .single();
      return { data, error };
    },
  },

  // 餐廳相關
  restaurants: {
    async getNearby(lat: number, lng: number, radius: number = 5) {
      const { data, error } = await supabase
        .rpc('get_nearby_restaurants', {
          user_lat: lat,
          user_lng: lng,
          radius_km: radius,
        });
      return { data, error };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },
  },

  // 推薦相關
  recommendations: {
    async create(recommendation: Omit<import('@/types').Recommendation, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('recommendations')
        .insert(recommendation)
        .select()
        .single();
      return { data, error };
    },

    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          restaurants (*),
          health_analysis (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
  },

  // 用戶偏好設定
  userPreferences: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      return { data, error };
    },

    async upsert(preferences: Omit<import('@/types').UserPreferences, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(preferences, {
          onConflict: 'user_id',
        })
        .select()
        .single();
      return { data, error };
    },
  },
};
