document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "getWeatherData" }, response => {
        if (response && response.data && response.data.length > 0) {
          const dataRows = response.data;
          console.log("Popup received weather data:", dataRows);
          
          // Process temperature (from index 2)
          let tempsF = dataRows.map(r => parseFloat(r[2])).filter(v => !isNaN(v));
          const tempsC = tempsF.map(f => ((f - 32) * 5 / 9));
          const minTempC = Math.min(...tempsC).toFixed(1);
          const maxTempC = Math.max(...tempsC).toFixed(1);
          
          // Compute HNW (mm): Sum of Pcp1 values (index 9)
          let pcp1Values = dataRows.map(r => parseFloat(r[9])).filter(v => !isNaN(v));
          const totalPcp1 = pcp1Values.reduce((sum, v) => sum + v, 0);
          const HNW_mm = (totalPcp1 * 25.4).toFixed(1);
          
          // Compute HNS (cm): Difference between newest and earliest SnoHt
          let snoValues = dataRows.map(r => parseFloat(r[12])).filter(v => !isNaN(v));
          const HNS_cm = ((snoValues[0] - snoValues[snoValues.length - 1]) * 2.54).toFixed(1);
          
          // Process wind data
          let windSpeeds = dataRows.map(r => parseFloat(r[6])).filter(v => !isNaN(v));
          const avgWindKph = (windSpeeds.reduce((sum, v) => sum + v, 0) / windSpeeds.length * 1.60934).toFixed(1);
          
          let windGusts = dataRows.map(r => parseFloat(r[7])).filter(v => !isNaN(v));
          const maxWindKph = (Math.max(...windGusts) * 1.60934).toFixed(1);
          
          const windDirDeg = parseFloat(dataRows[0][8]);
          const windDir = getWindDirection(windDirDeg);

          const tableHTML = `
            <table>
              <thead>
                <tr>
                  <th>Temp Range</th>
                  <th>HNW</th>
                  <th>HNS</th>
                  <th>Max Wind</th>
                  <th>Avg Wind</th>
                  <th>Dir</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${minTempC}°C to ${maxTempC}°C</td>
                  <td>${HNW_mm} mm</td>
                  <td>${HNS_cm} cm</td>
                  <td>${maxWindKph} km/h</td>
                  <td>${avgWindKph} km/h</td>
                  <td>${windDir}</td>
                </tr>
              </tbody>
            </table>
            <button id="copyData">Copy Data</button>
          `;
          
          document.getElementById('table-container').innerHTML = tableHTML;
          
          document.getElementById('copyData').addEventListener('click', () => {
            const summaryText = `${minTempC}°C to ${maxTempC}°C\t${HNW_mm}\t${HNS_cm}\t${avgWindKph}\t${maxWindKph}\t${windDir}`;
            navigator.clipboard.writeText(summaryText);
          });
        } else {
          document.getElementById('table-container').innerHTML = 'No weather data available';
        }
      });
    }
  });
});

function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}
