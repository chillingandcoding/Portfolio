import { fetchJSON, renderProjects } from '../global.js';

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const numProjects = document.querySelector('.projects-title');

document.querySelector('.projects-title').textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let query = '';
let selectedIndex = -1;

function renderPieChart(projectsGiven) {

    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );

    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));

    let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove();

    let legend = d3.select('.legend');
    legend.selectAll('*').remove()

    newArcs.forEach((arc, idx) => {
        d3.select('#projects-pie-plot')
            .append('path')
            .attr('d', arc)
            .attr('fill', colors(idx))
            .attr('class', selectedIndex === idx ? 'selected' : '')
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;
                newSVG
                    .selectAll('path')
                    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
                legend
                    .selectAll('li')
                    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
                if (selectedIndex === -1) {
                    renderProjects(projects, projectsContainer, 'h2');
                } else {
                    const currentYear = newData[selectedIndex].label;
                    const filteredProjects = projects.filter(p => p.year === currentYear);
                    renderProjects(filteredProjects, projectsContainer, 'h2');
                }
            });
    });
    newData.forEach((d, idx) => {
        legend
            .append('li')
            .attr('class', selectedIndex === idx ? 'selected' : '')
            .attr('style', `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    selectedIndex = -1;
    query = event.target.value;
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    if (filteredProjects.length === 0) {
        renderProjects([], projectsContainer, 'h2');
        renderPieChart(projects);
    } else {
        renderProjects(filteredProjects, projectsContainer, 'h2');
        renderPieChart(filteredProjects);
    }
});

