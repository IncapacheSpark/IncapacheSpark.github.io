// set the dimensions and margins of the graph
var margin = {top: 20, right: 10, bottom: 20, left: 200},
    width = 1100 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

//Tree types colors
var tree_type_colors = ['#FD0100', '#F76915', '#EEDE04', '#A0D636', '#2FA236', '#929191'];

var space_between_lines = 150;
var data_scale = 8;

// append the svg object to the body of the page
var svg = d3.select("#multipleStackedChart")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni_top_trees.csv", function (data) {

    // List of subgroups = header of the csv files = soil condition here
    var tree_types = data.columns.slice(1);

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var circoscriozioni = d3.map(data, function (d) {
        return (d.Neighbourhood)
    }).keys();


    // Add Y axis
    var y = d3.scaleBand()
        .domain(circoscriozioni)
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    //TODO: for each tree type add line
    var space_between = space_between_lines;
    tree_types.forEach((tree_type, t_index) => {
        if (t_index < tree_types.length - 1) {
            svg.append("line")
                .attr("y1", 0)
                .attr("y2", height)
                .style("stroke-width", 1)
                .style("stroke", "black")
                .style("fill", "none")
                .attr("transform", "translate(" + space_between + ")");
        }

        //Adding Tree type text
        tree_type_splited = tree_type.split(" ");
        var text_space = -5;
        tree_type_splited.forEach(t => {
            svg.append("text")
                .attr("transform", "translate(" + (space_between - 120) + "," + text_space + ")")
                .attr("y", 0)
                .attr("dy", ".35em")
                .text(t);

            text_space += 10;
        });
        space_between += space_between_lines;
    });

    var rect_x = 0;
    var rect_y = height - 35;

    data.forEach((data_row, d_index) => {
        tree_types.forEach((tree_type, t_index) => {

            var rect_width = data_row[tree_type] / data_scale;
            var rect_color = tree_type_colors[t_index];

            // console.log("y val of y axis", y(circoscriozioni[d_index]));
            // console.log("positioning the bar in ", rect_x, rect_y, "data =", rect_width, "tree_type =", tree_type)

            svg.selectAll("myRect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", rect_x)
                .attr("y", y(circoscriozioni[d_index]) + 15)
                .attr("width", rect_width)
                .attr("height", 20)
                .attr("fill", rect_color);

            if (t_index < 5) {
                rect_x += space_between_lines;
            }

            if (t_index === 5) {
                rect_x = 0;
                rect_y -= width / 12;
            }
        });
    });
})