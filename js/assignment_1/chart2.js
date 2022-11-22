
// set the dimensions and margins of the graph
const margin = {top: 60, right: 30, bottom: 20, left: 0},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


// Definition of the full svg
const svg = d3.select("#multipleStackedChart")
    .append("svg")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))


// Parse the Data
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni_top_trees.csv").then(function (data) {

    // List of subgroups = header of the csv files = soil condition here
    const tree_types = data.columns.slice(1);

    console.log(tree_types)

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const circoscrizioni = data.map(d => d.Neighbourhood);

    // Ratio between tree and grouped columns width
    const group_ratio = 2; // 1 unit of width for a tree graph will be 10 in the Other graphs

    // find the max value
    const range_max = Math.max.apply(Math, data.map(function (value) {
        return Object.values(value).filter(d => d !== "Neighbourhood").slice(1).reduce((x, y) => parseInt(x) + parseInt(y), 0);
    }));

    const range_small = range_max / group_ratio;

    // 15: 1 unit for each tree then 5 for total and other columns
    const sub_graph_width = (width - 200 - ((tree_types.length) * margin.right)) / (group_ratio + 5);

    // color palette = one color per subgroup
    const color = d3.scaleOrdinal()
        .domain(tree_types)
        .range(['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ced4da']);

    let shift_from_left = margin.left + 200;

    // create a tooltip
    const tooltip = d3.select("#multipleStackedChart")
        .append("div")
        .attr("class", "tooltip")

    // Create Y axis - Defined in the same way for all sub graphs
    const y = d3.scaleBand()
        .domain(circoscrizioni)
        .range([0, height])
        .padding([0.3]);

    // For each subgroup
    let tree_type_splited;
    for (let i = 0; i < tree_types.length; i++) {
        let subgroup = tree_types[i];

        let mult = (i < tree_types.length - 1) ? 1 : group_ratio;
        let sub_width = sub_graph_width * mult;

        // Append 1 svg per tree and 1 for others
        let svg2 = svg.append("g")
            .attr("transform", "translate(" + shift_from_left + "," + margin.top + ")");

        tree_type_splited = subgroup.split(" ");
        let text_space = -25;
        tree_type_splited.forEach(t => {
            svg2.append("text")
                .attr("transform", "translate(" + (20) + "," + text_space + ")")
                .attr("y", 0)
                .attr("dy", ".2em")
                .style("fill", color(subgroup))
                .text(t);

            text_space += 10;
        });


        // Add X axis
        let x = d3.scaleLinear()
            .domain([0, (i < tree_types.length - 1) ? range_small : range_max])
            .range([0, sub_width]);

        let left_axis = d3.axisLeft(y).tickSize(5)
        svg2.call((i === 0) ? left_axis : left_axis.tickValues([]));


        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function (event, d) {
            tooltip.style("opacity", 1); // Remove tooltip
            tooltip.html("<span class='tooltiptext'>" + "Aboundance: " + d[subgroup] + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        }
        const mouseleave = function () {
            tooltip.style("opacity", 0);
        }

        // Add subgroup data
        svg2.selectAll("mybar")
            .data(data)
            .join("rect")
            .attr("id", function (d) {
                return d.Neighbourhood;
            })
            .attr("x", 0)
            .attr("y", function (d) {
                return y(d.Neighbourhood);
            })
            .attr("height", y.bandwidth())
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .attr("fill", color(subgroup))
            .style("opacity", 0.8)
            .transition()
            .ease(d3.easeLinear)
            .duration(500)
            .delay(function (d, i) {
                return i * 50;
            })
            .attr("width", function (d) {
                return x(d[subgroup]);
            });

        // Finalize the subgroup iteration by adding the width of the subgraph to the shift from the left var
        shift_from_left = shift_from_left + sub_width + margin.right;
    }
});
