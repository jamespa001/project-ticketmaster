![Ticketmaster CI](https://github.com/jamespa001/project-ticketmaster/actions/workflows/ci.yml/badge.svg)

### [Ticketmaster Clone]

A full-stack event discovery and ticketing platform inspired by Ticketmaster, built with Next.js App Router, Tailwind CSS, Firebase, and the Ticketmaster Discovery API.

### [Key Features]

- Event Discovery & Search: Real-time event search powered by the Ticketmaster Discovery API with robust keyword and location-based filtering.
- Dynamic Event Details: Immersive event pages featuring date/time formatting, venue details, interactive order summaries, and deterministic pricing fallbacks.
- Secure Authentication: User sign-in and session management powered by Firebase Authentication.
- Seamless Checkout: End-to-end payment processing integrated with Stripe Checkout.
- Responsive Architecture: Built mobile-first with a modern, high-converting two-column layout styled using Tailwind CSS.

### [Tech Stack]

- Frontend & Framework: Next.js (App Router), React, Tailwind CSS
- APIs & Services: Ticketmaster Discovery API, Stripe API
- Backend & Auth: Firebase Auth & Firestore
- Deployment: Vercel

### 📁 Project Structure

```text
public/
└── reports/
    └── test-results/           # Vitest JSON test execution outputs for the Admin Dashboard
src/
├── __tests__/                  # Integration & end-to-end test suites (auth-gate, booking, search)
├── app/                        # Next.js App Router (pages and API endpoints)
│   ├── admin/                  # Tiered test reporting & quality monitoring dashboard
│   ├── api/                    # Backend API routes (Stripe checkout, Event handlers)
│   ├── checkout/success/       # Order success & confirmation page
│   ├── events/                 # Dynamic event detail & multi-step checkout pages
│   ├── profile/                # User account & profile management
│   ├── search/                 # Event discovery & keyword search filters
│   ├── tickets/                # User ticket view & management
│   ├── globals.css             # Global Tailwind styles
│   ├── layout.tsx              # Root layout with global styling & providers
│   └── page.tsx                # Home / landing page
├── components/                 # Reusable UI components & corresponding unit tests (.test.tsx)
├── context/                    # React Context providers (Auth, Theme management)
├── lib/                        # External service configuration & utilities (Firebase, userService)
└── test/                       # Test environment setup & global mocks
```

### 🛡️ Admin Dashboard & Quality Monitoring

The application features a secure, role-based Admin Dashboard (`/admin`) that parses live Vitest JSON test execution artifacts (`public/reports/test-results/latest.json`) to monitor build and test health in real time.

<p align="center">
  <img src="./public/screenshots/admin-dashboard.png" alt="Ticketmaster Admin Dashboard" width="900" style="border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);" />
</p>

#### **Demo Admin Access**

To explore the admin features locally or in production, you can sign in using the pre-configured admin account:

- **Email**: `admin@tmclone.com`
- **Password**: `admin@tampa.FL`
- **Security**: Enforces strict Firestore role verification (`users/{uid}` with `role: "admin"`), automatically redirecting unauthorized users.

## ♿ Accessibility & Quality Assurance (WCAG 2.1 AA)

This application was engineered and audited to meet strict WCAG 2.1 AA accessibility standards, ensuring full screen-reader support, keyboard navigation, and high-contrast usability across event search results, filtering tools, and interactive booking flows.

### Audit Summary

- **Lighthouse Accessibility Score:** 100% 🟢
- **axe DevTools Violations:** Reduced down to **0 violations**.

### Key Accessibility Enhancements

- **High-Contrast Theme Adaptation:** Refined text contrast and muted palette tokens against the dark theme to consistently exceed the 4.5:1 ratio requirement.
- **Keyboard Navigation & Focus States:** Verified robust tab-indexing, visible focus rings, and full `Enter`/`Space` activation across event cards, search inputs, and pagination controls.
- **Screen Reader & ARIA Support:** Added descriptive `aria-label` attributes to icon-only buttons (such as bookmarks and filters), explicit `alt` text for artist banners, and live region announcements for dynamic search results.

---

### axe DevTools Audit: Before & After

| Before Accessibility Refactor                                                | After WCAG 2.1 AA Compliance                                               |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| ![axe DevTools Before](./public/screenshots/Accessibility.axeDev.before.png) | ![axe DevTools After](./public/screenshots/Accessibility.axeDev.after.png) |
| _Identified contrast adjustments, missing icon labels, and focus ring gaps._ | _Zero errors or warnings — fully verified and production-ready._           |

### Lighthouse Accessibility Score

<p align="center">
  <img src="./public/screenshots/Accessibility.Lighthouse.after.png" alt="Ticketmaster Lighthouse Accessibility Score 100 percent" width="600" />
</p>

### 🚀 Core Web Vitals & Performance Optimization

By systematically refactoring legacy HTML `<img>` tags to Next.js's optimized `<Image />` component, configuring proper image sizing, setting up `remotePatterns` for CDN assets, and utilizing priority loading for hero views, we achieved dramatic performance gains.

| Metric                             | Before Optimization | After Optimization | Improvement         |
| :--------------------------------- | :------------------ | :----------------- | :------------------ |
| **Lighthouse Score**               | **54**[cite: 1]     | **97**[cite: 3]    | **+43 Points** 🚀   |
| **Largest Contentful Paint (LCP)** | **8.6 s**[cite: 1]  | **0.8 s**[cite: 3] | **10.7x Faster** ⚡ |
| **First Contentful Paint (FCP)**   | **4.3 s**[cite: 1]  | **0.2 s**[cite: 3] | **21.5x Faster** ⚡ |

#### Performance Audits

- **Before Optimization (Score: 54):**  
  ![Performance Before](./public/screenshots/Performance.Lighthouse.before.png)
- **After Optimization (Score: 97):**  
  ![Performance After](./public/screenshots/Performance.Lighthouse.after.png)
