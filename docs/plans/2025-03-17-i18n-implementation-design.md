# i18n Implementation Design

## Goal

Add internationalization (i18n) to Byakko Admin Panel with Spanish and English support.

## Requirements

- Two languages: Spanish (es) and English (en)
- Language selector with flags: 🇲🇽 (Mexico) and 🇺🇸 (USA)
- Selector position: 
  - Login page: bottom-left corner (opposite to theme toggle)
  - Dashboard: sidebar bottom
- Default language: detect from browser (`navigator.language`)
- Persist user preference in localStorage
- All UI text must be translatable

## Technology Choice

**react-i18next** + **i18next-browser-languagedetector**

Reasons:
- Industry standard for React i18n
- Built-in browser language detection
- Automatic localStorage persistence
- Simple hook-based API (`useTranslation`)
- Tree-shakeable, well-maintained

## Architecture

### File Structure

```
src/
├── i18n/
│   ├── index.ts              # i18next configuration
│   └── locales/
│       ├── en.json           # English translations
│       └── es.json           # Spanish translations
```

### Language Detection Flow

```
User visits app
    ↓
i18next-browser-languagedetector checks:
    1. localStorage (saved preference)
    2. navigator.language (browser setting)
    ↓
Falls back to 'en' if nothing found
    ↓
User changes language via selector
    ↓
i18next saves to localStorage automatically
```

### Components

#### LanguageSelector

Reusable component with flag buttons:
- 🇲🇽 button → sets language to 'es'
- 🇺🇸 button → sets language to 'en'
- Highlights current language
- No text labels, just flags

**Usage locations:**
- Login page: `<LanguageSelector />` in fixed position bottom-left
- Dashboard: `<LanguageSelector />` inside sidebar footer

### Translation Keys Structure

Organized by feature/module for maintainability:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "loading": "Loading...",
    "noResults": "No results found"
  },
  "login": {
    "title": "Byakko Admin",
    "subtitle": "Restricted access — authorized personnel only",
    "email": "Email",
    "password": "Password",
    "submit": "Sign in",
    "submitting": "Signing in…",
    "error": "Invalid credentials. Check your email and password."
  },
  "nav": {
    "dashboard": "Dashboard",
    "clients": "Clients",
    "users": "Users",
    "categories": "Categories",
    "permissions": "Permissions",
    "relationConditions": "Relation Conditions"
  },
  "clients": {
    "title": "Clients",
    "createButton": "New Client",
    "columns": {
      "name": "Name",
      "email": "Email",
      "status": "Status",
      "createdAt": "Created At"
    }
  },
  "users": {
    "title": "Users",
    "createButton": "New User"
  },
  "categories": {
    "title": "Categories"
  },
  "permissions": {
    "title": "Permissions"
  },
  "relationConditions": {
    "title": "Relation Conditions"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Enter a valid email address"
  }
}
```

## Implementation Tasks

1. Install dependencies: `react-i18next`, `i18next`, `i18next-browser-languagedetector`
2. Create i18n configuration in `src/i18n/index.ts`
3. Create translation files: `src/i18n/locales/en.json` and `es.json`
4. Initialize i18n in `main.tsx`
5. Create `LanguageSelector` component
6. Add `LanguageSelector` to Login page (bottom-left)
7. Add `LanguageSelector` to Sidebar (bottom)
8. Replace all hardcoded strings with `t('key')` calls across:
   - Login page
   - Dashboard
   - Clients (list + detail)
   - Users (list + detail)
   - Categories
   - Permissions
   - Relation Conditions
   - Common components (DataTable, forms, etc.)

## Testing Checklist

- [ ] First visit: language matches browser setting
- [ ] Language persists on page reload
- [ ] Language selector changes language immediately
- [ ] All text is translated (no hardcoded strings)
- [ ] Both languages work in all pages