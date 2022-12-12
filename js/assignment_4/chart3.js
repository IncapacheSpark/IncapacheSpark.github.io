const margin = {top: 50, right: 30, bottom: 30, left: 40},
    width = 750 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

const svg = d3.select("#ridgeline_chart")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const url_min_temps = "/python/data/ass_4_ridgeline_min.csv";
const url_max_temps = "/python/data/ass_4_ridgeline_max.csv";

//read data
Promise.all([
  d3.csv(url_min_temps),
  d3.csv(url_max_temps),
]).then(function (initialize) {

  let min_temps = initialize[0];
  let max_temps = initialize[1];

  const items_years = ["1993", "1997", "2001", "2005", "2009", "2013", "2017", "2021"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // add the options to the button
  d3.select("#selection")
      .selectAll('myOptions')
      .data(items_years)
      .enter()
      .append('option')
      .text(function (d) {
          return d;
      }) // text showed in the menu
      .attr("value", function (d) {
          return d;
      }) // corresponding value returned by the button

  function display_year_filtered(selected_year=items_years[0]){
    const categories = months;
    const n = categories.length;


    var filtered_min_data = [];
    var filtered_max_data = [];

    // Filtering on selected year and removing none values (the latter is not working...)
    min_temps.forEach((d) => {
      var has_nones_min = false;
      var data_properties = Object.keys(d).slice(2);

      if(d.year == selected_year){
        data_properties.forEach((p) => {
            if (d[p] == 'None'){
              has_nones_min = true;
            }
        });

        if(!has_nones_min){
          filtered_min_data.push(d);
        }
      }
    });

    max_temps.forEach((d) => {
      var has_nones_max = false;
      var data_properties = Object.keys(d).slice(2);

      if(d.year == selected_year){
        data_properties.forEach((p) => {
            if (d[p] == 'None'){
              has_nones_max = true;
            }
        });

        if(!has_nones_max){
          filtered_max_data.push(d);
        }
      }
    });


    console.log('final len di filtered data is', filtered_min_data.length, filtered_max_data.length);

    // Add X axis
    const x = d3.scaleLinear()
      .domain([-30, 35])
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    // Create a Y scale for densities
    const y = d3.scaleLinear()
      .domain([0, 2.5])
      .range([ height, 0]);

    // Create the Y axis for names
    const yName = d3.scaleBand()
      .domain(categories)
      .range([0, height])
      .paddingInner(1)
    svg.append("g")
      .call(d3.axisLeft(yName));

    // MIN TEMPS VALUE

    // Compute kernel density estimation for each column:
    const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40)) // increase this 40 for more accurate density.
    const allDensity = []
    for (i = 0; i < n; i++) {
        key = categories[i]
        density = kde( filtered_min_data.map(function(d){  return d[key]; }) )
        allDensity.push({key: key, density: density})
    }

    // Add areas
    svg.selectAll("areas")
      .data(allDensity)
      .join("path")
        .attr("transform", function(d){return(`translate(0, ${(yName(d.key)-height)})`)})
        .datum(function(d){return(d.density)})
        .attr("fill", " #2ab7ca")
        .attr("opacity", 0.7)
        .attr("stroke", "#000")
        .attr("stroke-width", 0.1)
        .attr("d",  d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
        )


    // MAX TEMPS VALUE

    // Compute kernel density estimation for each column:
    const kde_max = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40)) // increase this 40 for more accurate density.
    const allDensity_max = []
    for (i = 0; i < n; i++) {
        key = categories[i]
        density = kde_max( filtered_max_data.map(function(d){  return d[key]; }) )
        allDensity_max.push({key: key, density: density})
    }

    // Add areas
    svg.selectAll("areas")
      .data(allDensity_max)
      .join("path")
        .attr("transform", function(d){return(`translate(0, ${(yName(d.key)-height)})`)})
        .datum(function(d){return(d.density)})
        .attr("fill", "#fe4a49")
        .attr("opacity", 0.7)
        .attr("stroke", "#000")
        .attr("stroke-width", 0.1)
        .attr("d",  d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
        )

  }

  display_year_filtered();

  // When the button is changed, run the updateChart function
  d3.select("#selection").on("change", function () {

    d3.selectAll("path").remove();
    // recover the option that has been chosen
    const selectedYearOption = d3.select(this).property("value")
    // run the updateChart function with this selected option
    display_year_filtered(selectedYearOption);
})

})

// This is what I need to compute kernel density estimation
function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(function(x) {
      return [x, d3.mean(V, function(v) { return kernel(x - v); })];
    });
  };
}
function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}
