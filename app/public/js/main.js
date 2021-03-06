$(document).ready(function(){
  function getData(callback){
    $.get('/d3', function(resp){
      var data = [];
      avHourly = parseFloat(resp.averages.average_hourly_rate.value).toFixed(2)
      avCharge = parseFloat(resp.averages.average_charge_rate.value).toFixed(2)
      data.push(avHourly)
      data.push(avCharge)
      console.log(data);
      callback(data);
    })
  }
  getData(function(json){  
    var w = 800;
    var h = 450;
    var margin = {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    };
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var data = json
    
    var x = d3.scale.linear()
        .domain([0,d3.max(data)])
        .range([0,width]);
    var y = d3.scale.linear()
        .domain([0,data.length])
        .range([0,height]);
    var svg = d3.select("div").append("svg")
          .attr("id", "chart")
          .attr("width", w)
          .attr("height", h);
    var chart = svg.append("g")
          .classed("display", true)
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function plot(params){
      this.selectAll(".bar")
        .data(params.data)
        .enter()
          .append("rect")
          .classed("bar", true)
          .attr("x", 0)
          .attr("y", function(d,i){
            return y(i);
          })
          .attr("width", function(d,i){
            return x(d);
          })
          .attr("height", function(d,i){
            return y(1)-1;
          });
      this.selectAll(".bar-label")
        .data(params.data)
        .enter()
          .append("text")
          .classed("bar-label", true)
          .attr("x", function(d,i){
            return x(d);
          })
          .attr("dx", -4)
          .attr("y", function(d,i){
            return y(i);
          })
          .attr("dy", function(d,i){
            return y(1)/1.5+2;
          })
          .text(function(d,i){
            return d;
          });
    }
    plot.call(chart, {
      data: data
    }); 
  }); 
  var w = 800;
    var h = 450;
    var margin = {
      top: 60,
      bottom: 80,
      left: 100,
      right: 80
    };
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;
    var svg = d3.select("section").append("svg")
          .attr("id", "chart")
          .attr("width", w)
          .attr("height", h);
    var chart = svg.append("g")
          .classed("display", true)
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var colorScale = d3.scale.category10();
    var x = d3.scale.linear()
        .range([0,width]);
    var y = d3.scale.linear()
        .domain([1,5])
        .range([height,0]);
    var tickValues = [18,25,32,39,46,53,60,67,74];
    var xAxis = d3.svg.axis()
          .scale(x)
          .tickValues(tickValues)
          .orient("bottom");
    var xGridlines = d3.svg.axis()
          .scale(x)
          .tickValues(tickValues)
          .tickSize(-height,-height)
          .tickFormat("")
          .orient("bottom");
    var yAxis = d3.svg.axis()
          .scale(y)
          .ticks(5)
          .tickSize(20)
          .tickFormat(function(d){
            return d.toFixed(1);
          })
          .orient("left");
    var yGridlines = d3.svg.axis()
            .scale(y)
            .tickSize(-width,0,0)
            .tickFormat("")
            .orient("left");
    var responseScale = d3.scale.linear()
              .range([2,15]);
    function drawAxis(params){
      if(params.initialize){
        this.append("g")
          .classed("gridline x", true)
          .attr("transform", "translate(0," + height + ")")
          .call(params.axis.gridlines.x);
        this.append("g")
          .classed("gridline y", true)
          .attr("transform", "translate(0,0)")
          .call(params.axis.gridlines.y);
        this.append("g")
          .classed("axis x", true)
          .attr("transform", "translate(0," + height + ")")
          .call(params.axis.x);
        this.append("g")
          .classed("axis y", true)
          .attr("transform", "translate(0,0)")
          .call(params.axis.y);
        this.select(".y.axis")
          .append("text")
          .classed("y axis-label", true)
          .attr("transform", "translate(" + -56 + "," + height/2 + ") rotate(-90)")
          .text("Rating (1=Low,5=High)")
        this.select(".x.axis")
          .append("text")
          .classed("x axis-label", true)
          .attr("transform", "translate(" + width/2 + "," + 48 + ")")
          .text("Customer age");
        this.append("g")
          .append("text")
          .classed("chart-header", true)
          .attr("transform", "translate(0,-24)")
          .text("");
      }
    }
    function plot(params){
      x.domain(d3.extent(params.data, function(d){
        return d.age;
      }));
      responseScale.domain(d3.extent(params.data, function(d){
        return d.responses;
      }));
      drawAxis.call(this, params);
      var self = this;
      var donuts = d3.keys(params.data[0]).filter(function(d){
        return d !== "age" && d !== "responses";
      });
      
      //enter() for <g>
      this.selectAll(".donut")
        .data(donuts)
        .enter()
          .append("g")
          .attr("class", function(d){
            return d;
          })
          .classed("donut", true);

      //update for <g>
      this.selectAll(".donut")
        .style("fill", function(d,i){
          return colorScale(i);
        })
        .on("mouseover", function(d,i){
          d3.select(this)
            .transition()
            .style("opacity",1)
        })
        .on("mouseout", function(d,i){
          d3.select(this)
            .transition()
            .style("opacity",0.1)
        });

      donuts.forEach(function(donut){
        var g = self.selectAll("g."+donut);
        var arr = params.data.map(function(d){
          return {
            key: donut,
            value: d[donut],
            age: d.age,
            responses: d.responses
          };
        });
        //enter()
        g.selectAll(".response")
          .data(arr)
          .enter()
            .append("circle")
            .classed("response", true);
        //update
        g.selectAll(".response")
          .attr("r", function(d){
            return responseScale(d.responses);
          })
          .attr("cx", function(d){
            return x(d.age);
          })
          .attr("cy", function(d){
            return y(d.value);
          })
          .on("mouseover", function(d,i){
            var str = d.key + " Donut: ";
            str += "Age: " + d.age + " ";
            str += "Responses: " + d.responses + " ";
            str += "Average Rating: " + d.value;
            d3.select(".chart-header").text(str);
          })
          .on("mouseout", function(d,i){
            d3.select(".chart-header").text("");
          })
        //exit()
        g.selectAll(".response")
          .data(arr)
          .exit()
          .remove();
      });
    }

    d3.csv("/csv/survey_data.csv", function(error, parsed_data){
      console.log("First")
      plot.call(chart, {
        data: parsed_data,
        axis: {
          x: xAxis,
          y: yAxis,
          gridlines:{
            x: xGridlines,
            y: yGridlines
          }
        },
        initialize: true
      })
    });
      console.log("Second");   
});