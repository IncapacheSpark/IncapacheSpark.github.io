// set the dimensions and margins of the graph
const margin = {top: 10, right: 20, bottom: 50, left: 40},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

//Read the data
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/ass2.csv").then(function (data) {

    // List of groups (here I have one group per column)
    const xItem = ["Height", "Crown_height", "Crown_width", "Canopy", "Leaf_area", "Leaf_biomass"]

    // List of groups (here I have one group per column)
    const yItem = ["CO2", "Pollution"]

    // add the options to the button
    d3.select("#selection-x")
        .selectAll('myOptions')
        .data(xItem)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        }) // text showed in the menu
        .attr("value", function (d) {
            return d;
        }) // corresponding value returned by the button

    // add the options to the button
    d3.select("#selection-y")
        .selectAll('myOptions')
        .data(yItem)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        }) // text showed in the menu
        .attr("value", function (d) {
            return d;
        }) // corresponding value returned by the button

    const treeNames = data.map(d => d.Name);
    const names = [...new Set(treeNames)];
    const counts = [];
    const treeNames_toSort = [];

    treeNames.forEach(el => {
        counts[el] = counts[el] ? counts[el] + 1 : 1;
    })

    names.forEach(el => {
        treeNames_toSort.push([el, counts[el]]);
    });
    const treeNames_count_sorted = treeNames_toSort.sort((x, y) => y[1] - x[1]).slice(0, 6);
    const treeNames_ordered = treeNames_count_sorted.sort((x, y) => x[0].localeCompare(y[0]));

    // Color scale: give me a specie name, I return a color
    const color = d3.scaleOrdinal()
        .domain(["Celtis_australis", "Aesculus_hippocastanum", "Carpinus_betulus", "Tilia_cordata", "Platanus_x_hispanica", "Tilia_x_europaea"])
        .range(["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#3B1F2B", "#2EDA12FF"])

    const grid = (g, x, y) => g
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1)
        .call(g => g
            .selectAll(".x")
            .data(x.ticks(12))
            .join(
                enter => enter.append("line").attr("class", "x").attr("y2", height),
                update => update,
                exit => exit.remove()
            )
            .attr("x1", d => 0.5 + x(d))
            .attr("x2", d => 0.5 + x(d)))
        .call(g => g
            .selectAll(".y")
            .data(y.ticks(12 * k))
            .join(
                enter => enter.append("line").attr("class", "y").attr("x2", width),
                update => update,
                exit => exit.remove()
            )
            .attr("y1", d => 0.5 + y(d))
            .attr("y2", d => 0.5 + y(d)));

    xAxis = (g, x) => g
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(12))
    // .call(g => g.select(".domain").attr("display", "none"))

    yAxis = (g, y) => g
        .call(d3.axisLeft(y).ticks(12 * k))
    // .call(g => g.select(".domain").attr("display", "none"))

    let k = height / width

    function display(xVal, yVal) {

        d3.selectAll("#smallScatter > *").remove();

        // find the max value for X axis viz
        const maxAxisX = Math.max.apply(Math, data.map(function (value) {
            return value[xVal];
        }));

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, maxAxisX])
            .range([0, width - margin.right]).nice();

        // find the max value for X axis viz
        const maxAxisY = Math.max.apply(Math, data.map(function (value) {
            return value[yVal];
        }));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, maxAxisY])
            .range([height, 0]).nice();

        treeNames_ordered.map(d => d[0]).forEach(tree => {

            const svg = d3.select("#smallScatter")
                .append("svg")
                .attr("class", d => "myScatter " + tree.replaceAll(' ', '_'))
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top * 2 + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top * 3 + ")");

            svg.append("text")
                .attr("transform", "translate(" + (width / 2) + " ," + (-margin.top) + ")")
                .style("text-anchor", "middle")
                .text(tree)

            // Add X axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height + 30)
                .text(xVal);

            // Add Y axis label:
            svg.append("text")
                .attr("text-anchor", "start")
                .attr("x", -20)
                .attr("y", -15)
                .text(yVal)

            const gGrid = svg.append("g");

            const gDot = svg.append('g')
                .selectAll("dot")
                .data(data.filter(d => d.Name === tree))
                .join("circle")
                .attr("cx", function (d) {
                    return x(d[xVal]);
                })
                .attr("cy", function (d) {
                    return y(d[yVal]);
                })
                .attr("r", 1.5)
                .style("fill", function (d) {
                    return color(d.Name)
                })

            gDot.selectAll("path")
                .join("path")
                .attr("d", d => `M${x(d[xVal])},${y(d[yVal])}h0`)

            const gx = svg.append("g");

            const gy = svg.append("g");

            function zoomed({transform}) {

                const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
                const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);

                gDot.attr("transform", transform).attr("r", 2 / transform.k);
                gx.call(xAxis, zx);
                gy.call(yAxis, zy);
                gGrid.call(grid, zx, zy);
            }

            const zoom = d3.zoom()
                .scaleExtent([1, 5])
                .on("zoom", zoomed);

            d3.selectAll("." + tree.replaceAll(' ', '_'))
                .call(zoom)
                .call(zoom.transform, d3.zoomIdentity);
        });
    }

     display("Height", "CO2")

    // When the button is changed, run the updateChart function
    d3.select("#selection-x").on("change", function (event, d) {
        // recover the option that has been chosen
        const selectedOptionX = d3.select(this).property("value")
        // run the updateChart function with this selected option
        display(selectedOptionX, d3.select("#selection-y").property("value"))
    })

    // When the button is changed, run the updateChart function
    d3.select("#selection-y").on("change", function (event, d) {
        // recover the option that has been chosen
        const selectedOptionY = d3.select(this).property("value")
        // run the updateChart function with this selected option
        display(d3.select("#selection-x").property("value"), selectedOptionY)
    })

})