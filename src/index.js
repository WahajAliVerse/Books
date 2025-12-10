// Entry point for the Physical AI & Humanoid Robotics Book frontend
// This file initializes all custom components and utilities

import { TranslationButton } from './components/TranslationButton';
import { Chatbot } from './components/Chatbot/Chatbot';
import { UserProfile } from './components/Personalization/UserProfile';
import { UrduTranslation } from './components/Translation/UrduTranslation';
import useTranslate from './hooks/useTranslate';
import { 
  translateText, 
  translatePage, 
  restorePage 
} from './utils/translationUtils';
import { 
  createFocusTrap,
  announceToScreenReader,
  validateAccessibility 
} from './utils/accessibilityUtils';

// Export all components and utilities
export {
  TranslationButton,
  Chatbot,
  UserProfile,
  UrduTranslation,
  useTranslate,
  translateText,
  translatePage,
  restorePage,
  createFocusTrap,
  announceToScreenReader,
  validateAccessibility
};

console.log('Physical AI & Humanoid Robotics Book components initialized');