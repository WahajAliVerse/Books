// Accessibility utilities for Physical AI & Humanoid Robotics book
// Located at src/utils/accessibilityUtils.js

/**
 * Accessibility utilities for enhancing accessibility compliance
 */

/**
 * Focus trap utility for modal dialogs
 * @param {HTMLElement} element - The element to trap focus within
 */
export const createFocusTrap = (element) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTab = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };
  
  element.addEventListener('keydown', handleTab);
  
  return () => {
    element.removeEventListener('keydown', handleTab);
  };
};

/**
 * Announce text to screen readers
 * @param {string} text - The text to announce
 */
export const announceToScreenReader = (text) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = text;
  
  document.body.appendChild(announcement);
  
  // Remove after a delay to prevent cluttering the DOM
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check color contrast ratio
 * @param {string} bgColor - Background color in hex format
 * @param {string} textColor - Text color in hex format
 * @returns {number} - Contrast ratio
 */
export const getColorContrastRatio = (bgColor, textColor) => {
  // Convert hex colors to RGB
  const bgRgb = hexToRgb(bgColor);
  const textRgb = hexToRgb(textColor);
  
  // Calculate luminance
  const bgLuminance = calculateLuminance(bgRgb);
  const textLuminance = calculateLuminance(textRgb);
  
  // Calculate contrast ratio
  const brightest = Math.max(bgLuminance, textLuminance);
  const darkest = Math.min(bgLuminance, textLuminance);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Helper function to calculate luminance
const calculateLuminance = (rgb) => {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val /= 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Validate accessibility of a component
 * @param {HTMLElement} element - The element to validate
 * @returns {Object} - Accessibility validation results
 */
export const validateAccessibility = (element) => {
  const issues = [];
  
  // Check for alt text on images
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      issues.push({
        type: 'error',
        element: img,
        message: 'Image missing alt attribute'
      });
    }
  });
  
  // Check for proper heading structure
  const headers = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastHeadingLevel = 0;
  headers.forEach(header => {
    const level = parseInt(header.tagName.charAt(1));
    if (level > lastHeadingLevel + 1) {
      issues.push({
        type: 'warning',
        element: header,
        message: `Heading level skipped: ${lastHeadingLevel} to ${level}`
      });
    }
    lastHeadingLevel = level;
  });
  
  // Check for sufficient color contrast
  const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
  textElements.forEach(el => {
    const style = window.getComputedStyle(el);
    const bgColor = style.backgroundColor;
    const textColor = style.color;
    
    if (bgColor && textColor) {
      const contrast = getColorContrastRatio(rgbToHex(bgColor), rgbToHex(textColor));
      if (contrast < 4.5) {
        issues.push({
          type: 'warning',
          element: el,
          message: `Insufficient color contrast: ${contrast.toFixed(2)} (needs at least 4.5:1)`
        });
      }
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Helper to convert RGB string to hex
const rgbToHex = (rgbString) => {
  // Handle both "rgb(r,g,b)" and "rgba(r,g,b,a)" formats
  const match = rgbString.match(/rgba?\(([^)]+)\)/);
  if (match) {
    const [r, g, b] = match[1].split(',').map(val => parseInt(val.trim()));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  // If not RGB format, return as-is
  return rgbString;
};