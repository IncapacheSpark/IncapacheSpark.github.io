//const color = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ced4da']

const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 750 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

const svg = d3.select("#ridgeline_chart")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const colors = {"#3B4CC0", "#B40426"}

const url = "/python/assignment_4_salorno/assignment4.csv";

//read data
d3.csv(url).then(function(data) {

  data.forEach(function (element) {
      element.month = element.day.slice(5);
      element.year = element.day.slice(0, 4);
  });

  const items = ["1993", "1997", "2001", "2005", "2009", "2013", "2017", "2021"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // add the options to the button
  d3.select("#selection")
      .selectAll('myOptions')
      .data(items)
      .enter()
      .append('option')
      .text(function (d) {
          return d;
      }) // text showed in the menu
      .attr("value", function (d) {
          return d;
      }) // corresponding value returned by the button

      console.log(data);


// ###################  COPY PASTE ############### https://d3-graph-gallery.com/graph/ridgeline_basic.html //
  // Get the different categories and count them
  const categories = data.columns
  const n = categories.length

  // Add X axis
  const x = d3.scaleLinear()
    .domain([-10, 140])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // Create a Y scale for densities
  const y = d3.scaleLinear()
    .domain([0, 0.4])
    .range([ height, 0]);

  // Create the Y axis for names
  const yName = d3.scaleBand()
    .domain(categories)
    .range([0, height])
    .paddingInner(1)
  svg.append("g")
    .call(d3.axisLeft(yName));

  // Compute kernel density estimation for each column:
  const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40)) // increase this 40 for more accurate density.
  const allDensity = []
  for (i = 0; i < n; i++) {
      key = categories[i]
      density = kde( data.map(function(d){  return d[key]; }) )
      allDensity.push({key: key, density: density})
  }

  // Add areas
  svg.selectAll("areas")
    .data(allDensity)
    .join("path")
      .attr("transform", function(d){return(`translate(0, ${(yName(d.key)-height)})`)})
      .datum(function(d){return(d.density)})
      .attr("fill", "#69b3a2")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("d",  d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
      )

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
