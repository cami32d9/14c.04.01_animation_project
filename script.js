"use strict";

document.addEventListener("DOMContentLoaded", getJson);

let itemID = 0;
let nameSVG;
let svgIndex = 0;
let fatalityIndex;

async function getJson() {
    let pagesUrl =
        "https://mandalskeawebspace.dk/claude_php/clean_up_spreadsheet.php?id=1uLNO5Z7ghpMy283IND0YbnVHK-gW6VIGHrCk39T_DRo";
    let jsonData = await fetch(pagesUrl);
    const deathArray = await jsonData.json();
    fetchSVGs(deathArray);
}

function fetchSVGs(deathArray) {

    deathArray.forEach(fatality => {

        nameSVG = fetch(`elements/${fatality.firstname}_name.svg`).then(r => r.text());

        Promise
            .all([nameSVG])
            .then(
                function (responses) {
                    const [nameSVG] = responses;
                    fatality.namesvg = nameSVG;
                    svgIndex++;
                    if (svgIndex === deathArray.length) {
                        start(deathArray);
                    }
                }
            );
    });
}

function start(deathArray) {
    console.log(deathArray);
    showTimeline(deathArray, 0);
}

let fatality;

function showTimeline(deathArray, getFatalityIndex) {

    fatalityIndex = getFatalityIndex;

    const fatality = deathArray[fatalityIndex];

        const timelineTemplate = document
            .querySelector(".timeline_template")
            .content.cloneNode(true);
        fatality.name = `${fatality.firstname} ${fatality.lastname}`;
        itemID++;

        // template.querySelector(".timeline_icon").textContent = fatality.name;
        timelineTemplate
            .querySelector(".fatality_item")
            .setAttribute("timelineItemID", `${itemID}`);
        timelineTemplate
            .querySelector(".infobox")
            .setAttribute("itemID", `${itemID}`);
        timelineTemplate.querySelector(".timeline_name").innerHTML = fatality.namesvg;
        timelineTemplate.querySelector(".timeline_death_date").textContent =
            fatality.death;

        timelineTemplate.querySelector(
            ".infobox_image"
        ).src = `elements/${fatality.firstname}.svg`;
        timelineTemplate.querySelector(
            ".infobox_name"
        ).innerHTML = fatality.namesvg;
        timelineTemplate.querySelector(".infobox_birth_date").innerHTML +=
            fatality.birth || "Unknown";
        timelineTemplate.querySelector(".infobox_death_date").innerHTML +=
            fatality.death;
        timelineTemplate.querySelector(".infobox_story").innerHTML +=
            fatality.story;
        timelineTemplate.querySelector(".infobox_death_cause").innerHTML +=
            fatality.causeofdeath;

        document.querySelector(".book").appendChild(timelineTemplate);

        let idAttribute;

        document
            .querySelector(".book")
            .lastElementChild.addEventListener(
            "mouseover",
            function displayInfobox() {
                idAttribute = this.getAttribute("timelineItemID");
                document.querySelector(`[itemID="${idAttribute}"]`).style.display =
                    "block";
            }
        );
        document
            .querySelector(".book")
            .lastElementChild.addEventListener("mouseout", function hideInfobox() {
            document.querySelector(`[itemID="${idAttribute}"]`).style.display =
                "none";
        });

        fatalityIndex++;

        setTimeout(function() {
            showTimeline(deathArray, fatalityIndex)
        }, 2000)
}
