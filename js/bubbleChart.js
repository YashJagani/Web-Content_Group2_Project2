(() => {
  const cityName = "Kitchener-Cambridge-Waterloo";
  const apiUrl =
    "https://countriesnow.space/api/v0.1/countries/population/cities";

  async function fetchCityPopulation(city) {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city }),
    });

    const result = await response.json();
    if (!result.data || !result.data.populationCounts) return null;

    const yearMap = new Map();
    result.data.populationCounts.forEach((entry) => {
      const year = parseInt(entry.year);
      const value = parseInt(entry.value);
      if (year >= 2001 && year <= 2011 && !yearMap.has(year)) {
        yearMap.set(year, value);
      }
    });

    const sortedYears = [...yearMap.keys()].sort();
    const bubbleData = sortedYears.map((year, i) => ({
      x: year,
      y: yearMap.get(year),
      r: 10 + i, // size of bubble increases per year
    }));

    return bubbleData;
  }

  (async function renderBubbleChart() {
    const result = await fetchCityPopulation(cityName);
    if (!result) return;
    document.getElementById("loader").style.display = "none";

    const ctx = document.getElementById("populationChart").getContext("2d");

    window.populationChart = new Chart(ctx, {
      type: "bubble",
      data: {
        datasets: [
          {
            label: "Population Bubble (2001-2011)",
            data: result,
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: "Year",
              color: "black",
            },
            ticks: {
              stepSize: 1,
              color: "black",
            },
          },
          y: {
            title: {
              display: true,
              text: "Population",
              color: "black",
            },
            ticks: {
              color: "black",
            },
          },
        },
      },
    });
  })();
})();
