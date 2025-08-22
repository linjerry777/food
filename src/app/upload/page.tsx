'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Heart
} from 'lucide-react';
import { validateFileType, validateFileSize, formatFileSize } from '@/lib/utils';
import type { FileUpload } from '@/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'application/pdf'
];

export default function UploadPage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileUpload[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'idle' as const,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setUploading(true);
    
    try {
      // 這裡會實作實際的上傳邏輯
      // 目前只是模擬上傳過程
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        // 更新狀態為上傳中
        setUploadedFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, status: 'uploading' } : f
        ));

        // 模擬上傳進度
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setUploadedFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, progress } : f
          ));
        }

        // 完成上傳
        setUploadedFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, status: 'success' } : f
        ));
      }

      // 上傳完成後導向到分析頁面
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('上傳失敗:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'error', error: '上傳失敗' } : f
      ));
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: FileUpload['status']) => {
    switch (status) {
      case 'success':
        return '上傳完成';
      case 'error':
        return '上傳失敗';
      case 'uploading':
        return '上傳中';
      default:
        return '等待上傳';
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

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            上傳健檢報告
          </h1>
          <p className="text-lg text-gray-600">
            上傳您的健檢報告，我們將使用 AI 技術分析您的健康狀況並提供個人化的餐廳推薦
          </p>
        </div>

        {/* 上傳區域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? '放開以上傳檔案' : '拖放檔案到這裡，或點擊選擇檔案'}
            </p>
            <p className="text-sm text-gray-600">
              支援 PDF、JPG、PNG、WebP 格式，檔案大小不超過 10MB
            </p>
          </div>
        </div>

        {/* 檔案列表 */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              已選擇的檔案 ({uploadedFiles.length})
            </h3>
            
            <div className="space-y-4">
              {uploadedFiles.map((fileUpload, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(fileUpload.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {fileUpload.file.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(fileUpload.file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {fileUpload.status === 'uploading' && (
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileUpload.progress}%` }}
                        />
                      </div>
                    )}
                    
                    <span className={`text-sm font-medium ${
                      fileUpload.status === 'success' ? 'text-green-600' :
                      fileUpload.status === 'error' ? 'text-red-600' :
                      fileUpload.status === 'uploading' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {getStatusText(fileUpload.status)}
                    </span>
                    
                    {fileUpload.status === 'idle' && (
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 上傳按鈕 */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={uploading || uploadedFiles.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center"
              >
                <Upload className="mr-2 h-5 w-5" />
                {uploading ? '上傳中...' : '開始上傳'}
              </button>
            </div>
          </div>
        )}

        {/* 說明資訊 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            上傳須知
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• 支援的檔案格式：PDF、JPG、PNG、WebP</li>
            <li>• 檔案大小限制：最大 10MB</li>
            <li>• 請確保健檢報告內容清晰可讀</li>
            <li>• 上傳後將使用 AI 技術自動分析健康指標</li>
            <li>• 您的資料將受到嚴格保護，僅用於健康分析</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
