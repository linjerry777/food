-- 健康餐點推薦系統資料庫 Schema
-- 適用於 Supabase PostgreSQL

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. 用戶資料表 (與 Supabase Auth 整合)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 健檢報告資料表
CREATE TABLE IF NOT EXISTS public.health_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    ocr_text TEXT,
    status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'completed', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 健康分析結果資料表
CREATE TABLE IF NOT EXISTS public.health_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES public.health_reports(id) ON DELETE CASCADE NOT NULL,
    health_metrics JSONB NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) NOT NULL,
    health_status TEXT CHECK (health_status IN ('excellent', 'good', 'fair', 'poor')) NOT NULL,
    dietary_recommendations JSONB NOT NULL,
    health_warnings TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 餐廳資料表
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone TEXT,
    website TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5.0),
    price_range TEXT CHECK (price_range IN ('low', 'medium', 'high')) DEFAULT 'medium',
    cuisine_types TEXT[] DEFAULT '{}',
    health_focus TEXT[] DEFAULT '{}',
    opening_hours TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 餐點資料表
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    nutrition_info JSONB NOT NULL,
    health_tags TEXT[] DEFAULT '{}',
    allergens TEXT[] DEFAULT '{}',
    suitable_for TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 推薦記錄資料表
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    analysis_id UUID REFERENCES public.health_analysis(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    score DECIMAL(3,2) NOT NULL CHECK (score >= 0 AND score <= 1.0),
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 用戶偏好設定資料表
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    dietary_restrictions TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    preferred_cuisines TEXT[] DEFAULT '{}',
    price_range TEXT CHECK (price_range IN ('low', 'medium', 'high')) DEFAULT 'medium',
    max_distance INTEGER DEFAULT 5 CHECK (max_distance > 0 AND max_distance <= 50),
    health_goals TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_health_reports_user_id ON public.health_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_health_reports_status ON public.health_reports(status);
CREATE INDEX IF NOT EXISTS idx_health_analysis_report_id ON public.health_analysis(report_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON public.restaurants USING GIST(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_types ON public.restaurants USING GIN(cuisine_types);
CREATE INDEX IF NOT EXISTS idx_restaurants_health_focus ON public.restaurants USING GIN(health_focus);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_health_tags ON public.menu_items USING GIN(health_tags);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON public.recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- 建立更新時間觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要 updated_at 的資料表建立觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_reports_updated_at BEFORE UPDATE ON public.health_reports FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 建立附近餐廳查詢函數
CREATE OR REPLACE FUNCTION get_nearby_restaurants(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_km INTEGER DEFAULT 5
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT,
    website TEXT,
    rating DECIMAL(2,1),
    price_range TEXT,
    cuisine_types TEXT[],
    health_focus TEXT[],
    opening_hours TEXT,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.address,
        r.latitude,
        r.longitude,
        r.phone,
        r.website,
        r.rating,
        r.price_range,
        r.cuisine_types,
        r.health_focus,
        r.opening_hours,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)::geography
        ) / 1000.0 as distance_km
    FROM public.restaurants r
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)::geography,
        radius_km * 1000
    )
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) 政策

-- 啟用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 用戶資料表 RLS 政策
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 健檢報告 RLS 政策
CREATE POLICY "Users can view own health reports" ON public.health_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health reports" ON public.health_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health reports" ON public.health_reports
    FOR UPDATE USING (auth.uid() = user_id);

-- 健康分析 RLS 政策
CREATE POLICY "Users can view own health analysis" ON public.health_analysis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.health_reports
            WHERE id = report_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own health analysis" ON public.health_analysis
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.health_reports
            WHERE id = report_id AND user_id = auth.uid()
        )
    );

-- 餐廳資料表 RLS 政策 (公開讀取)
CREATE POLICY "Anyone can view restaurants" ON public.restaurants
    FOR SELECT USING (true);

-- 餐點資料表 RLS 政策 (公開讀取)
CREATE POLICY "Anyone can view menu items" ON public.menu_items
    FOR SELECT USING (true);

-- 推薦記錄 RLS 政策
CREATE POLICY "Users can view own recommendations" ON public.recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON public.recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用戶偏好設定 RLS 政策
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- 建立用戶註冊觸發器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 插入範例餐廳資料
INSERT INTO public.restaurants (name, address, latitude, longitude, phone, website, rating, price_range, cuisine_types, health_focus, opening_hours)
VALUES
    ('健康蔬食坊', '台北市信義區松仁路100號', 25.0330, 121.5654, '02-2345-6789', 'https://healthy-vegan.com', 4.5, 'medium', ARRAY['素食', '蔬食'], ARRAY['低脂', '高纖', '無麩質'], '週一至週日 11:00-21:00'),
    ('地中海料理', '台北市大安區忠孝東路四段50號', 25.0419, 121.5478, '02-2345-6790', 'https://mediterranean-taipei.com', 4.3, 'high', ARRAY['地中海', '海鮮'], ARRAY['低鈉', '高蛋白', '心臟健康'], '週一至週日 12:00-22:00'),
    ('輕食沙拉吧', '台北市中山區南京東路三段100號', 25.0522, 121.5444, '02-2345-6791', 'https://salad-bar.com', 4.1, 'low', ARRAY['沙拉', '輕食'], ARRAY['低卡', '高纖', '生酮'], '週一至週五 08:00-20:00'),
    ('有機農場餐廳', '台北市內湖區瑞光路200號', 25.0797, 121.5737, '02-2345-6792', 'https://organic-farm.com', 4.7, 'high', ARRAY['有機', '農場直送'], ARRAY['有機', '無農藥', '當季'], '週二至週日 11:30-21:30'),
    ('低糖甜點店', '台北市松山區民生東路四段80號', 25.0587, 121.5554, '02-2345-6793', 'https://low-sugar-dessert.com', 4.2, 'medium', ARRAY['甜點', '咖啡'], ARRAY['低糖', '無麩質', '生酮'], '週一至週日 10:00-22:00');

-- 插入範例餐點資料
INSERT INTO public.menu_items (restaurant_id, name, description, price, category, nutrition_info, health_tags, allergens, suitable_for)
VALUES
    ((SELECT id FROM public.restaurants WHERE name = '健康蔬食坊' LIMIT 1), '彩虹蔬菜沙拉', '新鮮有機蔬菜搭配堅果和橄欖油', 180.00, '沙拉', '{"calories": 120, "protein": 8, "carbs": 15, "fat": 6, "fiber": 8, "sodium": 200, "sugar": 5}', ARRAY['低卡', '高纖', '素食'], ARRAY['堅果'], ARRAY['減重', '心臟健康', '糖尿病']),
    ((SELECT id FROM public.restaurants WHERE name = '地中海料理' LIMIT 1), '烤鮭魚配蔬菜', '新鮮鮭魚搭配地中海香料和時蔬', 450.00, '主餐', '{"calories": 380, "protein": 35, "carbs": 20, "fat": 18, "fiber": 6, "sodium": 350, "sugar": 8}', ARRAY['高蛋白', '低鈉', '心臟健康'], ARRAY['魚類'], ARRAY['增肌', '心臟健康', '高血壓']),
    ((SELECT id FROM public.restaurants WHERE name = '輕食沙拉吧' LIMIT 1), '雞胸肉凱撒沙拉', '嫩煎雞胸肉配新鮮生菜和凱撒醬', 220.00, '沙拉', '{"calories": 180, "protein": 25, "carbs": 12, "fat": 5, "fiber": 4, "sodium": 280, "sugar": 3}', ARRAY['高蛋白', '低脂', '低卡'], ARRAY['雞蛋', '乳製品'], ARRAY['減重', '增肌', '健身']),
    ((SELECT id FROM public.restaurants WHERE name = '有機農場餐廳' LIMIT 1), '有機蔬菜湯', '當季有機蔬菜熬製的營養湯品', 150.00, '湯品', '{"calories": 80, "protein": 4, "carbs": 12, "fat": 2, "fiber": 6, "sodium": 180, "sugar": 4}', ARRAY['有機', '低卡', '高纖'], ARRAY[], ARRAY['減重', '排毒', '素食']),
    ((SELECT id FROM public.restaurants WHERE name = '低糖甜點店' LIMIT 1), '無糖巧克力蛋糕', '使用代糖製作的健康巧克力蛋糕', 120.00, '甜點', '{"calories": 160, "protein": 6, "carbs": 18, "fat": 8, "fiber": 3, "sodium": 120, "sugar": 2}', ARRAY['低糖', '無麩質', '生酮'], ARRAY['雞蛋'], ARRAY['糖尿病', '減重', '生酮飲食']);
