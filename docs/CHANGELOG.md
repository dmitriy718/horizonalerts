# Changelog

## [Unreleased]

### Added
- **Real Market Data:** Integrated Alpaca API for live 5-minute bar data, replacing all mock generators.
- **Advanced Charting:** Added TradingView Advanced Chart widget with Heikin Ashi, Dark Mode, and Indicators (MACD, RSI, MA).
- **Mini Charts:** Added sparkline previews to signal cards in the dashboard.
- **Auth Overhaul:** Rebuilt authentication flow with a unified `AuthPage`, `useSignup` hook, and robust error handling.
- **SEO Engine:** Implemented dynamic metadata generation for Blog and Academy pages.
- **E2E Testing:** Added `auth-flow.test.ts` covering the critical user journey.

### Changed
- **Dashboard:** Refactored into a tabbed interface (Scanner, Config, Positions).
- **Styling:** Upgraded to "Cyberpunk/Terminal" aesthetic with deep zinc backgrounds and glassmorphism.
- **Infrastructure:** Updated VPS environment variables for Stripe, Firebase, and SMTP securely.

### Removed
- **Mock Data:** Deleted `mockStream` and random price generators.
- **Legacy Auth:** Removed standalone `login` and `signup` page logic in favor of the unified `AuthPage`.