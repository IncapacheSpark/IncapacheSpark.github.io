// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 50, left: 180},
    width = 760 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#boxplot1")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Read the data and compute summary statistics for each specie
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass2.csv", function (data) {

    // find the max value for X axis viz
    const maxAxisX = Math.max.apply(Math, data.map(function (value) {
        return value.Height;
    }));

    // find the min value for X axis viz
    const minAxisX = Math.min.apply(Math, data.map(function (value) {
        return value.Height;
    }));

    // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
    const sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function (d) {
            return d.Name;
        })
        .rollup(function (d) {
            const q1 = d3.quantile(d.map(function (g) {
                return parseFloat(g.Height);
            }).sort(d3.ascending), .25)
            const median = d3.quantile(d.map(function (g) {
                return parseFloat(g.Height);
            }).sort(d3.ascending), .5)
            const q3 = d3.quantile(d.map(function (g) {
                return parseFloat(g.Height);
            }).sort(d3.ascending), .75)

            const interQuantileRange = q3 - q1
            const min = q1 - 1.5 * interQuantileRange
            const max = q3 + 1.5 * interQuantileRange

            const newMax = Math.max(min, minAxisX);
            const newMin = Math.min(max, maxAxisX);

            return ({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: newMax, max: newMin})
        })
        .entries(data)

    // Show the Y scale
    const y = d3.scaleBand()
        .range([height, 0])
        .domain(data.map(d => d.Name))
        .padding(.4);

    svg.append("g")
        .attr("transform", "translate(-50," + 0 + ")")
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()

    // Show the X scale
    const x = d3.scaleLinear()
        .domain([0, maxAxisX])
        .range([0, width]).nice();

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(-height * 1.3).ticks(10))
        .select(".domain").remove()

    // Customization
    svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

    // Color scale
    const myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([0, maxAxisX])

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 30)
        .text("Height (m)");

    // create a tooltip
    const tooltip = d3.select("#boxplot1")
        .append("div")
        .attr("class", "tooltip")

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (d) {

        let values = d3.select(this).datum().value

        tooltip
            .transition()
            .duration(200)
            .style("opacity", 1)

        if (d3.select(this).datum().key) {
            tooltip
                .html("<span>Median: " + values.median + "<br>" + "Min: " + values.min + "<br>" +
                    "Max: " + values.max + "<br>" + "Lower quartile: " + values.q1 + "<br>" +
                    "Upper quartile: " + values.q3 + "</span>")
                .style("left", (d3.mouse(this)[0] - 300) + "px")
                .style("top", (d3.mouse(this)[1] + 350) + "px")
        } else {
            tooltip
                .html("<span>Tree Height (m): " + parseFloat(d.Height).toFixed(1) + "</span>")
                .style("left", (d3.mouse(this)[0] - 300) + "px")
                .style("top", (d3.mouse(this)[1] + 350) + "px")
        }

    }
    const mousemove = function () {
        tooltip
            .style("left", (d3.mouse(this)[0] + 300) + "px")
            .style("top", (d3.mouse(this)[1] + 350) + "px")
    }
    const mouseleave = function () {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    // Show the main horizontal line
    svg
        .selectAll("mainLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", function (d) {
            // return (x(d.value.min) < 0 ? 0 : x(d.value.min))
            return x(d.value.min)
        })
        .attr("x2", function (d) {
            return x(d.value.max)
        })
        .attr("y1", function (d) {
            return y(d.key) + y.bandwidth() / 2;
        })
        .attr("y2", function (d) {
            return y(d.key) + y.bandwidth() / 2;
        })
        .attr("stroke", "black")
        .style("width", 50);

    // rectangle for the main box
    svg
        .selectAll("boxes")
        .data(sumstat)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return x(d.value.q1);
        })
        .attr("width", function (d) {
            return (x(d.value.q3) - x(d.value.q1));
        })
        .attr("y", function (d) {
            return y(d.key);
        })
        .attr("height", y.bandwidth())
        .attr("stroke", "black")
        .style("fill", "#FFCA3A")
        .style("opacity", 1)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    // Show the median
    svg
        .selectAll("medianLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("y1", function (d) {
            return (y(d.key))
        })
        .attr("y2", function (d) {
            return (y(d.key) + y.bandwidth())
        })
        .attr("x1", function (d) {
            return (x(d.value.median))
        })
        .attr("x2", function (d) {
            return (x(d.value.median))
        })
        .attr("stroke", "black")
        .style("width", 100)

    // keep only the outliers
    const outliers = data.filter(d => {
        let index = sumstat.findIndex(t => t.key === d.Name)
        return d.Height > sumstat[index].value.max || d.Height < sumstat[index].value.min
    })

    // Add individual points with jitter
    const jitterWidth = 25
    svg
        .selectAll("indPoints")
        .data(outliers)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            // console.log(data)
            return (x(d.Height))
        })
        .attr("cy", function (d) {
            return (y(d.Name) + (y.bandwidth() / 2) - jitterWidth / 2 + Math.random() * jitterWidth)
        })
        .attr("r", 4)
        .style("fill", function (d) {
            return (myColor(+d.Height))
        })
        .attr("stroke", "black")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
})
