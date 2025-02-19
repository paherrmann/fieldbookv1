document.addEventListener('DOMContentLoaded', () => {
    // Query the active tab so we can send it a message.
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "getWeatherData" }, response => {
          if (response && response.data && response.data.length > 0) {
            const dataRows = response.data;
            console.log("Popup received weather data:", dataRows);
            
            // Expected column mapping (0-indexed):
            // 0: Time (PST)
            // 1: Temp F at 5020' (unused)
            // 2: Temp F at 4210' <-- temperature (for conversion)
            // 3: RH % at 5020' (unused)
            // 4: RH % at 4210' (unused)
            // 5: Min mph at 5020' (unused)
            // 6: Spd mph at 5020' <-- wind average
            // 7: Gust mph at 5020' <-- wind gust (max)
            // 8: Dir deg at 5020'  <-- wind direction
            // 9: Pcp1 in at 4210' <-- precipitation for HNW
            // 10: PcpSum in at 4210' (unused)
            // 11: 24Sno in at 4210' (unused for HNS)
            // 12: SnoHt in at 4210' <-- used for HNS calculation (newest minus earliest)
            // 13: SR W/m**2 at 5020' (unused)
            
            // Process temperature (from index 2)
            let tempsF = dataRows.map(r => parseFloat(r[2])).filter(v => !isNaN(v));
            const tempsC = tempsF.map(f => ((f - 32) * 5 / 9));
            const minTempC = Math.min(...tempsC).toFixed(1);
            const maxTempC = Math.max(...tempsC).toFixed(1);
            
            // Compute HNW (mm): Sum of Pcp1 values (index 9), converting inches to mm (×25.4)
            let pcp1Values = dataRows.map(r => parseFloat(r[9])).filter(v => !isNaN(v));
            const totalPcp1 = pcp1Values.reduce((sum, v) => sum + v, 0);
            const HNW_mm = (totalPcp1 * 25.4).toFixed(1);
            
            // Compute HNS (cm): Difference between newest and earliest SnoHt (index 12), converting inches to cm (×2.54)
            let snoValues = dataRows.map(r => parseFloat(r[12])).filter(v => !isNaN(v));
            const HNS_cm = ((snoValues[0] - snoValues[snoValues.length - 1]) * 2.54).toFixed(1);
            
            // Compute wind: average of wind speeds (index 6) and maximum gust (index 7)
            let windSpeeds = dataRows.map(r => parseFloat(r[6])).filter(v => !isNaN(v));
            const avgWindMph = windSpeeds.reduce((sum, v) => sum + v, 0) / windSpeeds.length;
            const avgWindKmh = (avgWindMph * 1.60934).toFixed(1);
            
            let windGusts = dataRows.map(r => parseFloat(r[7])).filter(v => !isNaN(v));
            const maxWindMph = Math.max(...windGusts);
            const maxWindKmh = (maxWindMph * 1.60934).toFixed(1);
            
            // Wind direction from the most recent row (index 8)
            let windDirDeg = parseFloat(dataRows[0][8]);
            function degToCardinal(deg) {
              const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                                  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
              const index = Math.floor((deg + 11.25) / 22.5) % 16;
              return directions[index];
            }
            const windDirCardinal = degToCardinal(windDirDeg);
            
            // Build summary table with headers:
            // Wx, "Min (°C)", "Max (°C)", "HNW (mm)", "HNS (cm)", "Avg (km/h)", "Max (km/h)", "Dir"
            const headers = ["Wx", "Min (°C)", "Max (°C)", "HNW (mm)", "HNS (cm)", "Avg (km/h)", "Max (km/h)", "Dir"];
            const summaryRow = [
              "L24", minTempC, maxTempC, HNW_mm, HNS_cm, avgWindKmh, maxWindKmh, windDirCardinal
            ];
            
            // Create the summary table element.
            const container = document.getElementById("table-container");
            container.innerHTML = "";
            const table = document.createElement("table");
            
            const thead = document.createElement("thead");
            const headerRowEl = document.createElement("tr");
            headers.forEach(text => {
              const th = document.createElement("th");
              th.textContent = text;
              headerRowEl.appendChild(th);
            });
            thead.appendChild(headerRowEl);
            table.appendChild(thead);
            
            const tbody = document.createElement("tbody");
            const dataRowEl = document.createElement("tr");
            summaryRow.forEach(text => {
              const td = document.createElement("td");
              td.textContent = text;
              dataRowEl.appendChild(td);
            });
            tbody.appendChild(dataRowEl);
            table.appendChild(tbody);
            container.appendChild(table);
            
            // --- Add a Copy Button ---
            // This button will copy the summary row data, excluding the header and the first column ("Wx").
            const copyBtn = document.createElement("button");
            copyBtn.textContent = "Copy Data";
            copyBtn.style.marginTop = "10px";
            copyBtn.addEventListener("click", () => {
              // Exclude the first column ("Wx") from the summaryRow.
              const dataToCopy = summaryRow.slice(1).join("\t"); // Tab-delimited
              navigator.clipboard.writeText(dataToCopy)
                .then(() => {
                  console.log("Data copied to clipboard:", dataToCopy);
                })
                .catch(err => {
                  console.error("Error copying data:", err);
                });
            });
            container.appendChild(copyBtn);
          } else {
            document.getElementById("table-container").textContent = "No weather data found.";
          }
        });
      }
    });
  });
  