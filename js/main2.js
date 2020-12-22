let _width = $(window).width();
let _height = $(window).height();
let width = 0.5 * _width;
let height = 0.56 * _height;

let x_attr = 'Ph.D. Graduation Year';
let y_attr = 'Publications';
//let z_attr = 'Publications Divided by Co-authors';
let z_attr = 'H-index';
let fontFamily;

function set_ui() {
    // 设置字体
    let ua = navigator.userAgent.toLowerCase();
    fontFamily = "Industry-Medium,Khand-Regular";
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    //fontFamily = "";
    d3.select("body")
        .style("font-family", fontFamily);
}

function draw_main() {
    //right之前是0.5
    let padding = { 'left': 0.1 * width, 'bottom': 0.5 * height, 'top': 0.1 * height, 'right': 0.5 * width };
    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    var allGroup = ["All"];
    for (var i = 0; i < data.length; i++) {
        if ((i == 0) || (data[i].Institution != data[i - 1].Institution)) {
            allGroup.push(data[i].Institution);
        }
    };
    var colorgroup = ["", "Aqua", "#CD853F", "BlueViolet", "Brown", "DarkCyan", "Crimson", "DarkOliveGreen", "DarkOrange",
        "DarkTurquoise", "#FF1493", "#B22222", "#FFD700", "#228B22", "#FF69B4", "#4B0082", "##000080", "##00FA9A", "#778899",
        "#DDA0DD", "#808000", "#DA70D6", "#B0E0E6", "#2E8B57", "#D2B48C", "#008080", "#FF6347", "#40E0D0", "#C0C0C0"];

    //console.log(allGroup.length);
    // title
    svg.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${padding.top * 0.4})`)
        .append('text')
        .attr('class', 'title')
        .text('A Visualization for Faculties That Research on Computer Science in Well-known Universities');

    let xlimleft = get_min_max(data, x_attr)[0]
    let xlimright = get_min_max(data, x_attr)[1]
    // x axis - phd graduation year
    let x = d3.scaleLinear()
        .domain([xlimleft, xlimright])
        .range([padding.left, width - padding.right]);
    let axis_x = d3.axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(d => d);

    let z = d3.scaleLinear()
        .domain(get_min_max(data, z_attr))
        .range([1, 15]);

    // y axis - publications
    let y = d3.scaleLinear()
        .domain(get_min_max(data, y_attr))
        .range([height - padding.bottom, padding.top]);
    let axis_y = d3.axisLeft()
        .scale(y)
        .ticks(10)
        .tickFormat(d => d);

    // color scale
    let color = d3.scaleOrdinal()
        .domain(allGroup)
        .range(colorgroup);
    // x axis
    let xxs = svg.append('g')
        .attr('transform', `translate(${0}, ${height - padding.bottom})`)
        .call(axis_x)
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem')

    svg.append('g')
        .attr('transform', `translate(${padding.left + (width - padding.left - padding.right) / 2}, ${height - padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.08 * height)
        .text(x_attr);

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
        .text(y_attr);

    //set iteractive legends
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .classed("legend", true)
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });
    legend.on("click", function (d, i) {
        d3.selectAll(".legend")
            .style("opacity", 0.3);
        // make the one selected be un-dimmed
        d3.select(this)
            .style("opacity", 1);
        updateChart(i);
        //console.log(colorgroup.length);
        //console.log(color.domain());
    })
    legend.append("rect")
        .data(color.domain())
        .attr("x", width - 320)
        .attr("y", 100)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 300)
        .attr("y", 110)
        //.attr("dy", ".65em")
        .text(function (d) {
            return d;
        });

    // points
    svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('class', 'point')
        .attr('cx', (d, i) => {
            //console.log('data', d); 
            return x(parseInt(d[x_attr]));
        })
        .attr('cy', (d, i) => y(parseInt(d[y_attr])))
        //.attr('r', 3)
        .attr('r', (d, i) => z(parseInt(d[z_attr])))
        .attr('fill', (d, i) => color(d["Institution"]))
        .on('mouseover', (e, d) => {
            // show a tooltip
            let name = d['First Name'] + ' ' + d['Mid Name'] + ' ' + d['Last Name'];
            let institution = d['Institution'];
            let grad_year = d['Ph.D. Graduation Year'];
            let grad_school = d['Ph.D. Graduate School'];
            let pubs = d['Publications'];
            let hin = d[z_attr]
            let intes = d["Research Interest"]
            let content = name + ', ' + institution + '<br>' + 'Graduated in ' + grad_school + ' at '
                + grad_year + '<br>Research Interest: ' + intes + '<br>Publications: ' + pubs + '<br>'
                + 'H-index: ' + hin;
            // tooltip
            let tooltip = d3.select('#tooltip');
            tooltip.html(content)
                .style('left', (x(parseInt(d[x_attr])) + 15) + 'px')
                .style('top', (y(parseInt(d[y_attr])) + 5) + 'px')
                .style('visibility', 'visible')
            //.transition().duration(500)

            //fading
            fading(institution);

        })
        .on('mouseout', (e, d) => {

            // remove tooltip
            let tooltip = d3.select('#tooltip');
            tooltip.style('visibility', 'hidden');

        })
        .on('mouseleave', reset)

    // update x-axis limits
    function updateplot2() {
        xlimright = this.value;
        x.domain([xlimleft, xlimright]);
        xxs.transition().duration(1000).call(axis_x);
        svg.selectAll("circle")
            .data(data)
            .transition()
            .duration(1000)
            //.attr('cx', (d, i) => {return parseInt(d[x_attr])>xlimright? _width:x();})
            .attr('cx', function (d) {
                let xpx = parseInt(d[x_attr]);
                if (xpx < xlimleft) {
                    return -10;
                }
                else if (xpx > xlimright) {
                    return _width;
                }
                else return x(xpx)
            })
            .attr('cy', (d, i) => y(parseInt(d[y_attr])));
    }
    function updateplot1() {
        xlimleft = this.value;
        x.domain([xlimleft, xlimright]);
        xxs.transition().duration(1000).call(axis_x);
        svg.selectAll("circle")
            .data(data)
            .transition()
            .duration(1000)
            //.attr('cx', (d, i) => {return parseInt(d[x_attr])<xlimleft? -1:x(parseInt(d[x_attr]));})
            .attr('cx', function (d) {
                let xpx = parseInt(d[x_attr]);
                if (xpx < xlimleft) {
                    return -10;
                }
                else if (xpx > xlimright) {
                    return _width;
                }
                else return x(xpx)
            })
            .attr('cy', (d, i) => y(parseInt(d[y_attr])));
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
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    function updateChart(selectedGroup) {
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
                    return d.Institution == selectedGroup;
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


    // interactived group selection
    function fading(selected_ins) {
        svg.selectAll("circle")
            .transition()
            .duration(500)
            .style("fill", "lightgrey")
            .attr("r", 2)
        svg.selectAll("circle")
            .data(data)
            .filter(function (d) {
                return d.Institution == selected_ins;
            })
            .transition()
            .duration(500)
            .style("fill", color(selected_ins))
            .attr("r", function (d) {
                return z(parseInt(d[z_attr])) + 1;
            })
    }
    function reset() {
        svg.selectAll('circle')
            .data(data)
            .transition()
            .duration(500)
            .attr('r', (d, i) => z(parseInt(d[z_attr])))
            .style('fill', (d, i) => color(d["Institution"]))
    }
}



function main() {
    d3.csv(data_file).then(function (DATA) {
        data = DATA;

        // remove data without x_attr or y_attr
        data = data.filter((d, i) => (d[x_attr] != '' && d[y_attr] != ''));

        //console.log(allGroup);
        //var allGroup = d3.map(data, function(d){return(d.Institution)}).keys();
        // console.log(allGroup);
        set_ui();
        draw_main();
    })

}

main()
