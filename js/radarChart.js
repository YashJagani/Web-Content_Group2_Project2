// DESIGNED BY KRIN SHAILESHKUMAR PATEL
(async () => {
  const city = "Kitchener-Cambridge-Waterloo";

  async function fetchCityPopulation(city) {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/population/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city })
    });

    const result = await response.json();
    const yearMap = new Map();

    result.data.populationCounts.forEach(entry => {
      const year = parseInt(entry.year);
      const value = parseInt(entry.value);
      if (year >= 2001 && year <= 2011 && !yearMap.has(year)) {
        yearMap.set(year, value);
      }
    });

    return [...yearMap.entries()].map(([year, value]) => ({
      year: String(year),
      population: value
    }));
  }

  const data = await fetchCityPopulation(city);
  if (!data) return;

  document.getElementById("loader").style.display = "none";
  d3.select("#populationChart").select("svg").remove();

  const width = 600;
  const height = 500;
  const radius = 200;
  const levels = 5;

  const svg = d3.select("#populationChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("max-width", "100%")
    .append("g")
    .attr("transform", `translate(${width / 2 - 50},${height / 2})`);

  const angleSlice = (2 * Math.PI) / data.length;
  const maxValue = d3.max(data, d => d.population);

  // grid circles
  for (let level = 0; level < levels; level++) {
    const r = radius * ((level + 1) / levels);
    svg.append("circle")
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2");
  }

  // axis
  const axis = svg.selectAll(".axis")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "axis");

  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("stroke", "#999");

  axis.append("text")
    .attr("x", (d, i) => (radius + 10) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y", (d, i) => (radius + 10) * Math.sin(angleSlice * i - Math.PI / 2))
    .style("font-size", "12px")
    .attr("text-anchor", "middle")
    .text(d => d.year);

  // tooltip div
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

  // radar line
  const radarLine = d3.lineRadial()
    .radius(d => (d.population / maxValue) * radius)
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  svg.append("path")
    .datum(data)
    .attr("d", radarLine)
    .attr("fill", "rgba(54, 162, 235, 0.2)")
    .attr("stroke", "rgb(54, 162, 235)")
    .attr("stroke-width", 2);

  // points when hover
  svg.selectAll(".radar-dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => (d.population / maxValue) * radius * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("cy", (d, i) => (d.population / maxValue) * radius * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("r", 5)
    .attr("fill", "rgb(54, 162, 235)")
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.year}</strong><br>Population: ${d.population.toLocaleString()}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 40}px`);
      d3.select(this).attr("r", 7);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
      d3.select(this).attr("r", 5);
    });

  // legend
  svg.append("rect")
    .attr("x", radius + 30)
    .attr("y", -radius)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", "rgb(54, 162, 235)");

  svg.append("text")
    .attr("x", radius + 48)
    .attr("y", -radius + 10)
    .text("Population Data")
    .attr("font-size", "13px")
    .attr("alignment-baseline", "middle");


})();
