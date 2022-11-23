let total = 0;

const color = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ced4da']

d3.csv("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni_top_trees.csv").then(function (data) {

    // List of subgroups = header of the csv files = plants
    const TreeNames = Object.keys(data[0]).filter(d => d !== "Neighbourhood");

    //total = d3.sum(data, function(d) { return d.count; });
    let k = 0;
    data.forEach((f, i) => {

        let width,
            height,
            widthSquares = 10,
            heightSquares = 10,
            squareSize = 20,
            squareValue = 0,
            gap = 1,
            theData = [];

        //total
        total = 0;
        for (i in TreeNames) {
            name = TreeNames[i];
            total += +f[name];
        }
        //value of a square
        squareValue = total / (widthSquares * heightSquares);

        Object.keys(f).forEach(function (d, i)  //remap data
        {
            if (d === "Neighbourhood") {
                return;
            }
            //console.log(d);   //accedi nome albero
            //console.log(f[d]);  //accedi count albero
            f[d] = +f[d];
            // risolvere !!!!
            f.units = Math.round(f[d] / squareValue);
            theData = theData.concat(
                Array(f.units + 1).join(1).split('').map(function () {
                    return {
                        squareValue: squareValue,
                        units: f.units,
                        count: f[d],
                        groupIndex: i,
                        nameTree: d
                    };
                })
            );
        });

        if (theData.length < 100) {
            for (let i=0; i<100-theData.length; i++) {
                theData = theData.slice(0, 1).concat(theData)
            }
        }

        theData = theData.slice(0,100)

        width = (squareSize * widthSquares) + widthSquares * gap + 25;
        height = (squareSize * heightSquares) + heightSquares * gap + 25;

        // create a tooltip
        const tooltip = d3.select("#waffle" + k)
            .append("div")
            .attr("class", "tooltip")

        d3.select("#waffle" + k)
            .append("p")
            .text(f.Neighbourhood)
            .style("margin-top", "20px")
            .style("margin-bottom", "-10px")
            .style("font-family", "Roboto slab")
            .style("font-weight", "bold")


        d3.select("#waffle" + k)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .join("g")
            .selectAll("div")
            .data(theData)
            .join("rect")
            .attr("class", f => "waffle" + k + " " + f.nameTree.replaceAll(' ', '_'))
            .attr("width", squareSize)
            .attr("height", squareSize)
            .attr("fill", function (f) {
                return color[f.groupIndex - 1];
            })
            .attr("x", function (f, i) {
                //group n squares for column
                col = Math.floor(i / heightSquares);
                return (col * squareSize) + (col * gap);
            })
            .attr("y", function (f, i) {
                row = i % heightSquares;
                return (heightSquares * squareSize) - ((row * squareSize) + (row * gap))
            })
            .on("mouseover", function (event, d) { // What happens when user hover a bar

                // what subgroup are we hovering?
                const waffleId = d3.select(this.parentNode.parentNode).attr('id')

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);

                tooltip.html("<span class='tooltiptext'>" + "Tree type: " + d.nameTree + "<br>" + "Aboundance: " + d.count + " (" + d.units + "%)" + "</span>")
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");

                // Reduce opacity of all rect to 0.2
                d3.selectAll("." + waffleId)
                    .style("opacity", 0.2)

                // Highlight all rects of this subgroup with opacity 1.
                // It is possible to select them since they have a specific class = their name.
                d3.selectAll("." + d.nameTree.replaceAll(' ', '_'))
                    .style("opacity", 1)

            })
            .on("mouseleave", function (event, d) { // When user do not hover anymore

                const waffleId = d3.select(this.parentNode.parentNode).attr('id')

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);

                // Back to normal opacity: 1
                d3.selectAll("." + waffleId)
                    .style("opacity", 1)
            });
        k += 1;
    });
});
