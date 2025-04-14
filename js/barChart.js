// designed by Yashkumar Jagani

(async () => {
  const cityName = "Kitchener-Cambridge-Waterloo";
  const apiUrl = "https://countriesnow.space/api/v0.1/countries/population/cities";

  // get the population data from the api 
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city: cityName })
  });

  const result = await response.json();
  if (!result.data || !result.data.populationCounts) {
    alert("No population data found for the city.");
    return;
  }

  // display the range of year from 2001 to 2011
  const minYear = 2001;
  const maxYear = 2011;
  const yearMap = new Map();

  result.data.populationCounts.forEach(entry => {
    const year = parseInt(entry.year);
    const value = parseInt(entry.value);
    if (year >= minYear && year <= maxYear && !yearMap.has(year)) {
      yearMap.set(year, value);
    }
  });

  const data = [...yearMap.entries()]
    .map(([year, value]) => ({ year: +year, population: +value }))
    .sort((a, b) => a.year - b.year);

  document.getElementById("loader").style.display = "none";
  d3.select("#populationChart").select("svg").remove();

  const margin = { top: 40, right: 40, bottom: 50, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#populationChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("max-width", "100%")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    //display years on x axis
  const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.2);

    //display years on y axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.population) * 1.1])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .attr("color", "black");

  svg.append("g")
    .call(d3.axisLeft(y))
    .attr("color", "black");

    //display labels on x axis
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .text("Year");

    //display labels on y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .text("Population");

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.year))
    .attr("y", d => y(d.population))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.population))
    .attr("fill", "rgba(22, 74, 18, 0.6)")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill", "#145314");
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.year}</strong><br>Population: ${d.population.toLocaleString()}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 40}px`);
    })
    .on("mouseout", function () {
      d3.select(this).attr("fill", "rgba(22, 74, 18, 0.6)");
      tooltip.style("opacity", 0);
    });

})();
