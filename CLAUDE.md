# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
AtemRobbe is a breathing exercise web application with multiple themes and customizable settings. It's primarily vanilla JavaScript, HTML, and CSS.

## Build/Deployment
- This is a static web application with no build process
- To test locally, open index.html in a browser
- For production, deploy the entire directory to a web server

## Code Style Guidelines
- Use consistent camelCase for JavaScript variables and functions
- Indentation: 2 spaces
- Keep functions short and focused on a single task
- Use ES6+ JavaScript features (arrow functions, template literals, etc.)
- Maintain modular design with separate functions for different functionality
- Store user preferences in localStorage with the `atemrobbe_` prefix
- Follow existing pattern for CSS variables in themes
- Maintain accessibility features including ARIA attributes

## Naming Conventions
- CSS classes: kebab-case (e.g., timer-circle)
- JavaScript functions: camelCase (e.g., switchStylesheet)
- ID selectors: camelCase (e.g., breathingStage)
- CSS variables: --kebab-case (e.g., --primary-color)

## Error Handling
- Use try-catch for async operations, especially with audio playback
- Log errors to console with descriptive messages
- Provide user-friendly fallbacks when features fail