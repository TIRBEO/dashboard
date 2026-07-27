import type { NavLink, NavAction } from '../types';

export const navbarLinks: NavLink[] = [
  { key: 'nav.products', label: { en: 'Products', ne: 'उत्पादनहरू' }, href: 'https://tirbeo.app/products' },
  { key: 'nav.solutions', label: { en: 'Solutions', ne: 'समाधानहरू' }, href: 'https://docs.tirbeo.app/solutions' },
  { key: 'nav.docs', label: { en: 'Documents', ne: 'कागजात' }, href: 'https://docs.tirbeo.app/' },
  { key: 'nav.about', label: { en: 'About', ne: 'बारेमा' }, href: 'https://docs.tirbeo.app/about' },
];

export const navbarSignup: NavAction = {
  label: { en: 'Sign Up', ne: 'साइन अप' },
  href: 'https://accounts.tirbeo.app/login?mode=signup',
};

export const navbarLogin: NavAction = {
  label: { en: 'Login', ne: 'लग इन' },
  href: 'https://accounts.tirbeo.app/login',
};

export const navbarEarlyAccess = {
  label: { en: 'Get Early Access', ne: 'अर्ली एक्सेस पाउनुहोस्' },
  placeholder: { en: 'Enter your email', ne: 'आफ्नो इमेल राख्नुहोस्' },
  cta: { en: 'Join', ne: 'सामिल हुनुहोस्' },
  success: { en: "You're on the list!", ne: 'तपाईं सूचीमा हुनुहुन्छ!' },
  href: 'https://accounts.tirbeo.app/',
};