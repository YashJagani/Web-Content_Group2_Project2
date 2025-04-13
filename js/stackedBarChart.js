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
    const baseData = sortedYears.map((year) => yearMap.get(year));

    // Example: Split population into age group estimates (fictional proportions)
    const groupA = baseData.map((value) => value * 0.5); // e.g., 50% working age
    const groupB = baseData.map((value) => value * 0.3); // e.g., 30% children
    const groupC = baseData.map((value) => value * 0.2); // e.g., 20% seniors

    return {
      labels: sortedYears.map(String),
      datasets: [
        {
          label: "Working Age (50%)",
          data: groupA,
          backgroundColor: "#4caf50",
        },
        {
          label: "Children (30%)",
          data: groupB,
          backgroundColor: "#2196f3",
        },
        {
          label: "Seniors (20%)",
          data: groupC,
          backgroundColor: "#f44336",
        },
      ],
    };
  }

  (async function renderStackedBarChart() {
    const result = await fetchCityPopulation(cityName);
    if (!result) return;
    document.getElementById("loader").style.display = "none";

    const ctx = document.getElementById("populationChart").getContext("2d");

    window.populationChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: result.labels,
        datasets: result.datasets,
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            mode: "index",
            intersect: false,
          },
          legend: {
            position: "top",
            labels: {
              color: "black",
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: "Year",
              color: "black",
            },
            ticks: {
              color: "black",
            },
          },
          y: {
            stacked: true,
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
