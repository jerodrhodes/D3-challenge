// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 90,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function to update x-scale var upon click of x-axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    
    return xLinearScale;
}

// function to update xAxis var upon click of x-axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function to update circle group and transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    console.log(52)
    d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          .attr("cx", function(d) {
            return newXScale(d[chosenXAxis]);
          })
          .duration(300);
      });

      d3.selectAll(".state").each(function() {
        d3
          .select(this)
          .transition()
          .attr("x", function(d) {
            return newXScale(d[chosenXAxis]);
          })
          .duration(300);
      });

}

// function to update circles group w/ new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;

    if (chosenXAxis === "poverty") {
        label = "% in Poverty";
    }
    else if (chosenXAxis === "age") {
        label = "Age (Median)";
    }
    else {
        label = "Household Income (Median)"
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
        });

    svg.call(toolTip);

    // circlesGroup.on("mouseover", function(data) {
    //     toolTip.show(data);
    // })
    //     // mouseout
    //     .on("mouseout", function(data, index) {
    //         toolTip.hide(data);
    //     });

    return circlesGroup;
}

// Import Data
d3.csv("data.csv").then(function(healthData, err) {
    if (err) throw err;
    console.log(healthData)
    // Parse Data/Cast as numbers
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
      });

    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);

    // y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([20, d3.max(healthData, d => d.obesity)])
      .range([height, 0]);

    // initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x-axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y-axis
    chartGroup.append("g")
      .call(leftAxis);

      label = "% in Poverty";

      var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
          return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
      });

  svg.call(toolTip);

    // append intial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter();

    circlesGroup
      .append("text")
      .classed("state", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d.obesity))
      .text(function(d){return d.abbr});
      
    circlesGroup
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.obesity))
      .attr("r", 15)
      .attr("fill", "orange")
      .attr("opacity", ".5")
      .on("mouseover", function(data) {
        toolTip.show(data);
    })
        // mouseout
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

        


    // group for three x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height +20})`);

    var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab listener
      .classed("inactive", true)
      .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab listener
        .classed("inactive", true)
        .text("Age (Median)");
    
    var incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // append y-axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Obese (%)");
    
    // update ToolTip function abover csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x-axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {
              // replace chosenXAxis with value
              chosenXAxis = value;

              // update x scale for new data
              xLinearScale = xScale(healthData, chosenXAxis);
              
              // update circles with new x values
              xAxis = renderAxes(xLinearScale, xAxis);
            
              // update x-axis with transition
              circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
              
              // update circles with new info
              circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
              
              // change classes to change bold text
              if (chosenXAxis === "poverty") {
                  povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);  
              }
              else if (chosenXAxis === "age"){
                  povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
              }
              else {
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
              }
          }
      });

}).catch(function(error) {
    console.log(error);
});