(() => {
  const city = "Kitchener-Cambridge-Waterloo";

  async function fetchCityPopulation(city) {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries/population/cities",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      }
    );

    const result = await response.json();
    const yearMap = new Map();

    result.data.populationCounts.forEach((entry) => {
      const year = parseInt(entry.year);
      const value = parseInt(entry.value);
      if (year >= 2001 && year <= 2011 && !yearMap.has(year)) {
        yearMap.set(year, value);
      }
    });

    const years = [...yearMap.keys()].sort((a, b) => a - b);
    return {
      labels: years.map(String),
      data: years.map((y) => yearMap.get(y)),
    };
  }

  (async () => {
    const { labels, data } = await fetchCityPopulation(city);
    document.getElementById("loader").style.display = "none";

    window.populationChart = new Chart(
      document.getElementById("populationChart"),
      {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: labels.map((_, i) => `hsl(${i * 30}, 70%, 60%)`),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "right" },
          },
        },
      }
    );
  })();
})();
const content = document.createElement("p");
content.textContent = "Designed by Krin Shaileshkumar Patel";
content.style.color = "black";
content.style.fontStyle = "italic";
content.style.textAlign = "center";
document.querySelector(".container").appendChild(content);
