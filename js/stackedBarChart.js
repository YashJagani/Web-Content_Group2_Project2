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

  const years = [...yearMap.keys()].sort();
  const baseData = years.map((year) => yearMap.get(year));

  const dataset = years.map((year, i) => ({
    year,
    "Working Age (50%)": baseData[i] * 0.5,
    "Children (30%)": baseData[i] * 0.3,
    "Seniors (20%)": baseData[i] * 0.2,
  }));

  // Hide loader
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";

  // Remove old canvas and svg if exists
  const oldCanvas = document.getElementById("populationChart");
  if (oldCanvas) oldCanvas.remove();

  const oldSvg = document.querySelector(".container svg");
  if (oldSvg) oldSvg.remove();

  // Add new SVG
  const container = document.querySelector(".container");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", 800);
  svg.setAttribute("height", 500);
  container.appendChild(svg);

  const margin = { top: 30, right: 30, bottom: 50, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const chart = d3
    .select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const subgroups = ["Working Age (50%)", "Children (30%)", "Seniors (20%)"];
  const colors = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range(["#4caf50", "#2196f3", "#f44336"]);

  const x = d3.scaleBand().domain(years).range([0, width]).padding(0.2);

  chart
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .selectAll("text")
    .attr("fill", "black");

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(
        dataset,
        (d) => d["Working Age (50%)"] + d["Children (30%)"] + d["Seniors (20%)"]
      ),
    ])
    .nice()
    .range([height, 0]);

  chart
    .append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("fill", "black");

  const stackedData = d3.stack().keys(subgroups)(dataset);

  chart
    .selectAll("g.layer")
    .data(stackedData)
    .join("g")
    .attr("class", "layer")
    .attr("fill", (d) => colors(d.key))
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => x(d.data.year))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth());
})();
