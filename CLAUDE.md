# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
AtemRobbe is a breathing exercise Progressive Web App (PWA) designed to help with breathing exercises against functional breathing disorders, panic attacks, and stress. It's built with vanilla JavaScript, HTML5, and CSS3 with no build process or dependencies.

## Architecture
- **Service Worker** (service-worker.js): Handles offline functionality and caching. Updates require incrementing CACHE_NAME version.
- **Main App Logic** (js/script.js): Manages breathing animations, exercise timing, user preferences via localStorage, and theme switching.
- **Themes**: Multiple CSS theme files in css/ directory. Each theme must define all CSS variables from base.css.
- **PWA Features**: manifest.json defines app metadata, icons, and shortcuts for installability.

## Development & Testing
- No build process - directly open index.html in a browser
- Test service worker updates by incrementing cache version and hard-refreshing
- Test offline functionality by disabling network in browser DevTools
- GitHub Pages deployment via .github/workflows/static.yml on push to main

## Common Tasks

### Adding a New Theme
1. Create new CSS file in css/ directory following existing theme patterns
2. Add theme button to index.html style modal (line ~140-147)
3. Add color swatch case in js/script.js addStyleSwatches() function
4. Add theme file to THEMES array in service-worker.js
5. Include corresponding background image in images/bg_[themename].webp

### Updating the App
1. Make code changes
2. Update CACHE_NAME version in service-worker.js (increment number)
3. Update version in index.html credits section (format: YYYY-MM-DD-XX)
4. Add changelog entry in index.html changelog modal
5. Commit with descriptive message

## Critical Implementation Details
- All user preferences stored with `atemrobbe_` prefix in localStorage
- Breathing circle animation uses requestAnimationFrame for smooth performance
- Audio files preloaded in HTML for immediate playback
- Themes must maintain accessibility with sufficient color contrast
- Modal content must remain readable across all themes

## File Structure Highlights
- index.html: Main app with inline changelog in accordion format
- css/base.css: Core styles and CSS variable definitions
- css/styles.css: Default theme
- service-worker.js: Lists all cacheable assets - must be updated when adding files