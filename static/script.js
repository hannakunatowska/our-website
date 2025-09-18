
// --- Definitions ---

const PIXELS_PER_MHZ = 5; // Sets constant "PIXELS_PER_MHZ" to 5 (vertical scaling)
const BAND_WIDTH = 900; // Sets constant "BAND_WIDTH" to 900 (horizontal scaling)
const FREQ_LINE_STEP = 5; // Sets constant "FREQ_LINE_STEP" to 5 (how often frequency marks appear on the line)
const HORIZONTAL_GAP = 4; // Sets constant "HORIZONTAL_GAP" to 4 (horizontal padding between boxes)

const svg = document.getElementById("spectrum"); // References constant "svg" to HTML element (from index.html) "spectrum"
const freq_line = document.getElementById("freq_line"); // References constant "freq_line" to HTML element (from index.html) "freq_line"
const waveformCanvas = document.getElementById("waveform"); // References constant "waveformCanvas" to HTML canvas element (from index.html) "waveform"

// --- Functions ---

fetch("/static/data.json") // Load "/static/data.json"
  .then(r => r.json()) // When the load is complete, parse the file into a JavaScript object
  .then(rawData => { // When the parse is complete, process the data
    const bands = rawData.map((b, i) => ({ // Transform each object in the rawData array into a new object using mapping
      id: "band" + i, // Give each band a unique ID using its index
      name: b.användningsområde, // Take the 'användningsområde' field from JSON and store it as 'name'
      start_mhz: parseFloat(b.startfrekvens), // Convert the 'startfrekvens' string to a number
      end_mhz: parseFloat(b.slutfrekvens) // Convert the 'slutfrekvens' string to a number
    }));

    drawSpectrum(bands); // Call function "drawSpectrum" with "bands" as argument
    drawFreqline(bands); // Call function "drawFreqline" with "bands" as argument
    drawWaveform(bands); // Call function "drawWaveform" with "bands" as argument
  });

function drawSpectrum(bands) {

    /*
    Draws the frequency spectrum.

    Arguments:
        "bands": The frequency bands fetched from "data.json"

    Returns:
        None
    */

  const min = Math.min(...bands.map(b => b.start_mhz)); // Sets constant "min" to the lowest frequency using object "Math" and array method "map"
  const max = Math.max(...bands.map(b => b.end_mhz)); // Sets constant "max" to the highest frequency using object "Math" and array method "map"

  const totalHeight = (max - min) * PIXELS_PER_MHZ; // Sets constant "totalHeight" to the difference between the highest and the lowest frequency multiplied by the amount of pixels per MHz

  svg.setAttribute("width", BAND_WIDTH); // Sets the svg width to "BAND_WIDTH"
  svg.setAttribute("height", totalHeight); // Sets the svg height to "totalHeight"

  const colors = ["#60a5fa", "#34d399", "#f472b6", "#fbbf24", "#a78bfa", "#67e8f9"]; // Sets constant "colors" to six different color codes

  bands.sort((a,b) => a.start_mhz - b.start_mhz); // Sorts the bands by start frequency

  // Track occupied columns: array of arrays of bands per column
  const columns = [];

  bands.forEach((b, i) => {
    const yStart = (b.start_mhz - min) * PIXELS_PER_MHZ;
    const yEnd = (b.end_mhz - min) * PIXELS_PER_MHZ;
    const h = Math.max(yEnd - yStart, 10);

    // Find the first column where this band doesn't overlap
    let colIndex = 0;
    while (true) {
      if (!columns[colIndex]) columns[colIndex] = [];
      const overlaps = columns[colIndex].some(bb => !(yEnd <= bb.yStart || yStart >= bb.yEnd));
      if (!overlaps) break;
      colIndex++;
    }

    // Assign band to this column
    columns[colIndex].push({yStart, yEnd});

    // Determine total number of columns at this vertical slice
    let activeCols = columns.filter(c => c.some(bb => !(yEnd <= bb.yStart || yStart >= bb.yEnd)));
    const numCols = activeCols.length;
    const widthPerBand = (BAND_WIDTH - (numCols + 1) * HORIZONTAL_GAP) / numCols;
    const x = HORIZONTAL_GAP + colIndex * (widthPerBand + HORIZONTAL_GAP);

    const rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", yStart);
    rect.setAttribute("width", widthPerBand);
    rect.setAttribute("height", h);
    rect.setAttribute("rx", 6);
    rect.setAttribute("fill", colors[i % colors.length]);
    rect.setAttribute("fill-opacity", "0.9");
    rect.setAttribute("stroke", colors[i % colors.length]);
    rect.setAttribute("stroke-opacity", "0.5");
    svg.appendChild(rect);

    // Centered text
    const label = document.createElementNS("http://www.w3.org/2000/svg","text");
    label.setAttribute("x", x + widthPerBand/2);
    label.setAttribute("y", yStart + h/2);
    label.setAttribute("fill", "white");
    label.setAttribute("font-size", "12");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.textContent = `${b.name} (${b.start_mhz}-${b.end_mhz} MHz)`;
    svg.appendChild(label);
  });
}

function drawFreqline(bands) {
    
    /*
    Draws the frequency line.

    Arguments:
        "bands": The frequency bands fetched from "data.json"

    Returns:
        None
    */

    const min = Math.min(...bands.map(b => b.start_mhz)); // Sets constant "min" to the lowest frequency using object "Math" and array method "map"
    const max = Math.max(...bands.map(b => b.end_mhz)); // Sets constant "max" to the highest frequency using object "Math" and array method "map"

    const totalHeight = (max - min) * PIXELS_PER_MHZ; // Sets constant "totalHeight" to the difference between the highest and the lowest frequency multiplied by the amount of pixels per MHz

    freq_line.style.height = totalHeight + "px"; // Sets the frequency line's height to "totalHeight" (CSS requires "+ "px"")

    for (let f = Math.ceil(min / FREQ_LINE_STEP) * FREQ_LINE_STEP; f <= max; f += FREQ_LINE_STEP) { // Loop through frequencies from just above 'min' to 'max' in steps of RULER_STEP
        const mark = document.createElement("div"); // Create a new "div element" to represent one frequency mark
        mark.className = "freq_line-mark"; // Assign a CSS class for styling
        mark.style.top = (f - min) * PIXELS_PER_MHZ + "px";
        mark.textContent = f + " MHz";
        freq_line.appendChild(mark);
    }
}

// Smooth waveform increasing with frequency
function drawWaveform(bands) {
  const min = Math.min(...bands.map(b => b.start_mhz));
  const max = Math.max(...bands.map(b => b.end_mhz));
  const totalHeight = (max - min) * PIXELS_PER_MHZ;

  waveformCanvas.width = 80;
  waveformCanvas.height = totalHeight;
  const ctx = waveformCanvas.getContext("2d");
  ctx.strokeStyle = "#5eead4";
  ctx.lineWidth = 2;

  const amplitude = 25;
  const startFreq = 0.5;  // higher starting frequency
  const endFreq = 12;     // much higher ending frequency

  ctx.beginPath();
  for (let y = 0; y <= totalHeight; y++) {
    const t = y / totalHeight; // 0 → 1
    const freq = startFreq + t * (endFreq - startFreq);
    const x = 40 + Math.sin(y * freq * 0.1) * amplitude;
    if (y === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}