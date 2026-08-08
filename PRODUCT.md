# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: static PWA (no build step, vanilla ES modules) deployed on GitHub Pages; Firebase Firestore free tier as shared database (realtime sync + offline persistence built into the SDK, no server code). User explicitly chose GitHub Pages as host and "something free" for the database; framework choice left to us - vanilla chosen for zero-build deploys.

## Users

Italian couples and small groups of friends/family who share expenses (household, trips, dinners). Primary scene: on the phone, right after paying something, entering the expense in seconds. Second scene: end of month, checking balances, budgets and who owes whom. The app owner (Gio) will use it with their partner and friend groups. Installed as a PWA from the browser - no app store.

## Product Purpose

Track shared expenses, split them flexibly, and settle debts with the minimum number of transfers - plus monthly envelope budgets per category. Success: both partners enter expenses without friction, always know "chi deve cosa a chi", and see where the money goes each month.

## Positioning

The best of four apps in one, in Italian, free, installable without an app store: Splitwise's flexible splitting and net balances, Settle Up's minimal-transfer settlement, Splid's no-registration group-code access and offline use, Goodbudget's monthly envelope budgets.

## Operating Context

- Access model: group code / share link, no accounts, no passwords (Splid-style). Each device remembers who the user is per group (localStorage).
- Multi-device realtime sync via Firestore; works offline, syncs when back online.
- Currency: EUR only (multi-currency explicitly deferred).
- Language: Italian UI.

## Capabilities and Constraints

Confirmed feature set (user-selected):
1. Expense splitting in groups: equal / exact amounts / percentages; net balances; "salda i conti" with minimal transfers; transfers recorded as settlements.
2. Monthly envelope budgets per category (Goodbudget-style): budget vs spent, remaining this month.
3. Recurring expenses (rent, bills, subscriptions) auto-materialized monthly.
4. Charts & statistics: per-category breakdown, **who spent per category** (explicitly requested), monthly trend.

Constraints:
- Static hosting only (GitHub Pages) - no server code; all logic client-side + Firestore rules.
- Firestore security: unguessable group IDs, list denied at group level.
- Money handled in integer cents.
- Multi-currency: deferred, not in scope.

## Evidence on Hand

None yet - greenfield. No logo or brand assets exist; name to be chosen at build time. Do not fabricate testimonials or user numbers.

## Product Principles

1. Entering an expense must take under 10 seconds - the add-expense flow is the product.
2. Zero-friction entry for invitees: open link, pick your name, done.
3. Trust through clarity: balances and settlements must always be explainable from the visible expense list.
4. Works on the worst connection: offline-first, sync is invisible.
5. Lazy engineering: no build step, no dependencies beyond Firebase SDK and Chart.js.

## Accessibility & Inclusion

Mobile-first touch targets; usable one-handed on a phone. Standard web accessibility basics (labels, contrast, focus states).
