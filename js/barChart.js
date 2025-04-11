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
  
    (async function renderBarChart() {
      const result = await fetchCityPopulation(cityName);
      if (!result) return;
  
      document.getElementById("loader").style.display = "none";
  
      const ctx = document.getElementById("populationChart").getContext("2d");
  
      window.populationChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: result.labels,
          datasets: [{
            label: `Population of ${cityName} (2001–2011)`,
            data: result.data,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Year'
              }
            },
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Population'
              }
            }
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: {
              display: true
            }
          }
        }
      });
    })();
  })();
  