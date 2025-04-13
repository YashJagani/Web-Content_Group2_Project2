(() => {
  const cityName = "Kitchener-Cambridge-Waterloo";
  const apiUrl = "https://countriesnow.space/api/v0.1/countries/population/cities";

  async function fetchCityPopulation(city) {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city })
    });

    const result = await response.json();

    if (!result.data || !result.data.populationCounts) {
      alert("No population data found for the city.");
      return null;
    }

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

    const sortedYears = [...yearMap.keys()].sort((a, b) => a - b);
    const values = sortedYears.map(year => yearMap.get(year));

    return {
      labels: sortedYears.map(String),
      data: values
    };
  }

  (async function renderPieChart() {
    const result = await fetchCityPopulation(cityName);
    if (!result) return;

    document.getElementById("loader").style.display = "none";

    const ctx = document.getElementById("populationChart").getContext("2d");

    const colors = [
      '#8ac926', '#348aa7', '#4f772d', '#dc2f02', '#b23a48',
      '#e27396', '#4c956c', '#ffba08', '#5c677d', '#FF7043', '#26A69A'
    ];

    window.populationChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: result.labels,
        datasets: [{
          label: `Population Share per Year (2001-2011)`,
          data: result.data,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'black'
            },
            title: {
              display: true,
              text: 'Years',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: {
                bottom: 10
              },
              color: 'black'
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed;
                return `${context.label}: ${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  })();
})();
