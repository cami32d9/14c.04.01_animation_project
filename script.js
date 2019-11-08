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
        const template = document.querySelector(".timeline_template").content.cloneNode(true);

        template.querySelector(".timeline_name").textContent = fatality.name;

        document.querySelector(".book").appendChild(template);

    });
}
