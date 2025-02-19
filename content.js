// content.js

// Function that extracts data from the weather table
function extractWeatherData() {
    const weatherTable = document.querySelector("#so-weather-table");
    if (!weatherTable) return null;
    
    const rows = weatherTable.querySelectorAll("tbody tr");
    if (rows.length === 0) return null;
    
    let dataRows = [];
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      let rowData = [];
      cells.forEach(cell => {
        rowData.push(cell.textContent.trim());
      });
      dataRows.push(rowData);
    });
    
    // Expected table column mapping (0-indexed):
    // 0: Time (PST)
    // 1: Temp F at 5020'      (unused)
    // 2: Temp F at 4210'      <-- used for temperature conversion
    // 3: RH % at 5020'        (unused)
    // 4: RH % at 4210'        (unused)
    // 5: Min mph at 5020'     (unused)
    // 6: Spd mph at 5020'     <-- used for wind average
    // 7: Gust mph at 5020'    <-- used for maximum wind gust
    // 8: Dir deg at 5020'     <-- used for wind direction
    // 9: Pcp1 in at 4210'     <-- used for precipitation (HNW)
    // 10: PcpSum in at 4210'   (unused)
    // 11: 24Sno in at 4210'    (unused for HNS)
    // 12: SnoHt in at 4210'    <-- used for HNS calculation (newest - earliest)
    // 13: SR W/m**2 at 5020'   (unused)
    
    return dataRows;
  }
    
  // Listen for messages from the popup requesting weather data.
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getWeatherData") {
      let data = extractWeatherData();
      
      if (data) {
        // Table is already available.
        sendResponse({ data: data });
      } else {
        // Use a MutationObserver to wait for the table to appear.
        const targetNode = document.body;
        const observerOptions = { childList: true, subtree: true };
        
        const observer = new MutationObserver((mutations, obs) => {
          let newData = extractWeatherData();
          if (newData) {
            obs.disconnect();
            sendResponse({ data: newData });
          }
        });
        
        observer.observe(targetNode, observerOptions);
        
        // Fallback: after 30 seconds, disconnect and send an empty array.
        setTimeout(() => {
          observer.disconnect();
          if (!extractWeatherData()) {
            sendResponse({ data: [] });
          }
        }, 30000);
        
        // Return true to indicate that we will send a response asynchronously.
        return true;
      }
      return true;
    }
  });
  