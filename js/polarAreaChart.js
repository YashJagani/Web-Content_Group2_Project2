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
    const values = sortedYears.map((year) => yearMap.get(year));
    return {
      labels: sortedYears.map(String),
      data: values,
    };
  }

  (async function renderPolarChart() {
    const result = await fetchCityPopulation(cityName);
    if (!result) return;
    document.getElementById("loader").style.display = "none";

    const ctx = document.getElementById("populationChart").getContext("2d");
    const colors = [
      "#b5838d",
      "#6d6875",
      "#ff006e",
      "#8338ec",
      "#3a86ff",
      "#00b4d8",
      "#90e0ef",
      "#f9c74f",
      "#f9844a",
      "#43aa8b",
      "#4d908e",
    ];

    window.populationChart = new Chart(ctx, {
      type: "polarArea",
      data: {
        labels: result.labels,
        datasets: [
          {
            label: "Population",
            data: result.data,
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "black",
            },
          },
        },
      },
    });
  })();
})();
