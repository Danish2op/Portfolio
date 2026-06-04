# Danish Corridor Shell Specification

## Overview
- **Target file:** `src/features/site/InspiredPortfolioRoute.tsx`
- **Interaction model:** click-driven overlay panels inside a fixed full-screen corridor shell
- **Inspiration basis:** `itomdev.com` single-screen paper-texture portfolio with hand-drawn controls, room map, and sketchbook panels

## Core Experience
- Full viewport, no page scroll on desktop
- Warm paper background with subtle crease texture and black ink accents
- Central hand-drawn corridor spine that acts as the visual anchor
- Floating paper buttons and clipped cards with irregular edges
- Typography mix:
  - body: `Inter`
  - handwritten accents: `Caveat` / `Gloria Hallelujah`
  - sketch labels and buttons: `Cabin Sketch`

## Required UI Regions

### 1. Brand Card
- Fixed top-left paper card
- Shows:
  - `Danish Sharma`
  - `AI Native Innovation Engineer`
  - `Computer Engineering, TIET`

### 2. Quick Controls
- Fixed top-right stack of paper buttons
- Buttons:
  - `Open Route Map`
  - `Open Project Gallery`
  - `Open Music Studio`
  - `Open Contact & Socials`

### 3. Hero / Corridor Stage
- Main heading must be:
  - `Welcome to Danish Sharma's Digital Universe`
- Supporting copy should position the site as a creative, interactive alternative to a resume
- The visual stage should include:
  - a zig-zag ink line running vertically
  - a center ring marker
  - four room markers around the corridor: `Tech Dorm`, `Education`, `Experience Row`, `Music Studio`
  - a recruiter-facing hint chip near the bottom

### 4. Route Map Dialog
- Opened by `Open Route Map`
- Accessible dialog title:
  - `Corridor Map`
- Contains room buttons:
  - `Tech Dorm`
  - `Education`
  - `Experience Row`
  - `Music Studio`
  - `Contact`
- Clicking a room closes the map and opens the corresponding detail panel

### 5. Detail Panel System
- One reusable paper panel component
- Opens from quick controls or map selections
- Each panel includes:
  - `h2` title
  - short summary paragraph
  - 2-4 clipped subcards or bullets
  - close button

## Content Requirements

### Tech Dorm
- Must include `Omni-Agent`
- Must reference React, React Native, Node.js, Python, Firebase
- Should frame Danish as AI-native and shipping-oriented

### Education
- Must include `TIET`, `7.4 CGPA`, `CBSE 83%`
- Should reference research curiosity and EV intrusion detection

### Experience Row
- Must include `LivPal`, `Tel-Aviv University`, `TFU`
- Should emphasize applied execution and adaptability

### Music Studio
- Must include `Sangeet Visharad`
- Must include `TEDx`
- Must include `Ustaad Mujtaba Hussain`

### Contact
- Avoid unverified personal contact details
- CTA can invite collaboration and role discussions without inventing URLs

## Responsive Behavior
- Desktop: fixed-screen composition with floating controls and centered corridor art
- Mobile: shell becomes vertically stacked but still keeps paper buttons and room access
- Controls must remain usable at narrow widths

## Testing Targets
- `/` renders the digital-universe heading and `Open Route Map` button
- Route map opens as a dialog
- Selecting `Tech Dorm` reveals `Omni-Agent`
- Quick action for `Open Music Studio` reveals `Sangeet Visharad`
