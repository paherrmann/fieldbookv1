# Weather Data Summarizer

This project is a Chrome extension named "Weather Data Summarizer" that extracts and summarizes weather data from the Mt. Baker Ski Area Heather Meadows Weather Station. The extension displays the summarized weather data in a popup window and allows users to copy the data to the clipboard.

## Features
- Extracts weather data from a specific table on the [Mt. Baker Ski Area weather page](https://nwac.us/weatherdata/mtbakerskiarea/now/).
- Summarizes key weather metrics including temperature, precipitation, snow height, and wind data.
- Summarizes the last 24 hours of weather data.
- Converts weather data into metric units for consistency.
- Displays the summarized data in a user-friendly table format within the extension popup.
- Provides a button to copy the summarized data to the clipboard for easy sharing.

## File Overview
- **[`content.js`](content.js )**: Contains the content script that extracts weather data from the webpage.
- **[`manifest.json`](manifest.json )**: Defines the extension's metadata, permissions, and content scripts.
- **[`popup.html`](popup.html )**: Defines the HTML structure and styling for the extension popup.
- **[`popup.js`](popup.js )**: Contains the script that processes the extracted data and updates the popup UI.
- **[`rules.json`](rules.json )**: Contains declarative net request rules to modify response headers for CORS.

## How It Works
1. The content script ([`content.js`](content.js )) runs on the specified webpage and extracts weather data from the table.
2. When the popup is opened, it sends a message to the content script to retrieve the extracted data.
3. The popup script ([`popup.js`](popup.js )) processes the data, calculates various weather metrics, and displays them in a table.
4. The script summarizes the last 24 hours of weather data and converts it into metric units for consistency.
5. Users can copy the summarized data to the clipboard using the "Copy Data" button in the popup.

## Installation
1. Clone the repository.
2. Open Chrome and navigate to [`chrome://extensions/`](content.js ).
3. Enable "Developer mode" and click "Load unpacked".
4. Select the cloned repository folder to load the extension.

## Usage
1. Navigate to the [Mt. Baker Ski Area weather page](https://nwac.us/weatherdata/mtbakerskiarea/now/).
2. Click on the extension icon to open the popup.
3. View the summarized weather data and use the "Copy Data" button to copy the data to the clipboard.

## Project Structure