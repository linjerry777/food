// 用戶相關類型
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// 健檢報告相關類型
export interface HealthReport {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  ocr_text?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

// 健康指標類型
export interface HealthMetrics {
  blood_pressure?: {
    systolic: number;
    diastolic: number;
  };
  blood_sugar?: {
    fasting: number;
    postprandial?: number;
    hba1c?: number;
  };
  cholesterol?: {
    total: number;
    hdl: number;
    ldl: number;
    triglycerides: number;
  };
  liver_function?: {
    alt: number;
    ast: number;
    ggt?: number;
  };
  kidney_function?: {
    creatinine: number;
    egfr?: number;
  };
  thyroid?: {
    tsh: number;
    t3?: number;
    t4?: number;
  };
  weight?: {
    current: number;
    height: number;
    bmi: number;
  };
}

// AI 分析結果類型
export interface HealthAnalysis {
  id: string;
  report_id: string;
  health_metrics: HealthMetrics;
  risk_level: 'low' | 'medium' | 'high';
  health_status: 'excellent' | 'good' | 'fair' | 'poor';
  dietary_recommendations: {
    recommended_foods: string[];
    avoid_foods: string[];
    general_advice: string;
  };
  health_warnings: string[];
  created_at: string;
}

// 餐廳相關類型
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating: number;
  price_range: 'low' | 'medium' | 'high';
  cuisine_types: string[];
  health_focus: string[];
  opening_hours: string;
  created_at: string;
}

// 餐點類型
export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  nutrition_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
    sugar: number;
  };
  health_tags: string[];
  allergens: string[];
  suitable_for: string[];
}

// 推薦記錄類型
export interface Recommendation {
  id: string;
  user_id: string;
  analysis_id: string;
  restaurant_id: string;
  menu_item_id?: string;
  score: number;
  reason: string;
  created_at: string;
}

// 用戶偏好設定
export interface UserPreferences {
  id: string;
  user_id: string;
  dietary_restrictions: string[];
  allergies: string[];
  preferred_cuisines: string[];
  price_range: 'low' | 'medium' | 'high';
  max_distance: number; // 公里
  health_goals: string[];
  created_at: string;
  updated_at: string;
}

// API 回應類型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 檔案上傳類型
export interface FileUpload {
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

// 地圖相關類型
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface MapMarker {
  id: string;
  position: Location;
  title: string;
  description: string;
  type: 'restaurant' | 'user' | 'recommendation';
  data?: Restaurant | Recommendation;
}
