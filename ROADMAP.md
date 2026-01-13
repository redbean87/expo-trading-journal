# Trading Journal App - Roadmap

## Current State (as of January 2026)

The app has a solid foundation with:
- **4 main screens**: Home (dashboard), Trades (list), Add Trade (form), Analytics
- **Authentication**: Email/password via Convex Auth
- **Real-time sync**: Convex backend with live data updates
- **CSV import**: With duplicate detection
- **Dark/light theme**: Persisted with Zustand

---

## Planned Features

### High Priority

- [ ] **Trade Edit** - Modify existing trades (currently only add/delete)
- [ ] **Search & Filter** - Filter trades by symbol, side, date range, strategy
- [ ] **Trade Detail Screen** - Modal/screen to view full trade details
- [ ] **CSV Export** - Export trades to CSV for backup/analysis

### Medium Priority

- [ ] **Equity Curve Chart** - Visual chart showing P&L over time
- [ ] **Monthly/Weekly Breakdown** - Performance grouped by time period
- [ ] **Drawdown Analysis** - Max consecutive losses, percentage drawdown
- [ ] **Trade Duration Analysis** - Average time in trades
- [ ] **Risk/Reward Ratio** - Per-trade and aggregate analysis

### Low Priority / Nice to Have

- [ ] **Screenshot Attachments** - Add images to trades for chart analysis
- [ ] **Position Sizing Calculator** - Calculate size based on risk %
- [ ] **Trade Goals** - Daily/weekly/monthly P&L targets
- [ ] **Notifications** - Milestone alerts (reached $X profit, etc.)
- [ ] **Onboarding Tutorial** - First-time user walkthrough

### Quick Wins

- [ ] **CSV Side Detection** - Detect 'short' positions from CSV (currently defaults to 'long')
- [ ] **Pull-to-Refresh** - On trades list
- [ ] **Loading Skeletons** - During data fetch

---

## Auth Enhancements

- [ ] Password reset / forgot password flow
- [ ] Social auth (Google, Apple)
- [ ] User profile management
- [ ] Account deletion

## Convex Backend Enhancements

- [ ] Advanced analytics queries (TypeScript queries for reports)
- [ ] Offline support improvements (mutation queue when offline)
- [ ] Test real-time sync across multiple devices

---

## Technical Improvements

- [ ] Offline mode with sync queue
- [ ] Expand test coverage
- [ ] E2E tests for critical flows

---

## Completed Features

- [x] Home dashboard with key metrics
- [x] Trades list with delete functionality
- [x] Add trade form with P&L preview
- [x] Analytics screen with win rate, profit factor, side analysis
- [x] CSV import with duplicate detection
- [x] Email/password authentication
- [x] Dark/light theme toggle
- [x] Real-time data sync via Convex
