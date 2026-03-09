import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "login": "Login",
      "signup": "Sign Up",
      "email": "Email",
      "password": "Password",
      "admin_panel": "Admin Panel",
      "worker_panel": "Worker Panel",
      "dashboard": "Dashboard",
      "workers": "Workers",
      "items": "Items",
      "production": "Production",
      "payments": "Payments",
      "logout": "Logout",
      "add_item": "Add Item",
      "add_work": "Add Work",
      "add_payment": "Add Payment",
      "total_earned": "Total Earned",
      "total_received": "Total Received",
      "remaining_balance": "Remaining Balance",
      "running_laat": "Running Laat",
      "completed_laat": "Completed Laat",
    }
  },
  ur: {
    translation: {
      "login": "لاگ ان",
      "signup": "سائن اپ",
      "email": "ای میل",
      "password": "پاس ورڈ",
      "admin_panel": "ایڈمن پینل",
      "worker_panel": "ورکر پینل",
      "dashboard": "ڈیش بورڈ",
      "workers": "ورکرز",
      "items": "آئٹمز",
      "production": "پیداوار",
      "payments": "ادائیگیاں",
      "logout": "لاگ آؤٹ",
      "add_item": "آئٹم شامل کریں",
      "add_work": "کام شامل کریں",
      "add_payment": "ادائیگی شامل کریں",
      "total_earned": "کل کمائی",
      "total_received": "کل وصولی",
      "remaining_balance": "بقیہ رقم",
      "running_laat": "جاری لاٹ",
      "completed_laat": "مکمل لاٹ",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
