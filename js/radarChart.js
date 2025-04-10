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
      return { labels: years.map(String), data: years.map(y => yearMap.get(y)) };
    }
  
    (async () => {
      const { labels, data } = await fetchCityPopulation(city);
      document.getElementById("loader").style.display = "none";
  
      window.populationChart = new Chart(document.getElementById("populationChart"), {
        type: "radar",
        data: {
          labels: labels,
          datasets: [{
            label: `Population (Radar)`,
            data: data,
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)'
          }]
        },
        options: {
          responsive: true,
          elements: { line: { borderWidth: 2 } }
        }
      });
    })();
  })();
  