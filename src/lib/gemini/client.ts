import { GoogleGenerativeAI } from '@google/generative-ai';
import type { HealthMetrics, HealthAnalysis } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 健檢報告分析 Prompt 模板
const HEALTH_ANALYSIS_PROMPT = `
你是一個專業的健康顧問，請分析以下健檢報告的內容，並提供詳細的健康評估和飲食建議。

健檢報告內容：
{ocr_text}

請根據報告內容，分析以下健康指標：
1. 血壓 (收縮壓/舒張壓)
2. 血糖 (空腹血糖、飯後血糖、糖化血色素)
3. 膽固醇 (總膽固醇、HDL、LDL、三酸甘油脂)
4. 肝功能 (ALT、AST、GGT)
5. 腎功能 (肌酸酐、eGFR)
6. 甲狀腺功能 (TSH、T3、T4)
7. 體重和BMI

請以JSON格式回傳分析結果，包含以下結構：
{
  "health_metrics": {
    "blood_pressure": {"systolic": number, "diastolic": number},
    "blood_sugar": {"fasting": number, "postprandial": number, "hba1c": number},
    "cholesterol": {"total": number, "hdl": number, "ldl": number, "triglycerides": number},
    "liver_function": {"alt": number, "ast": number, "ggt": number},
    "kidney_function": {"creatinine": number, "egfr": number},
    "thyroid": {"tsh": number, "t3": number, "t4": number},
    "weight": {"current": number, "height": number, "bmi": number}
  },
  "risk_level": "low|medium|high",
  "health_status": "excellent|good|fair|poor",
  "dietary_recommendations": {
    "recommended_foods": ["食物1", "食物2"],
    "avoid_foods": ["食物1", "食物2"],
    "general_advice": "一般飲食建議"
  },
  "health_warnings": ["警告1", "警告2"]
}

注意事項：
1. 只回傳JSON格式，不要包含其他文字
2. 如果某項指標在報告中沒有出現，請設為null
3. 根據台灣的健檢標準來評估各項指標
4. 提供適合台灣飲食習慣的建議
`;

export class GeminiHealthAnalyzer {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * 分析健檢報告
   */
  async analyzeHealthReport(ocrText: string): Promise<HealthAnalysis> {
    try {
      const prompt = HEALTH_ANALYSIS_PROMPT.replace('{ocr_text}', ocrText);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // 解析 JSON 回應
      const analysis = JSON.parse(text) as Omit<HealthAnalysis, 'id' | 'report_id' | 'created_at'>;
      
      return {
        id: '', // 將由資料庫生成
        report_id: '', // 將由調用者設定
        health_metrics: analysis.health_metrics,
        risk_level: analysis.risk_level,
        health_status: analysis.health_status,
        dietary_recommendations: analysis.dietary_recommendations,
        health_warnings: analysis.health_warnings,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Gemini AI 分析錯誤:', error);
      throw new Error('健檢報告分析失敗，請稍後再試');
    }
  }

  /**
   * 生成餐廳推薦理由
   */
  async generateRecommendationReason(
    restaurantName: string,
    healthAnalysis: HealthAnalysis,
    userPreferences?: any
  ): Promise<string> {
    try {
      const prompt = `
根據以下資訊，為用戶推薦這家餐廳的理由：

餐廳名稱：${restaurantName}
用戶健康狀況：${healthAnalysis.health_status}
風險等級：${healthAnalysis.risk_level}
飲食建議：${healthAnalysis.dietary_recommendations.general_advice}

請提供一個簡短但具體的推薦理由，說明為什麼這家餐廳適合該用戶的健康需求。
回傳格式：純文字，不超過100字。
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('生成推薦理由錯誤:', error);
      return '根據您的健康狀況，這家餐廳提供適合的餐點選擇。';
    }
  }

  /**
   * 驗證健康指標
   */
  async validateHealthMetrics(metrics: Partial<HealthMetrics>): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    try {
      const prompt = `
請驗證以下健康指標是否合理：

${JSON.stringify(metrics, null, 2)}

請檢查：
1. 數值是否在合理範圍內
2. 是否有明顯的錯誤或異常值
3. 是否符合台灣健檢標準

回傳JSON格式：
{
  "isValid": boolean,
  "issues": ["問題1", "問題2"]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('驗證健康指標錯誤:', error);
      return {
        isValid: true,
        issues: [],
      };
    }
  }
}

// 建立單例實例
export const geminiHealthAnalyzer = new GeminiHealthAnalyzer();
