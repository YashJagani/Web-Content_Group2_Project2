(() => {
  const city = "Kitchener-Cambridge-Waterloo";

  async function fetchCityPopulation(city) {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/population/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city })
    });

    const result = await response.json();

    if (!result.data || !result.data.populationCounts) {
      console.error("Invalid data received from API");
      return { labels: [], data: [] };
    }

    const yearMap = new Map();
    result.data.populationCounts.forEach(entry => {
      const year = parseInt(entry.year);
      const value = parseInt(entry.value);
      if (year >= 2001 && year <= 2011 && !yearMap.has(year)) {
        yearMap.set(year, value);
      }
    });

    const years = [...yearMap.keys()].sort((a, b) => a - b);
    return { labels: years.map(String), data: years.map(y => yearMap.get(y)) };
  }

  (async () => {
    const { labels, data } = await fetchCityPopulation(city);
    document.getElementById("loader").style.display = "none";

    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#polarChart")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const angleSlice = Math.PI * 2 / labels.length;

    const scale = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, radius]);

    const radarLine = d3.lineRadial()
      .radius(d => scale(d))
      .angle((d, i) => i * angleSlice);

    const chartData = data.map(d => ({ value: d }));

    svg.selectAll(".radar-area")
      .data([chartData])
      .enter().append("path")
      .attr("class", "radar-area")
      .attr("d", radarLine)
      .style("fill", "rgba(0, 123, 255, 0.6)")
      .style("stroke", "#007bff")
      .style("stroke-width", 2);

    const axis = svg.selectAll(".axis")
      .data(labels)
      .enter().append("g")
      .attr("class", "axis")
      .attr("transform", (d, i) => `rotate(${(i * 360) / labels.length})`)
      .append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", -radius)
      .style("stroke", "#ccc")
      .style("stroke-width", 1);

    const axisLabels = svg.selectAll(".axis-label")
      .data(labels)
      .enter().append("text")
      .attr("class", "axis-label")
      .attr("transform", (d, i) => `rotate(${(i * 360) / labels.length})`)
      .attr("x", 10)
      .attr("y", -radius - 10)
      .style("text-anchor", "middle")
      .text(d => d)
      .style("fill", "#222")
      .style("font-size", "12px");

    svg.selectAll(".radar-circle")
      .data(d3.range(1, 6))
      .enter().append("circle")
      .attr("class", "radar-circle")
      .attr("r", d => radius / 5 * d)
      .style("fill", "none")
      .style("stroke", "#ddd")
      .style("stroke-width", 1);

    // Tooltip for population details
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(255,255,255,0.95)")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("opacity", 0);

    svg.selectAll(".radar-area")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.95);
        tooltip.html(`
          <strong>${city}</strong><br>
          Population: ${d.value.toLocaleString()}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  })();
})();
