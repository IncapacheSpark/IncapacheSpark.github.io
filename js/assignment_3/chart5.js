
// The svg
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

trento_center = [11.1207, 46.0664]

const projection = d3.geoIdentity().reflectY(true)


Promise.all([
    d3.json("https://raw.githubusercontent.com/IncapacheSpark/IncapacheSpark.github.io/main/python/data/circoscrizioni.geojson"),
    d3.csv("/python/data/geo_data_trees_all.csv"),
    d3.csv('/python/top_ten_trees.csv')
]).then(function (initialize) {

    let dataGeo = initialize[0];
    projection.fitSize([width-100, height], dataGeo);
    let data = initialize[1];
    let top_ten_trees = initialize[2];

    let trees_types = [];

    top_ten_trees.forEach((t) =>{
        trees_types.push(t.Name);
    });
    trees_types.push("Others")


    console.log('The ten top trees species are' , trees_types);


    var trees_colors = ['#6888CB','#738074', '#D82B36', '#000000',	'#59481A','#2831DC', '#8E752E', '#58C00F', '#DA6797', '#4B08B1', '#EAF364'];

    // Color scale: give me a specie name, I return a color
    const color = d3.scaleOrdinal()
    .domain(trees_types)
    .range(trees_colors);

    function treeNameToColor(treeName){
        var color_index = top_ten_trees.findIndex(tree => tree.Name == treeName);
        // this tree is not one of the top 10!!!
        if (color_index == -1) return trees_colors[trees_colors.length-1];
        return color(treeName);
    }


    // Define the div for the map tooltip
    var tooltip = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);


    // Highlight the specie that is hovered
    const highlight = function (event, d) {
        selected_specie = d
        d3.selectAll(".dot")
            .style("opacity", 0)
        d3.selectAll("." + selected_specie.replaceAll(' ', '_'))
            .style("opacity", 1)
    }

    // Highlight the specie that is hovered
    const doNotHighlight = function () {
        d3.selectAll(".dot")
            .style("opacity", 1)
    }


    //LEGEND
    const size = 20

    svg.selectAll("myrect")
        .data(trees_types)
        .join("circle")
        .attr("cx", 650)
        .attr("cy", (d, i) => 10 + i * (size + 5)) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", d => color(d))
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight);
    
    svg.selectAll("mylabels")
        .data(trees_types)
        .enter()
        .append("text")
        .attr("x", 650 + size * .8)
        .attr("y", (d, i) => i * (size + 5) + (size / 2)) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", d => color(d))
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight);

    
    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(dataGeo.features)
        .join("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "white")
        .style("opacity", .2)

    // Add circles:
    svg
        .selectAll("myCircles")
        .data(data.map(d => d))
        .join("circle")
        .attr("cx", d => projection([+d.Longitude, +d.Latitude])[0])
        .attr("cy", d => projection([+d.Longitude, +d.Latitude])[1])
        .attr("r", 2)
        .style("fill", d => treeNameToColor(d.Name))
        //"green")
        .attr("stroke", "none")
        .attr("stroke-width", 1)
        .attr("fill-opacity", .4)
        .attr("class", function (data) {
            //the selected point is of an other type tree
            if (top_ten_trees.findIndex(tree => tree.Name == data.Name) == -1){
                return "dot Others";
            }else{
                return "dot " + data.Name.replaceAll(' ', '_');
            }
        })
        .on("mouseover", (e, d) =>{
            
            tooltip.transition()		
                .duration(200)		
                .style("opacity", .9);		
            tooltip.html("Tree specie: " + d.Name)
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {	
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
        });
        
})