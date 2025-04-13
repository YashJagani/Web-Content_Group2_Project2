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

    const ctx = document.getElementById("polarChart").getContext("2d");

    new Chart(ctx, {
      type: "polarArea",
      data: {
        labels: labels,
        datasets: [{
          label: `Population in ${city}`,
          data: data,
          backgroundColor: labels.map((_, i) => `hsl(${i * 30}, 70%, 60%)`),
          borderColor: "#fff",
          borderWidth: 2,
          hoverBorderColor: "#000"
        }]
      },
      options: {
        responsive: true,
        animation: {
          animateRotate: true,
          animateScale: true
        },
        plugins: {
          title: {
            display: true,
            text: `Population Trend (2001-2011) for ${city}`,
            font: {
              size: 18,
              weight: "bold"
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                return `Population: ${context.raw.toLocaleString()}`;
              }
            }
          },
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 15,
              color: '#333',
              font: {
                size: 12
              }
            }
          }
        },
        scales: {
          r: {
            ticks: {
              callback: function (value) {
                return value >= 1000 ? (value / 1000) + "K" : value;
              },
              color: "#555"
            },
            grid: {
              color: "#ddd"
            },
            angleLines: {
              color: "#ccc"
            },
            pointLabels: {
              color: "#222",
              font: {
                size: 13,
                weight: "bold"
              }
            }
          }
        }
      }
    });
  })();
})();
