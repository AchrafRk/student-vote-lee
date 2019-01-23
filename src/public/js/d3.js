'use strict'
let d3 = require('d3')
let $ = require('jquery')
let once = 0

$(document).ready(() => {

    $('li#liVote').click(() => {
        if(once == 0) {
        $.post('/show-candidates', {}, (obj) => {
            let obj1 = JSON.parse(obj)
            $('#candidate1').append(obj1.data[0].firstName)
            $('#candidate2').append(obj1.data[1].firstName)
            $('#candidate3').append(obj1.data[2].firstName)
            $('#candidate4').append(obj1.data[3].firstName)
            graph(obj1)
            once ++
        })
        }
    })


    $('#candidate1').click(() => {
        $.post('/increment-vote', {btn:$('#candidate1').val(),numb:$('#studentNumber').val(),name:$('#studentName').val()}, (data) => {
        })
    })
    $('#candidate2').click(() => {
        $.post('/increment-vote', {btn:$('#candidate2').val(),numb:$('#studentNumber').val(),name:$('#studentName').val()}, (data) => {
        })
    })
    $('#candidate3').click(() => {
        $.post('/increment-vote', {btn:$('#candidate3').val(),numb:$('#studentNumber').val(),name:$('#studentName').val()}, (data) => {
        })
    })
    $('#candidate4').click(() => {
        $.post('/increment-vote', {btn:$('#candidate4').val(),numb:$('#studentNumber').val(),name:$('#studentName').val()}, (data) => {
        })
    })


    function graph(data) {

        let total = data.data[0].votes + data.data[1].votes + data.data[2].votes + data.data[3].votes
        let PC = []
        for (let i = 0;i < 4;i++) {
            PC[i] = ((data.data[i].votes * 100) / total).toFixed(2)
        }
        const sample = [
            {
                language: data.data[0].firstName,
                value: PC[0],
            },
            {
                language: data.data[1].firstName,
                value: PC[1],
            },
            {
                language: data.data[2].firstName,
                value: PC[2],
            },
            {
                language: data.data[3].firstName,
                value: PC[3],
            }
        ]


        const svg = d3.select('svg')

        const margin = 80
        const width = 700 - 2 * margin
        const height = 400 - 2 * margin

        const chart = svg.append('g')
            .attr('transform', `translate(${margin}, ${margin})`)

        const xScale = d3.scaleBand()
            .range([0, width])
            .domain(sample.map((s) => s.language))
            .padding(0.4)

        const yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, 100])

        const makeYLines = () => d3.axisLeft()
            .scale(yScale)

        chart.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale))

        chart.append('g')
            .call(d3.axisLeft(yScale))

        chart.append('g')
            .attr('class', 'grid')
            .call(makeYLines()
                .tickSize(-width, 0, 0)
                .tickFormat('')
            )

        const barGroups = chart.selectAll()
            .data(sample)
            .enter()
            .append('g')

        barGroups
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (g) => xScale(g.language))
            .attr('y', (g) => yScale(g.value))
            .attr('height', (g) => height - yScale(g.value))
            .attr('width', xScale.bandwidth())
            .on('mouseenter', function(actual, i) {
                d3.selectAll('.value')
                    .attr('opacity', 0)

                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', 0.6)
                    .attr('x', (a) => xScale(a.language) - 5)
                    .attr('width', xScale.bandwidth() + 10)

                const y = yScale(actual.value)

                chart.append('line')
                    .attr('id', 'limit')
                    .attr('x1', 0)
                    .attr('y1', y)
                    .attr('x2', width)
                    .attr('y2', y)

                barGroups.append('text')
                    .attr('class', 'divergence')
                    .attr('x', (a) => xScale(a.language) + xScale.bandwidth() / 2)
                    .attr('y', (a) => yScale(a.value) + 30)
                    .attr('fill', 'white')
                    .attr('text-anchor', 'middle')
                    .text((a, idx) => {
                        const divergence = (a.value - actual.value).toFixed(1)

                        let text = ''
                        if (divergence > 0) {
                            text += '+'
                        }
                        text += `${divergence}%`

                        return idx !== i ? text : ''
                    })

            })
            .on('mouseleave', function() {
                d3.selectAll('.value')
                    .attr('opacity', 1)

                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', 1)
                    .attr('x', (a) => xScale(a.language))
                    .attr('width', xScale.bandwidth())

                chart.selectAll('#limit').remove()
                chart.selectAll('.divergence').remove()
            })

        barGroups
            .append('text')
            .attr('class', 'value')
            .attr('x', (a) => xScale(a.language) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.value) + 30)
            .attr('text-anchor', 'middle')
            .text((a) => `${a.value}%`)

        svg
            .append('text')
            .attr('class', 'label')
            .attr('x', -(height / 2) - margin)
            .attr('y', margin / 2.4)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .text('Percentage of Vote (%)')

        svg.append('text')
            .attr('class', 'label')
            .attr('x', width / 2 + margin)
            .attr('y', height + margin * 1.7)
            .attr('text-anchor', 'middle')
            .text('Candidates')

        svg.append('text')
            .attr('class', 'title')
            .attr('x', width / 2 + margin)
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .text('Voting Results')
    }

})