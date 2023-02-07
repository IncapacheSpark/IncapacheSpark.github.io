// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 650 - margin.left - margin.right,
    height = 680 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Color scale used
var color = d3.scaleOrdinal(d3.schemeCategory20);

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(10)
    .size([width, height]);

// load the data
<<<<<<< HEAD
url = "/python/assignment_5/ass_5_sankey_normalized.json";
d3.json(url, function(error, graph) {
  console.log(graph);
=======
const sankey_url = "/python/assignment_5/ass_5_sankey.json";

  d3.json(sankey_url, (error, graph) => {
  

  function get_value_by_graph(source_index, target_index){
    for(var i = 0; i < graph.links.length; i++){
      var carbon_data = graph.links[i];
      if (source_index == carbon_data.source.node){
        if(target_index == carbon_data.target.node){
          return carbon_data.value;
        }
      }
    }
    return 0;
  }

  function tooltip_text_generator(source_index){
    if (source_index == 0){
      //left part of the flux
      return "Corresponding carbon storage ";
    } else{
      //right part of the flux
      return "Corresponding eco-benefit ";
    }
  }


  //Tooltip left links
  var tooltip = d3.select("#my_dataviz")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip");

  var mouseover = (d) => {
    console.log(d);
    tooltip
      .style("opacity", 1)
      .style("left", d3.event.x + "px")
      .style("top", d3.event.y + "px");
  }

  var mousemove = (d) => {
    tooltip
      .html(tooltip_text_generator(d.source.node) + get_value_by_graph(d.source.node, d.target.node));
  }
  var mouseleave = (d) => {
    tooltip
      .style("opacity", 0);
  }

>>>>>>> d40f66b2b9a6d06de9200f16dad9c0f2219228a6
  // Constructs a new Sankey generator with the default settings.
  sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(1);

  // add in the links
  var link = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
      .attr("class", "link")
      .attr("d", sankey.link() )
      .style("stroke-width", (d) => { return Math.max(1, d.dy); })
      .sort((a, b) => { return b.dy - a.dy; })
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

  // add in the nodes
  var node = svg.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d) => { return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.drag()
        .subject((d) => { return d; })
        .on("start", () => { this.parentNode.appendChild(this); })
        .on("drag", dragmove));

  // add the rectangles for the nodes
  node
    .append("rect")
      .attr("height", (d) => { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", (d) => { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", (d) => { return d3.rgb(d.color).darker(2); })
    // Add hover text
    .append("title")
      .text((d) => { return d.name + "\n" + "There is " + d.value + " stuff in this node"; });

  // add in the title for the nodes
    node
      .append("text")
        .attr("x", -6)
        .attr("y", (d) => { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text( (d) => { return d.name; })
      .filter((d) => { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

  // the function for moving the nodes
  function dragmove(d) {
    d3.select(this)
      .attr("transform",
            "translate("
               + d.x + ","
               + (d.y = Math.max(
                  0, Math.min(height - d.dy, d3.event.y))
                 ) + ")");
    sankey.relayout();
    link.attr("d", sankey.link() );
  }

});
