/**
 * Colors used in the app, structured for light and dark modes.
 * Includes colors for text, titles, placeholders, background, foreground, and tint.
 */

const yellowTint = '#f4ce0c';  // A shade of yellow for tint and selected icons
const lightGrey = '#f0f0f0';    // A greyish background color for light mode
const darkGrey = '#2c2c2c';     // A greyish background color for dark mode

export const Colors = {
  light: {
    text: '#11181C',                // Primary text color
    placeholderText: '#888',        // Placeholder text color
    background: lightGrey,          // Light greyish background color
    foreground: '#ffffff',          // Foreground white color
    tint: yellowTint,               // Yellowish tint for icons and selected items
    tabIconDefault: '#687076',      // Default tab icon color
    tabIconSelected: yellowTint,    // Selected tab icon color
    activityIndicator: yellowTint, // Activity indicator color
  },
  dark: {
    text: '#ECEDEE',                // Primary text color in dark mode
    titles: '#ffffff',              // Title text color in dark mode (white for contrast)
    placeholderText: '#aaa',        // Placeholder text color in dark mode
    background: darkGrey,           // Dark greyish background color
    foreground: '#151718',          // Foreground color, keeping a dark theme
    tint: yellowTint,               // Yellowish tint for icons and selected items in dark mode
    icon: '#9BA1A6',                // Icon color (for unselected icons in dark mode)
    tabIconDefault: '#9BA1A6',      // Default tab icon color in dark mode
    tabIconSelected: yellowTint,    // Selected tab icon color in dark mode
    activityIndicator: yellowTint, // Activity indicator color in dark mode
  },
};
