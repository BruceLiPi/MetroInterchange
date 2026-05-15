# Wuhan Metro Transfer Reminder MVP Design

## Product Summary

Build a WeChat mini program for Wuhan metro commuters who already know their route and want reliable reminders before transfer and destination stations. The first version is a focused commuting reminder tool, not a full metro navigation or real-time train tracking product.

The product starts with fixed commute routes and temporary routes, runs a foreground trip companion page during travel, estimates station progress from static line data and default segment times, and lets users quickly correct progress. Over repeated trips, the app learns personal timing profiles for saved routes.

## Goals

- Help users avoid missing transfer stations and destination stations.
- Help users reduce wrong-direction mistakes when starting a trip.
- Make common commute trips start within a few seconds.
- Keep the first version useful without relying on GPS, real-time train data, or third-party app data.
- Use local storage first so the MVP stays simple, private, and usable offline.

## Non-Goals

- Real-time train arrival or train location tracking.
- GPS-based automatic station recognition.
- Full Wuhan metro coverage in the first release.
- Nationwide city support.
- Account system or cloud sync.
- Full indoor station navigation.
- Community-shared transfer notes.
- Complex map UI.

## Target Platform

The first version is a WeChat mini program used to validate the product flow. The mini program relies on the foreground trip page for primary reminders and can use WeChat subscription messages as a fallback where platform rules allow it.

A later standalone app can improve background reliability, lock-screen alarms, vibration patterns, and stronger reminder behavior.

## First Supported Metro Scope

The MVP supports a manually maintained Wuhan metro static data set for:

- Line 1
- Line 2
- Line 4
- Line 6
- Line 8

The static data includes line names, colors, terminal directions, station order, transfer station relationships, and default travel times.

The first data version should use a clear ID such as `wuhan-metro-core-2026-05`.

## Data Strategy

The product uses static line data plus user-specific commute learning:

- Static line data provides station order, transfer relationships, line directions, and baseline segment times.
- Normal station-to-station travel defaults to about 2 minutes.
- Transfer walking and waiting defaults to about 5 minutes.
- User corrections and completed trips update a personal route timing profile.
- Personal learned timing never modifies the shared static line data.

Line data should be manually entered and checked before development. The check should confirm terminal directions, station order, transfer station IDs, same-name station reuse, colors, and version naming.

## Core User Types

- Fixed commuter: uses saved routes such as "work" and "home" repeatedly.
- Occasional traveler: creates a temporary route for one trip and may save it after completion.

## Product Experience

The product style should be minimal and reliable. The home page should be sparse and fast, while the trip page should feel like a dependable metro alarm: clear current status, few buttons, strong reminders, and no unnecessary explanation.

The desired interaction is:

1. Open the mini program.
2. Tap a fixed route or create a temporary route.
3. Confirm boarding station, direction, and next station.
4. Start reminders.
5. Watch the trip companion page while traveling.
6. Correct progress with previous station, next station, or station selection if needed.
7. Receive light and strong reminders before transfers and destination.
8. Confirm transfers after boarding the next line.
9. End the trip and let the app save learned timing for saved routes.

## Page Structure

### Home Page

Purpose: start a trip quickly.

Required content:

- Saved route cards such as work, home, and other fixed routes.
- Temporary route entry.
- Recent route shortcut.
- Static line data coverage status, such as supported Wuhan metro lines.

The home page should optimize for starting a known commute within 3 seconds.

### Trip Confirmation Page

Purpose: reduce wrong-direction and wrong-start mistakes before reminders begin.

Required content:

- Route summary with start, transfer, and destination stations.
- Boarding station confirmation.
- Direction confirmation, shown as a terminal direction.
- Next station confirmation.
- Optional WeChat subscription message authorization.
- Start reminder action.

### Trip Companion Page

Purpose: run the live trip experience.

Required content:

- Current station and next station.
- Remaining stations to next target.
- Estimated remaining time.
- Station progress indicator.
- Previous station and next station correction buttons.
- Select current station entry.
- Current target card, such as "transfer at Hongshan Square to Line 4".
- Reminder overlays for light reminder, strong reminder, and anti-oversleep confirmation.
- Transfer confirmation action after reaching a transfer station.
- End trip action.

This is the core page of the product.

### Route Create And Edit Page

Purpose: create fixed routes and temporary routes.

Required content:

- Route name.
- Line, start station, direction, and destination selection.
- Transfer creation with transfer station, target line, target direction, and optional note.
- Reminder preference override for this route.
- Save as fixed route or use once.

If line coverage is incomplete, the page only shows supported lines.

### Settings Page

Purpose: configure global reminder behavior and local data.

Required content:

- Reminder strength: quiet, obvious, anti-oversleep.
- Light reminder rule: default one station before target.
- Strong reminder rule: default 30, 45, or 60 seconds before target.
- Sound and vibration toggles.
- Local data management.
- Static line data version.

## Reminder Behavior

The MVP uses dual reminders with limited customization.

Default behavior:

- Light reminder: one station before a transfer or destination station.
- Strong reminder: 30 to 60 seconds before the target station.
- Quiet mode: page alert plus vibration.
- Obvious mode: vibration, sound, and modal alert.
- Anti-oversleep mode: repeated foreground alert until user confirms.

WeChat mini program limitations mean anti-oversleep mode is only guaranteed while the trip page is active in the foreground.

WeChat subscription messages are a fallback, not the primary precision mechanism.

Each target station keeps reminder state:

- Not reminded.
- Light reminder sent.
- Strong reminder sent.

This avoids duplicate alerts.

## Progress Estimation

When a trip starts, the app creates an ordered queue of remaining stations and transfer steps from the selected route.

Progress is estimated by:

- Static default station segment times.
- Personal route timing profile, if available.
- Manual correction events during the trip.

The app advances station progress based on estimated elapsed time. If the user corrects the station, the remaining queue and estimated times are recalculated immediately.

## Manual Correction

The trip companion page provides quick correction controls:

- Previous station.
- Next station.
- Select current station.

Correction events store the actual timestamp and selected station. At the end of a trip, the app updates the personal timing profile with a smoothed adjustment so one unusual delay does not fully override future estimates.

## Wrong Direction Detection

The MVP does not promise automatic wrong-direction detection. It uses lightweight safeguards:

- The confirmation page asks the user to confirm direction and next station before starting.
- If the user repeatedly taps previous station, the app suggests that the direction may be wrong.
- If the selected current station is not in the expected forward queue but exists in the reverse direction, the app warns that the direction may be inconsistent.

## Transfer Support

Transfers use simple prompts plus user notes.

At a transfer reminder, the app shows:

- Transfer station.
- Target line.
- Target direction.
- Optional user note, such as where to walk or which side of the platform is convenient.

The MVP does not provide indoor station navigation.

## Storage

The first version stores user data locally in the mini program:

- Saved routes.
- Temporary route state.
- Reminder preferences.
- Personal timing profiles.
- Transfer notes.

Local-first storage keeps the MVP simple and private. The tradeoff is that data may be lost when changing phones or clearing local mini program data. Cloud sync is reserved for a later version.

## MVP Feature List

Required:

- Static Wuhan metro data for lines 1, 2, 4, 6, and 8.
- Create, edit, delete, and start fixed routes.
- Create and start temporary routes.
- Save a completed temporary route as a fixed route.
- Trip confirmation with boarding station, direction, and next station.
- Trip companion page with station progress and estimated remaining time.
- Previous station, next station, and select current station correction.
- Light and strong transfer and destination reminders.
- Reminder strength settings.
- Transfer line, direction, and note display.
- Lightweight wrong-direction warnings.
- Local storage for routes, settings, notes, and personal timing.

Optional for the first release:

- WeChat subscription message fallback.
- Recent route shortcut.
- Static data version display.
- Trip completion accuracy feedback.

Deferred:

- Real-time train data.
- GPS station recognition.
- Wuhan full-line coverage beyond the chosen MVP lines.
- Cloud sync.
- Full indoor transfer navigation.
- Community notes.
- Complex map interface.

## Success Criteria

The MVP is successful if:

- A user can start a saved commute route within 3 seconds from the home page.
- The trip page makes current station, next station, next target, and remaining distance obvious.
- The user can correct station progress in one tap for common drift.
- Transfer and destination reminders fire without duplicates.
- Personal timing improves after repeated trips on the same saved route.
- The product remains useful without real-time train APIs or GPS.

## Open Decisions Before Implementation

- Which exact stations on lines 1, 2, 4, 6, and 8 should be manually verified first.
- Whether WeChat subscription messages are included in the first implementation batch or treated as a later enhancement.
- Whether the first UI prototype should use real Wuhan station data or a shortened fixture before full data entry.
