"use strict";

document.addEventListener("DOMContentLoaded", getJson);

async function getJson() {
    let pagesUrl = "https://mandalskeawebspace.dk/claude_php/clean_up_spreadsheet.php?id=1uLNO5Z7ghpMy283IND0YbnVHK-gW6VIGHrCk39T_DRo";
    let jsonData = await fetch(pagesUrl);
    const deathArray = await jsonData.json();
    start(deathArray);
}

function start(deathArray) {
    console.log(deathArray);
    showTimeline(deathArray);
}


function showTimeline(deathArray) {

    deathArray.forEach(fatality => {
        const timelineTemplate = document.querySelector(".timeline_template").content.cloneNode(true);
        const infoboxTemplate = document.querySelector(".infobox_template").content.cloneNode(true);

        // template.querySelector(".timeline_icon").textContent = fatality.name;
        timelineTemplate.querySelector(".timeline_name").textContent = fatality.name;
        timelineTemplate.querySelector(".timeline_death_date").textContent = fatality.death;

        document.querySelector(".book").appendChild(timelineTemplate);

    });
}
