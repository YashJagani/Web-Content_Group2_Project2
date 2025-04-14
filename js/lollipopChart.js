// DESIGNED BY KRIN SHAILESHKUMAR PATEL
(async () => {
  const cityName = "Kitchener-Cambridge-Waterloo";
  const apiUrl = "https://countriesnow.space/api/v0.1/countries/population/cities";

  async function fetchCityPopulation(city) {
    const response = await fetch(apiUrl, {
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

    return [...yearMap.entries()]
      .map(([year, value]) => ({ year: +year, population: +value }))
      .sort((a, b) => a.year - b.year);
  }

  const data = await fetchCityPopulation(cityName);
  if (!data) return;

  document.getElementById("loader").style.display = "none";
  d3.select("#populationChart").select("svg").remove();

  const margin = { top: 40, right: 30, bottom: 50, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#populationChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("max-width", "100%")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.4);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.population) * 1.1])
    .range([height, 0]);

  // X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .attr("color", "black");

  // Y axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .attr("color", "black");

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

  // Lollipop lines
  svg.selectAll("line.stem")
    .data(data)
    .enter()
    .append("line")
    .attr("x1", d => x(d.year) + x.bandwidth() / 2)
    .attr("x2", d => x(d.year) + x.bandwidth() / 2)
    .attr("y1", y(0))
    .attr("y2", d => y(d.population))
    .attr("stroke", "rgba(100, 100, 100, 0.6)")
    .attr("stroke-width", 2);

  // Lollipop circles
  svg.selectAll("circle.dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.year) + x.bandwidth() / 2)
    .attr("cy", d => y(d.population))
    .attr("r", 6)
    .attr("fill", "rgb(255, 99, 132)")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("r", 8);
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.year}</strong><br>Population: ${d.population.toLocaleString()}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 40}px`);
    })
    .on("mouseout", function () {
      d3.select(this).attr("r", 6);
      tooltip.style("opacity", 0);
    });

  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .text("Year");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .text("Population");


})();
