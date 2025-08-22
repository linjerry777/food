import { 
  cn, 
  formatDate, 
  formatFileSize, 
  calculateDistance, 
  validateEmail, 
  validatePassword 
} from './index';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
      expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('1');
    });

    it('should handle string dates', () => {
      const dateString = '2024-01-15T00:00:00Z';
      const formatted = formatDate(dateString);
      expect(formatted).toContain('2024');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance correctly', () => {
      // 台北 101 到台北車站的距離約 2.5 公里
      const distance = calculateDistance(25.0330, 121.5654, 25.0478, 121.5174);
      expect(distance).toBeCloseTo(2.5, 1);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(25.0330, 121.5654, 25.0330, 121.5654);
      expect(distance).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.issues).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should identify medium strength passwords', () => {
      const result = validatePassword('MediumPass123');
      expect(result.strength).toBe('medium');
    });
  });
});
