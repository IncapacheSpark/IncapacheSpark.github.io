// set the dimensions and margins of the graph
const margin = {top: 40, right: 150, bottom: 60, left: 40},
    width = 700 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#choroplet_map1")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform",
        `translate(${margin.left}, ${margin.top})`);

// get the data
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass2.csv").then(function (data) {

    // find the max value for X axis viz
    const maxAxisX = Math.max.apply(Math, data.map(function (value) {
        return value.Height;
    }));

    // X axis: scale and draw:
    const x = d3.scaleLinear()
        .domain([0, maxAxisX])
        .range([0, width]).nice();

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 50)
        .text("Height (m)");

    // Y axis: initialization
    const y = d3.scaleLinear()
        .range([height, 0]).nice();
    const yAxis = svg.append("g")

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", -30)
        .attr("y", -20)
        .text("Count")
        .attr("text-anchor", "start")

    // create a tooltip
    const tooltip = d3.select("#histogram")
        .append("div")
        .attr("class", "tooltip")

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    const showTooltip = function (event, d) {

        d3.select(this).style("opacity", 1)

        tooltip
            .transition()
            .duration(100)
            .style("opacity", 1)

        tooltip
            .html("Range (m): " + d.x0 + " - " + d.x1 + "<br>" + "Count: " + d.length)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px")
    }
    const moveTooltip = function (event) {
        tooltip
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px")
    }
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    const hideTooltip = function () {

        d3.selectAll("rect").style("opacity", 0.8)

        tooltip
            .transition()
            .duration(100)
            .style("opacity", 0)
    }

    // set the parameters for the histogram
    const histogram = d3.histogram()
        .value(function (d) {
            return parseFloat(d.Height);
        })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(20)); // then the numbers of bins

    // And apply this function to data to get the bins
    const bins = histogram(data);

    // Y axis: update now that we know the domain
    y.domain([0, d3.max(bins, function (d) {
        return d.length;
    })]);   // d3.hist has to be called before the Y axis obviously
    yAxis
        .transition()
        .duration(100)
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

    // Join the rect with the bins data
    svg.selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", 1)
        .attr("y", 0)
        .attr("transform", function (d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")";
        })
        .attr("width", function (d) {
            return x(d.x1) - x(d.x0) - 1;
        })
        .attr("height", function (d) {
            return height - y(d.length);
        })
        .style("fill", "#FFCA3A")
        .style("opacity", 0.8)
        // Show tooltip on hover
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip)
});
