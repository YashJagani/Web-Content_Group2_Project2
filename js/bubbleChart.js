(async () => {
  const cityName = "Kitchener-Cambridge-Waterloo";
  const apiUrl =
    "https://countriesnow.space/api/v0.1/countries/population/cities";

  // Fetch data
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city: cityName }),
  });

  const result = await response.json();
  if (!result.data || !result.data.populationCounts) return;

  // Prepare data
  const yearMap = new Map();
  result.data.populationCounts.forEach((entry) => {
    const year = parseInt(entry.year);
    const value = parseInt(entry.value);
    if (year >= 2001 && year <= 2011 && !yearMap.has(year)) {
      yearMap.set(year, value);
    }
  });

  const data = [...yearMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, value], i) => ({
      year,
      population: value,
      r: 10 + i,
    }));

  // Hide loader
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";

  // Clean up previous chart
  const oldCanvas = document.getElementById("populationChart");
  if (oldCanvas) oldCanvas.remove();

  const oldSvg = document.querySelector(".container svg");
  if (oldSvg) oldSvg.remove();

  // Create new SVG
  const container = document.querySelector(".container");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", 800);
  svg.setAttribute("height", 500);
  container.appendChild(svg);

  // Setup chart area
  const margin = { top: 30, right: 30, bottom: 50, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const chart = d3
    .select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.year))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.population)])
    .nice()
    .range([height, 0]);

  const r = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.r))
    .range([10, 25]);

  // Axes
  chart
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .selectAll("text")
    .attr("fill", "black");

  chart
    .append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("fill", "black");

  // Bubbles
  chart
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => x(d.year))
    .attr("cy", (d) => y(d.population))
    .attr("r", (d) => r(d.r))
    .attr("fill", "rgba(255, 99, 132, 0.5)")
    .attr("stroke", "rgba(255, 99, 132, 1)");
})();
