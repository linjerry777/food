import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(),
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
    rpc: jest.fn(),
  },
  auth: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  db: {
    healthReports: {
      create: jest.fn(),
      getById: jest.fn(),
      getByUserId: jest.fn(),
      update: jest.fn(),
    },
    healthAnalysis: {
      create: jest.fn(),
      getByReportId: jest.fn(),
    },
    restaurants: {
      getNearby: jest.fn(),
      getById: jest.fn(),
    },
    recommendations: {
      create: jest.fn(),
      getByUserId: jest.fn(),
    },
    userPreferences: {
      getByUserId: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

// Mock Gemini AI
jest.mock('@/lib/gemini/client', () => ({
  geminiHealthAnalyzer: {
    analyzeHealthReport: jest.fn(),
    generateRecommendationReason: jest.fn(),
    validateHealthMetrics: jest.fn(),
  },
}));

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false,
  }),
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));
