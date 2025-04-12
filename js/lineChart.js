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
  
    (async function renderChart() {
      const result = await fetchCityPopulation(cityName);
      if (!result) return;
  
      document.getElementById("loader").style.display = "none";
  
      window.populationChart = new Chart(document.getElementById("populationChart").getContext("2d"), {
        type: "line",
        data: {
          labels: result.labels,
          datasets: [{
            label: `Population of ${cityName} (2001-2011)`,
            data: result.data,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.3,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: {
              display: true,
              color: 'black'
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Year',
                color: 'black'
              },
              ticks: {
                color: 'black'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Population',
                color: 'black'
              },
              ticks: {
                color: 'black'
              },
              beginAtZero: false
            }
          }
        }
      });
    })();
  })();

  const msg = document.createElement('p');
  msg.textContent = "Created by Yashkumar Jagani";
  msg.style.color = 'black';
  msg.style.textDecorationLine = 'underline';
  msg.style.textAlign = 'center';
  msg.style.marginTop = '20px';
  document.querySelector('.container').appendChild(msg);
  