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
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass2.csv").then(function (data) {

    // find the max value for X axis viz
    const maxAxisX = Math.max.apply(Math, data.map(item => {
        return item.Height;
    }));

    // find the min value for X axis viz
    const minAxisX = Math.min.apply(Math, data.map(item => {
        return item.Height;
    }));

    const sumstat = d3.flatRollup(
        data,
        (box) => {
            const y = (k) => k.Height;
            const q1 = d3.quantile(
                box.map((d) => d.Height),
                0.25,
            );
            const median = d3.quantile(
                box.map((d) => d.Height),
                0.5,
            );
            const q3 = d3.quantile(
                box.map((d) => d.Height),
                0.75,
            );
            const interQuantileRange = q3 - q1
            const newMax = Math.max(q1 - 1.5 * interQuantileRange, minAxisX);
            const newMin = Math.min(q3 + 1.5 * interQuantileRange, maxAxisX);

            return ({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: newMax, max: newMin})
        },
        (d) => d.Name,
    );

    // Color scale: give me a specie name, I return a color
    const color = d3.scaleOrdinal()
        .domain(["Celtis_australis", "Aesculus_hippocastanum", "Carpinus_betulus", "Tilia_cordata", "Platanus_x_hispanica", "Tilia_x_europaea"])
        .range(['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#023047'])

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
    const mouseover = function (event, d) {

        let values = d3.select(this).datum()

        tooltip
            .transition()
            .duration(200)
            .style("opacity", 1)

        if (values[0]) {
            tooltip
                .html("<span>Median: " + values[1].median + "<br>" + "Min: " + values[1].min + "<br>" +
                    "Max: " + values[1].max + "<br>" + "Lower quartile: " + values[1].q1 + "<br>" +
                    "Upper quartile: " + values[1].q3 + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        } else {
            tooltip
                .html("<span>Tree Height (m): " + parseFloat(d.Height).toFixed(1) + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        }

    }
    const mousemove = function (event) {
        tooltip
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
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
            return x(d[1].min)
        })
        .attr("x2", function (d) {
            return x(d[1].max)
        })
        .attr("y1", function (d) {
            return y(d[0]) + y.bandwidth() / 2;
        })
        .attr("y2", function (d) {
            return y(d[0]) + y.bandwidth() / 2;
        })
        .attr("stroke", "black")
        .style("width", 50);

    // rectangle for the main box
    svg
        .selectAll("boxes")
        .data(sumstat)
        .enter()
        .append("rect")
        .attr("class", "box")
        .attr("x", function (d) {
            return x(d[1].q1);
        })
        .attr("width", function (d) {
            return 0;
        })
        .attr("y", function (d) {
            return y(d[0]);
        })
        .attr("height", y.bandwidth())
        .attr("stroke", "black")
        .style("fill", function (d) {
            return color(d[0].replaceAll(' ', '_'))
        })
        .style("opacity", .8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    // Show the median
    svg
        .selectAll("medianLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("class", "median")
        .attr("y1", function (d) {
            return (y(d[0]))
        })
        .attr("y2", function (d) {
            return (y(d[0]))
        })
        .attr("x1", function (d) {
            return (x(d[1].median))
        })
        .attr("x2", function (d) {
            return (x(d[1].median))
        })
        .attr("stroke", "black")
        .style("width", 100)

    // keep only the outliers
    const outliers = data.filter(d => {
        let index = sumstat.findIndex(t => t[0] === d.Name)
        return d.Height > sumstat[index][1].max || d.Height < sumstat[index][1].min
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
        .attr("r", 0)
        .style("fill", function (d) {
            return color(d.Name.replaceAll(' ', '_'))
        })
        .attr("stroke", "black")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    svg.selectAll("circle")
        .transition("loading")
        .duration(500)
        .attr("r", 4)
        .delay(300);

    svg.selectAll(".box")
        .transition("loading")
        .duration(500)
        .attr("x", function (d) {
            return x(d[1].q1);
        })
        .attr("width", function (d) {
            return (x(d[1].q3) - x(d[1].q1));
        })
        .attr("height", y.bandwidth());

    svg.selectAll(".median")
        .transition("loading")
        .duration(500)
        .attr("y2", function (d) {
            return (y(d[0]) + y.bandwidth())
        })
        .delay(30);
})
