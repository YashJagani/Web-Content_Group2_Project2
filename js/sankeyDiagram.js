async function drawSankeyDiagram() {
  const svg = d3.select("#sankey");
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  svg.selectAll("*").remove();

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height / 2)
    .attr("text-anchor", "middle")
    .text("Loading population data...");

  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/population/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: "Kitchener-Cambridge-Waterloo" })
    });
    const result = await response.json();

    if (!result.data?.populationCounts) throw new Error("No population data found");

    const uniqueYears = new Set();
    const nodes = result.data.populationCounts
      .filter(d => {
        if (!uniqueYears.has(d.year) && d.value) {
          uniqueYears.add(d.year);
          return true;
        }
        return false;
      })
      .sort((a, b) => +a.year - +b.year)
      .map((d, i) => ({
        id: i,
        name: d.year,
        value: +d.value.replace(/,/g, "")
      }));

    if (nodes.length < 2) throw new Error("Need at least 2 years of data");

    const links = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const diff = nodes[i + 1].value - nodes[i].value;
      links.push({
        source: i,
        target: i + 1,
        value: Math.abs(diff),
        direction: diff >= 0 ? "increase" : "decrease"
      });
    }

    const sankey = d3.sankey()
      .nodeWidth(20)
      .nodePadding(30)  // Increased node padding for better spacing
      .extent([[50, 20], [width - 50, height - 40]]);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankey({
      nodes: JSON.parse(JSON.stringify(nodes)),
      links: JSON.parse(JSON.stringify(links))
    });

    svg.selectAll("text").remove();

    const defs = svg.append("defs");

    const makeGradient = (id, colors) => {
      const grad = defs.append("linearGradient")
        .attr("id", id)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 1).attr("y2", 0);
      grad.selectAll("stop")
        .data(colors)
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
    };

    makeGradient("ribbon-increase", [
      { offset: "0%", color: "#4CAF50" },
      { offset: "100%", color: "#8BC34A" }
    ]);

    makeGradient("ribbon-decrease", [
      { offset: "0%", color: "#F44336" },
      { offset: "100%", color: "#FF9800" }
    ]);

    svg.append("g")
      .selectAll(".flow")
      .data(sankeyLinks)
      .enter().append("path")
      .attr("class", "flow")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("fill", d => `url(#ribbon-${d.direction})`)
      .attr("stroke", "#000")
      .attr("stroke-width", 2)  // Added stroke width for better visibility
      .attr("stroke-opacity", 0.3)  // Increased stroke opacity
      .attr("opacity", 0.8)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1);
        showTooltip(event, `
          <strong>${d.source.name} → ${d.target.name}</strong><br>
          Change: ${d3.format("+,.0f")(d.direction === "increase" ? d.value : -d.value)}<br>
          Population in ${d.target.name}: ${d3.format(",.0f")(d.target.value)}
        `);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.8);
        hideTooltip();
      });

    const nodeGroups = svg.append("g")
      .selectAll(".node")
      .data(sankeyNodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    nodeGroups.append("rect")
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", "#3f51b5")
      .attr("stroke", "#1a237e")
      .attr("rx", 3).attr("ry", 3)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#1a237e");
        showTooltip(event, `
          <strong>Year ${d.name}</strong><br>
          Population: ${d3.format(",.0f")(d.value)}
        `);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#3f51b5");
        hideTooltip();
      });

    nodeGroups.append("text")
      .attr("x", d => (d.x1 - d.x0) / 2)
      .attr("y", d => (d.y1 - d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(d => d.name)
      .style("fill", "white")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Population Flow in Kitchener-Cambridge-Waterloo");

    const legend = svg.append("g")
      .attr("transform", `translate(${width - 200}, ${height - 60})`);

    legend.append("rect")
      .attr("width", 20)
      .attr("height", 10)
      .attr("fill", "url(#ribbon-increase)");

    legend.append("text")
      .attr("x", 25)
      .attr("y", 10)
      .text("Population Increase")
      .style("font-size", "12px");

    legend.append("rect")
      .attr("width", 20)
      .attr("height", 10)
      .attr("y", 20)
      .attr("fill", "url(#ribbon-decrease)");

    legend.append("text")
      .attr("x", 25)
      .attr("y", 30)
      .text("Population Decrease")
      .style("font-size", "12px");

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(255,255,255,0.95)")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
      .style("font-size", "12px");

    function showTooltip(event, html) {
      tooltip.html(html)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px")
        .transition().duration(200).style("opacity", 0.95);
    }

    function hideTooltip() {
      tooltip.transition().duration(500).style("opacity", 0);
    }

  } catch (error) {
    svg.selectAll("text").remove();
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .text(error.message)
      .style("fill", "red");
  }
}

drawSankeyDiagram();
