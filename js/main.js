let _width = $(window).width()
let _height = $(window).height()
let width0 = 0.9 * _width
let height0 = 0.96 * _height
let width = width0/2
let height = height0/ 2.4
let x_attr = 'Ph.D. Graduation Year'
let y_attr = 'Publications'
//let z_attr = 'Publications Divided by Co-authors';
let z_attr = 'H-index'
let fontFamily
var deg = {}
let colorset = ["#2ed5eb", "#a1dab4","#41b6c4","#2c7fb8", "#253494"];

let COLOR
let Z

let data = null
let graph = null
let data_file = './data/data.csv'
let ua = navigator.userAgent.toLowerCase()
fontFamily = "Khand-Regular"
if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
    fontFamily = "PingFangSC-Regular"
}
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) { return d.id }))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width/2, height0/2))

//fontFamily = "";
d3.select("body")
    .style("font-family", fontFamily)




d3.csv(data_file).then(function (DATA) {
    data = DATA
    // remove data without x_attr or y_attr
    data = data.filter((d, i) => (d[x_attr] != '' && d[y_attr] != '' && d[z_attr] != ''))
    //console.log(data)
    draw_chart2()
})

d3.json("./data/data.json").then(function (DATA) {
    graph = DATA
   // console.log(graph)
    draw_chart1()
})
var chart1 = d3
    .select("#chart1")
    .append("svg")
    .attr('width', width)
    .attr('height', height0)
let svg = d3
    .select('#chart2')
    .append("svg")
    .attr('width', width)
    .attr('height', height)


function get_min_max (data, attr) {
    let min = 1e9
    let max = 0
    data.forEach(d => {
        let v = parseInt(d[attr])
        if (v > max)
            max = v
        if (v < min)
            min = v
    })
    //console.log('attr', attr, 'min', min, 'max', max);

    return [min, max]
}


// interactived group selection
function fading (selected_ins) {
    //console.log(selected_ins)
    svg.selectAll("circle")
        .transition()
        .duration(500)
        .style("fill", "lightgrey")
        .attr("r", 1)
    svg.selectAll("circle")
        .data(data)
        .filter(function (d) {
            //console.log(selected_ins)
            //console.log(COLOR(selected_ins))
            return d.Institution == selected_ins
        })
        .transition()
        .duration(500)
        .style("fill", COLOR(selected_ins))
        .attr("r", function (d) {
            return Z(parseInt(d[z_attr])) + 1
        })
    chart1
        .selectAll("circle")
        .transition()
        .duration(500)
        .attr("r", d => (Math.sqrt(d.weight)*1.5 + 0.6) / 2)
        .style("fill", "lightgrey")
    chart1
        .selectAll("circle")
        .filter(function (d){
            return d.id == selected_ins
        })
        .transition()
        .duration(500)
        .attr("r", d => 3 * (Math.sqrt(d.weight)*1.5 + 0.6) / 2)
        .style("fill", COLOR(selected_ins))
        
    // node.append("title")
    //     .text(function (d) { 
    //         return d.id })
}
function reset () {
    svg.selectAll('circle')
        .data(data)
        .transition()
        .duration(500)
        .attr('r', (d, i) => Z(parseInt(d[z_attr])))
        .style('fill', (d, i) => COLOR(d["Institution"]))
    chart1.selectAll("circle")
        .transition()
        .duration(500)
        .attr("r", d => Math.sqrt(d.weight)*1.5 + 0.6)
        .style("fill",function(e,d){
            if (deg[e.id] == 1) return colorset[0];
            else if (e.weight <=20) return colorset[1];
            else if (e.weight <=80) return colorset[2];
            else if (e.weight<=150) return colorset[3];
            else return colorset[4];
        })
}


function draw_chart1 () {
    // width *= 2
    // height *= 2
    
    console.log(width,height)
    //.attr("viewBox", [0, 0, 0.9*width, height]);
    nodes = graph.nodes
    links = graph.links
    for (i in nodes){
        deg[nodes[i].id] = 0;
    }
    for (l in links){
        deg[links[l].source] += 1;
        deg[links[l].target] += 1;
    }
    console.log(width)
    
    var link = chart1.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function (d) { return Math.sqrt(d.weight) })

    var node = chart1.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")

    var circles = node.append("circle")
        .attr("r", d => Math.sqrt(d.weight)*1.5 + 0.6)
        .attr("fill",function(e,d){
            if (deg[e.id] == 1) return colorset[0];
            else if (e.weight <=20) return colorset[1];
            else if (e.weight <=80) return colorset[2];
            else if (e.weight<=150) return colorset[3];
            else return colorset[4];
        })
        .on('mouseover', function(e, d){
            // console.log(d)
            fading(d.id)
        })
        .on('mouseleave', reset)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))

    // var lables = node.append("text")
    //     .text(function (d) {
    //         return d.id
    //     })
    //     .attr('x', 6)
    //     .attr('y', 3)

    node.append("title")
        .text(function (d) { 
            return d.id })

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked)

    simulation.force("link")
        .links(graph.links)

    function ticked () {
        link
            .attr("x1", function (d) { return d.source.x })
            .attr("y1", function (d) { return d.source.y })
            .attr("x2", function (d) { return d.target.x })
            .attr("y2", function (d) { return d.target.y })

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")"
            })
    }
}
function draw_chart2() {
    //right之前是0.5
    let padding = { 'left': 0.1 * width, 'bottom': 0.1 * height, 'top': 0.1 * height, 'right': 0.05 * width }
    var allGroup = ["All"]
   //console.log(String(data[0].Institution))
    for (var i = 0; i < data.length; i++) {
        flag = true
        for (var j = 1; j < allGroup.length ; j++){
            if (String(data[i].Institution) == allGroup[j]){
                flag = false;
                break
            }
        }
        if (flag ){
            allGroup.push(data[i].Institution)
        }
    };
    console.log(allGroup)
    var colorgroup = ["grey", "Aqua", "#CD853F", "BlueViolet", "Brown", "DarkCyan", "Crimson", "DarkOliveGreen", "DarkOrange",
        "DarkTurquoise", "#FF1493", "#B22222", "#FFD700", "#228B22", "#FF69B4", "#4B0082", "#000080", "#00FA9A", "#778899",
        "#DDA0DD", "Red", "#DA70D6", "#B0E0E6", "#2E8B57", "#D2B48C", "#008080", "#FF6347", "#40E0D0", "#C0C0C0"]

    console.log(allGroup.length);
    console.log(colorgroup.length)
    // title
    svg.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2 - 180}, ${padding.top * 0.4})`)
        .append('text')
        .attr('class', 'title')
        .text('A Visualization for Faculties That Research on Computer Science in Well-known Universities')

    let xlimleft = get_min_max(data, x_attr)[0]
    let xlimright = get_min_max(data, x_attr)[1]
    // x axis - phd graduation year
    let x = d3.scaleLinear()
        .domain([xlimleft, xlimright])
        .range([padding.left, width - padding.right])
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d => d)

    Z = d3.scaleLinear()
        .domain(get_min_max(data, z_attr))
        .range([1, 15])

    // y axis - publications
    let y = d3.scaleLinear()
        .domain(get_min_max(data, y_attr))
        .range([height - padding.bottom, padding.top])
    let axis_y = d3.axisLeft()
        .scale(y)
        .ticks(10)
        .tickFormat(d => d)

    // color scale
    COLOR = d3.scaleOrdinal()
        .domain(allGroup)
        .range(colorgroup)

    console.log(COLOR("Stanford University"))
    // x axis
    let xxs = svg.append('g')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem')

    svg.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2 - 30}, ${height - padding.bottom + 5})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.08 * height)
        .text(x_attr)

    // y axis
    svg.append('g')
        .attr('transform', `translate(${padding.left}, ${0})`)
        .call(axis_y)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem')
    svg.append('g')
        .attr('transform', `
            translate(${padding.left}, ${height / 2})
            rotate(-90)    
        `)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dy', -height * 0.1)
        .text(y_attr)

    //set iteractive legends
    // var legend = svg.selectAll(".legend")
    //     .data(color.domain())
    //     .enter().append("g")
    //     .classed("legend", true)
    //     .attr("transform", function (d, i) {
    //         return "translate(0," + i * 20 + ")"
    //     })
    // legend.on("click", function (d, i) {
    //     d3.selectAll(".legend")
    //         .style("opacity", 0.3)
    //     // make the one selected be un-dimmed
    //     d3.select(this)
    //         .style("opacity", 1)
    //     updateChart(i)
    //     //console.log(colorgroup.length);
    //     //console.log(color.domain());
    // })
    // legend.append("rect")
    //     .data(color.domain())
    //     .attr("x", 0.95*width0)
    //     .attr("y", 0.1*height0)
    //     .attr("width", 12)
    //     .attr("height", 12)
    //     .style("fill", color)

    // legend.append("text")
    //     .attr("x", width - 300)
    //     .attr("y", 110)
    //     //.attr("dy", ".65em")
    //     .text(function (d) {
    //         return d
    //     })

    // points
    svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('class', 'point')
        .attr('cx', (d, i) => {
            //console.log('data', d); 
            return x(parseInt(d[x_attr]))
        })
        .attr('cy', (d, i) => y(parseInt(d[y_attr])))
        //.attr('r', 3)
        .attr('r', (d, i) => Z(parseInt(d[z_attr])))
        .attr('fill', (d, i) => COLOR(d["Institution"]))
        .on('mouseover', (e, d) => {
            // show a tooltip
            let name = d['First Name'] + ' ' + d['Mid Name'] + ' ' + d['Last Name']
            let institution = d['Institution']
            let grad_year = d['Ph.D. Graduation Year']
            let grad_school = d['Ph.D. Graduate School']
            let pubs = d['Publications']
            let hin = d[z_attr]
            let intes = d["Research Interest"]
            let content = name + ', ' + institution + '<br>' + 'Graduated in ' + grad_school + ' at '
                + grad_year + '<br>Research Interest: ' + intes + '<br>Publications: ' + pubs + '<br>'
                + 'H-index: ' + hin
            // tooltip
            let tooltip = d3.select('#tooltip')
            // tooltip.html(content)
            //     .style('left', (x(parseInt(d[x_attr])) + 15) + 'px')
            //     .style('top', (y(parseInt(d[y_attr])) + 5) + 'px')
            //     .style('visibility', 'visible')
            //.transition().duration(500)

            //fading
            fading(institution)

        })
        .on('mouseout', (e, d) => {

            // remove tooltip
            let tooltip = d3.select('#tooltip')
            tooltip.style('visibility', 'hidden')

        })
        .on('mouseleave', reset)

    // update x-axis limits
    function updateplot2 () {
        xlimright = this.value
        x.domain([xlimleft, xlimright])
        xxs.transition().duration(1000).call(axis_x)
        svg.selectAll("circle")
            .data(data)
            .transition()
            .duration(1000)
            //.attr('cx', (d, i) => {return parseInt(d[x_attr])>xlimright? _width:x();})
            .attr('cx', function (d) {
                let xpx = parseInt(d[x_attr])
                if (xpx < xlimleft) {
                    return -10
                }
                else if (xpx > xlimright) {
                    return _width
                }
                else return x(xpx)
            })
            .attr('cy', (d, i) => y(parseInt(d[y_attr])))
    }
    function updateplot1 () {
        xlimleft = this.value
        x.domain([xlimleft, xlimright])
        xxs.transition().duration(1000).call(axis_x)
        svg.selectAll("circle")
            .data(data)
            .transition()
            .duration(1000)
            //.attr('cx', (d, i) => {return parseInt(d[x_attr])<xlimleft? -1:x(parseInt(d[x_attr]));})
            .attr('cx', function (d) {
                let xpx = parseInt(d[x_attr])
                if (xpx < xlimleft) {
                    return -10
                }
                else if (xpx > xlimright) {
                    return _width
                }
                else return x(xpx)
            })
            .attr('cy', (d, i) => y(parseInt(d[y_attr])))
    }
    d3.select('#limit2').on("input", updateplot2)
    d3.select('#limit1').on("input", updateplot1)

    // update institutions

    //console.log(allGroup);
    //console.log(allGroup.length);

    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d }) // text showed in the menu
        .attr("value", function (d) { return d }) // corresponding value returned by the button

    function updateChart (selectedGroup) {
        if (selectedGroup == "All") {
            svg.selectAll("circle")
                .data(data)
                .transition()
                .duration(500)
                .attr("opacity", 1)
                .attr("visibility", "visible")
        }
        else {
            svg.selectAll("circle")
                .data(data)
                //.attr("opacity",1)
                .transition()
                .duration(500)
                .attr("opacity", 0)
                .attr("visibility", "hidden")
            svg.selectAll("circle")
                .data(data)
                .filter(function (d) {
                    return d.Institution == selectedGroup
                })
                .transition()
                .duration(500)
                .attr("visibility", "visible")
                .attr("opacity", 1)
            //console.log(selectedGroup);
        }
    }

    d3.select("#selectButton")
        .on("change", function (d) {
            selectedGroup = this.value
            updateChart(selectedGroup)
        })

}


function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }









