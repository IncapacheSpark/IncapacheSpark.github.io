// set the dimensions and margins of the graph
const margin = {top: 10, right: 20, bottom: 20, left: 180},
    width = 760 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

const svg = d3.select('#stackedChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// get the data
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni_top_trees.csv").then(function (data) {

    // data.forEach(function(v){ delete v.others });

    const sortBy = "Celtis australis"

    data.sort((a, b) => {
        return a[sortBy] - b[sortBy];
    });

    const TreeNames = Object.keys(data[0]).filter(d => d !== "Neighbourhood");
    const neighbourhoods = data.map(d => d.Neighbourhood);

    const stackedData = d3.stack()
        .keys(TreeNames)(data);

    const max = d3.max(stackedData[stackedData.length - 1], d => d[1]);

    // scales
    const x = d3.scaleLinear()
        .domain([0, max]).nice()
        .range([0, width]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))

    const y = d3.scaleBand()
        .domain(neighbourhoods)
        .range([0, height])
        .padding(0.1);

    svg.append("g")
        .call(d3.axisLeft(y))

    const color = d3.scaleOrdinal()
        .domain(TreeNames)
        .range(['#FD0100', '#F76915', '#EEDE04', '#A0D636', '#2FA236', '#929191']);

    // create a tooltip
    const tooltip = d3.select("#stackedChart")
        .append("div")
        .attr("class", "tooltip")

    // ----------------
    // Highlight a specific subgroup when hovered
    // ----------------

    // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .attr("class", d => "myRect " + d.key.replaceAll(' ', '_')) // Add a class to each subgroup: their name
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .join("rect")
        .attr('x', d => x(d[0]))
        .attr('y', d => y(d.data.Neighbourhood))
        .attr('height', y.bandwidth())
        .attr('width', d => (x(0)))
        .attr("stroke", "grey")
        .on("mouseover", function (event, d) { // What happens when user hover a bar

            // what subgroup are we hovering?
            const subGroupName = d3.select(this.parentNode).datum().key

            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html("<span class='tooltiptext'>" + "Tree type: " + subGroupName + "<br>" + "Count: " + `${d[1] - d[0]}` + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");

            // Reduce opacity of all rect to 0.2
            d3.selectAll(".myRect")
                .style("opacity", 0.2)

            // Highlight all rects of this subgroup with opacity 1.
            // It is possible to select them since they have a specific class = their name.
            d3.selectAll("." + subGroupName.replaceAll(' ', '_'))
                .style("opacity", 1)

        })
        .on("mouseleave", function (event, d) { // When user do not hover anymore

            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            // Back to normal opacity: 1
            d3.selectAll(".myRect")
                .style("opacity", 1)
        })

    // Animation
    svg.selectAll("rect")
        .transition()
        .duration(200)
        .attr('x', d => x(d[0]))
        .attr('width', d => (x(d[1]) - x(d[0])))
        .delay((d, i) => {
            return i * 10
        })

})
