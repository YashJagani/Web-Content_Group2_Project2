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

  const width = 800;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 30;

  const svg = d3.select("#populationChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("max-width", "100%")
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.year))
    .range(data.map((_, i) => `hsl(${i * 30}, 70%, 60%)`));

  const arc = d3.arc()
    .innerRadius(radius * 0.6) // doughnut effect  when it loads it gives spiral effect
    .outerRadius(radius); 

  const pie = d3.pie()
    .value(d => d.population)
    .sort(null);

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

  svg.selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.year))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .on("mouseover", function (event, d) {
      d3.select(this).attr("opacity", 0.75);
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.data.year}</strong><br>Population: ${d.data.population.toLocaleString()}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 40}px`);
    })
    .on("mouseout", function () {
      d3.select(this).attr("opacity", 1);
      tooltip.style("opacity", 0);
    });

  // legend title
  svg.append("text")
    .attr("x", radius + 80)
    .attr("y", -radius + 10)
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .attr("font-size", 14)
    .text("Years");

  // legend
  const legend = svg.append("g")
    .attr("transform", `translate(${radius + 80}, ${-radius + 30})`);

  legend.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 22)
    .attr("width", 16)
    .attr("height", 16)
    .attr("fill", d => color(d.year));

  legend.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", 22)
    .attr("y", (d, i) => i * 22 + 13)
    .text(d => d.year)
    .attr("fill", "black")
    .style("font-size", "12px");

})();
