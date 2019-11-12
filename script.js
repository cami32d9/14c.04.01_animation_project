"use strict";

document.addEventListener("DOMContentLoaded", getTimelineJson);

let itemID = 0;
let nameSVG;
let svgIndex = 0;
let fatalityIndex;


// ----- CHECKING IF TOUCH- OR MOUSE DEVICE -----

const touchDeviceClass = getTouchDeviceClass();

function getTouchDeviceClass() {
    return isTouchDeviceFunction() ? "touch_device_item" : "not_touch_device_item"
}

// Function that checks if the device is a touch device or not.
// bolmaster2, updated 2018.
// https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/19299994#19299994
function isTouchDeviceFunction() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function (query) {
        return window.matchMedia(query).matches;
    };

    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
    }

    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
}


// ----- FETCHING DATA -----

// Fetching the data for all deaths defined in a Google Spreadsheet.
async function getTimelineJson() {
    let pagesUrl =
        "https://mandalskeawebspace.dk/claude_php/clean_up_spreadsheet.php?id=1uLNO5Z7ghpMy283IND0YbnVHK-gW6VIGHrCk39T_DRo";
    let jsonData = await fetch(pagesUrl);
    const deathArray = await jsonData.json();
    fetchSVGs(deathArray);
}

// Fetching the necessary SVGs (currently only the animated names) for each person found in the json fetched before.
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
                        showTimeline(deathArray, 0);
                    }
                }
            );
    });
}

// Shows the timeline with the deathArray defined from the json, and the "fatalityIndex" - an index making sure the
// function loops over each person in the array. This method is chosen over forEach to be able to delay each line's
// appearance on the timeline with a setTimeout.
function showTimeline(deathArray, getFatalityIndex) {

    fatalityIndex = getFatalityIndex;

    const fatality = deathArray[fatalityIndex];

    const timelineTemplate = document
        .querySelector(".timeline_template")
        .content.cloneNode(true);

    itemID++;


    // Adding details to the item on the timeline.
    timelineTemplate
        .querySelector(".fatality_item")
        .setAttribute("timelineItemID", `${itemID}`);
    timelineTemplate
        .querySelector(".infobox")
        .setAttribute("itemID", `${itemID}`);

    timelineTemplate.querySelector(".fatality_item").classList.add(touchDeviceClass);
    timelineTemplate.querySelector(".timeline_icon").src = `elements/${fatality.deathcategory}.svg`;
    timelineTemplate.querySelector(".timeline_name").innerHTML = fatality.namesvg;
    timelineTemplate.querySelector(".timeline_death_date").textContent =
        fatality.death;

    // Adding details to the infobox.
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

    // Adding the whole item to the HTML using the template.
    document.querySelector(".book").appendChild(timelineTemplate);

    let idAttribute;

    // Adds hover function to devices that have a mouse pointer/is not touch.
    if (!isTouchDeviceFunction()) {
        document
            .querySelector(".book")
            .lastElementChild.addEventListener(
            "mouseover",
            displayInfobox);

        document
            .querySelector(".book")
            .lastElementChild.addEventListener("mouseout", hideInfobox);
    }

    else {
        document
            .querySelector(".book")
            .lastElementChild.addEventListener(
            "click",
            displayInfobox);
    }

    function displayInfobox() {
        idAttribute = this.getAttribute("timelineItemID");
        document.querySelector(`[itemID="${idAttribute}"]`).style.display =
            "block";
    }

    function hideInfobox() {
        document.querySelector(`[itemID="${idAttribute}"]`).style.display =
            "none";
    }

    // Adds +1 to the fatalityIndex, so the next person in the array will be used next.
    fatalityIndex++;

    // Sets timeout for the next person to appear on the page after x seconds.
    // We might be able to do this with an "animationend" listener instead, to be sure the first name is written
    // before the next starts appearing?
    setTimeout(function () {
        showTimeline(deathArray, fatalityIndex)
    }, 200)
}
