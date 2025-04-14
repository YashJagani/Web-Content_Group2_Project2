//designed by Badmus Segun
async function fetchPopulationData() {
    try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/population/cities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ city: "Kitchener-Cambridge-Waterloo" })
        });

        const result = await response.json();

        if (!result.data || !result.data.populationCounts) {
            console.error("No data found for the specified city.");
            document.getElementById("loader").textContent = "No data available.";
            return;
        }

        const populationCounts = result.data.populationCounts;

        // Process the data - convert values to numbers and filter invalid entries
        const processedData = populationCounts.map(d => ({
            year: d.year,
            value: d.value ? +d.value.replace(/,/g, "") : null
        })).filter(d => d.value !== null);

        // Group data by year (even if only one value per year)
        const groupedData = {};
        processedData.forEach(d => {
            if (!groupedData[d.year]) groupedData[d.year] = [];
            groupedData[d.year].push(d.value);
        });

        // For years with only one data point, create synthetic data points for the box plot
        // by adding slight variations (10% above and below the actual value)
        const dataGroups = [];
        const labels = [];
        
        Object.keys(groupedData).sort().forEach(year => {
            let values = groupedData[year];
            
            // If only one data point for this year, create synthetic data
            if (values.length === 1) {
                const baseValue = values[0];
                values = [
                    baseValue * 0.95,  // 5% below
                    baseValue * 0.975, // 2.5% below
                    baseValue,        // actual value
                    baseValue * 1.025, // 2.5% above
                    baseValue * 1.05   // 5% above
                ];
            }
            
            dataGroups.push(values);
            labels.push(year);
        });

        // Call the drawBoxPlot function with processed data
        drawBoxPlot(dataGroups, labels);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function drawBoxPlot(dataGroups, labels) {
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous SVG if it exists
    d3.select("#boxPlot").selectAll("*").remove();

    const svg = d3.select("#boxPlot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Compute statistics for each year
    const stats = dataGroups.map(values => {
        values.sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const interQuantileRange = q3 - q1;
        const min = Math.max(q1 - 1.5 * interQuantileRange, d3.min(values));
        const max = Math.min(q3 + 1.5 * interQuantileRange, d3.max(values));
        return { min, q1, median, q3, max };
    });

    // Create scales
    const x = d3.scaleBand()
        .domain(labels)
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(stats, d => d.max) * 1.1]) // Add 10% padding
        .nice()
        .range([height, 0]);

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format("~s")));

    // Add Y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Population");

    // Add X axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .style("text-anchor", "middle")
        .text("Year");

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Draw the boxes with hover effects
    const boxes = svg.selectAll(".box")
        .data(stats)
        .enter()
        .append("rect")
        .attr("class", "box")
        .attr("x", (d, i) => x(labels[i]))
        .attr("y", d => y(d.q3))
        .attr("height", d => y(d.q1) - y(d.q3))
        .attr("width", x.bandwidth())
        .attr("fill", "#69b3a2") // Default color
        .attr("stroke", "#333")
        .on("mouseover", function(event, d) {
            // Change box color on hover
            d3.select(this).attr("fill", "#ff7f0e");
            
            // Highlight corresponding median line
            svg.selectAll(".median-line").filter((_, idx) => idx === stats.indexOf(d))
                .attr("stroke", "#ff0000")
                .attr("stroke-width", 3);
                
            // Show tooltip
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`
                <strong>Year:</strong> ${labels[stats.indexOf(d)]}<br>
                <strong>Min:</strong> ${d3.format(",")(d.min)}<br>
                <strong>Q1:</strong> ${d3.format(",")(d.q1)}<br>
                <strong>Median:</strong> ${d3.format(",")(d.median)}<br>
                <strong>Q3:</strong> ${d3.format(",")(d.q3)}<br>
                <strong>Max:</strong> ${d3.format(",")(d.max)}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            // Revert box color
            d3.select(this).attr("fill", "#69b3a2");
            
            // Revert median line
            svg.selectAll(".median-line").filter((_, idx) => idx === stats.indexOf(d))
                .attr("stroke", "#333")
                .attr("stroke-width", 2);
                
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Draw the median lines
    const medianLines = svg.selectAll(".median-line")
        .data(stats)
        .enter()
        .append("line")
        .attr("class", "median-line")
        .attr("x1", (d, i) => x(labels[i]))
        .attr("x2", (d, i) => x(labels[i]) + x.bandwidth())
        .attr("y1", d => y(d.median))
        .attr("y2", d => y(d.median))
        .attr("stroke", "#333")
        .attr("stroke-width", 2);

    // Draw the whiskers
    svg.selectAll(".whisker")
        .data(stats)
        .enter()
        .each(function(d, i) {
            const g = d3.select(this);
            const center = x(labels[i]) + x.bandwidth() / 2;
            
            // Main vertical line
            g.append("line")
                .attr("x1", center)
                .attr("x2", center)
                .attr("y1", y(d.min))
                .attr("y2", y(d.max))
                .attr("stroke", "#333");
            
            // Top horizontal line
            g.append("line")
                .attr("x1", x(labels[i]))
                .attr("x2", x(labels[i]) + x.bandwidth())
                .attr("y1", y(d.max))
                .attr("y2", y(d.max))
                .attr("stroke", "#333");
            
            // Bottom horizontal line
            g.append("line")
                .attr("x1", x(labels[i]))
                .attr("x2", x(labels[i]) + x.bandwidth())
                .attr("y1", y(d.min))
                .attr("y2", y(d.min))
                .attr("stroke", "#333");
        });

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Population Distribution Over Years");
}

fetchPopulationData();