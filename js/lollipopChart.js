(() => {
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
  
      const years = [...yearMap.keys()].sort((a, b) => a - b);
      return {
        labels: years.map(String),
        data: years.map(y => yearMap.get(y))
      };
    }
  
    (async () => {
      const { labels, data } = await fetchCityPopulation(city);
      document.getElementById("loader").style.display = "none";
      const ctx = document.getElementById("populationChart");
  
      // Set proper canvas height class
      ctx.classList.remove("short-chart", "tall-chart");
      ctx.classList.add("tall-chart");
  
      window.populationChart = new Chart(ctx, {
        type: "scatter",
        data: {
          labels: labels,
          datasets: [{
            label: "Population",
            data: data.map((value, index) => ({ x: index, y: value })),
            pointBackgroundColor: "rgb(255, 99, 132)",
            pointBorderColor: "rgb(255, 99, 132)",
            pointRadius: 6,
            showLine: false
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: context =>
                  `Year: ${labels[context.dataIndex]}, Population: ${context.parsed.y.toLocaleString()}`
              }
            }
          },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              ticks: {
                callback: (value) => labels[value] || '',
                stepSize: 1
              },
              title: {
                display: true,
                text: "Year"
              },
              min: -1,
              max: labels.length
            },
            y: {
              title: {
                display: true,
                text: "Population"
              },
              beginAtZero: false
            }
          }
        },
        plugins: [{
          id: 'lollipopLines',
          afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            const chartArea = chart.chartArea;
  
            ctx.save();
            ctx.strokeStyle = 'rgba(100, 100, 100, 0.6)';
            ctx.lineWidth = 2;
  
            meta.data.forEach(point => {
              const x = point.x;
              const y = point.y;
              const bottom = chartArea.bottom; 
  
              ctx.beginPath();
              ctx.moveTo(x, bottom);
              ctx.lineTo(x, y);
              ctx.stroke();
            });
  
            ctx.restore();
          }
        }]
      });
    })();
  })();
  