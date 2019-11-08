"use strict";

document.addEventListener("DOMContentLoaded", getJson);

let itemID = 0;

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

        itemID++;

        // template.querySelector(".timeline_icon").textContent = fatality.name;
        timelineTemplate.querySelector(".fatality_item").setAttribute("timelineItemID", `${itemID}`);
        timelineTemplate.querySelector(".infobox").setAttribute("itemID", `${itemID}`);
        timelineTemplate.querySelector(".timeline_name").textContent = fatality.name;
        timelineTemplate.querySelector(".timeline_death_date").textContent = fatality.death;

        timelineTemplate.querySelector(".infobox_name").textContent = fatality.name;
        timelineTemplate.querySelector(".infobox").id = fatality.name;
        timelineTemplate.querySelector(".infobox_birth_date").textContent = fatality.birth;
        timelineTemplate.querySelector(".infobox_death_date").textContent = fatality.death;
        timelineTemplate.querySelector(".infobox_story").textContent = fatality.story;
        timelineTemplate.querySelector(".infobox_death_cause").textContent = fatality.causeofdeath;

        document.querySelector(".book").appendChild(timelineTemplate);

        let idAttribute;

        document.querySelector(".book").lastElementChild.addEventListener("mouseover", function() {
            idAttribute = this.getAttribute("timelineItemID");
            openPopup(idAttribute);
            }
        );
        document.querySelector(".book").lastElementChild.addEventListener("mouseout", function() {
            closePopup(idAttribute);
        });

        function openPopup(idAttribute) {
            document.querySelector(`[itemID="${idAttribute}"]`).style.display = "block";
        }

        function closePopup(idAttribute) {
            document.querySelector(`[itemID="${idAttribute}"]`).style.display = "none";
        }

    });

}
