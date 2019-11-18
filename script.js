"use strict";

document.addEventListener("DOMContentLoaded", getTimelineJson);

let itemID = 0;
let nameSVG;
let svgIndex = 0;
let fatalityIndex;

// ----- CHECKING IF TOUCH- OR MOUSE DEVICE -----

const touchDeviceClass = getTouchDeviceClass();

function getTouchDeviceClass() {
    return isTouchDeviceFunction()
        ? "touch_device_item"
        : "not_touch_device_item";
}

function playAudio(url) {
    var a = new Audio(url);
    a.play();
}

// Function that checks if the device is a touch device or not.
// bolmaster2, updated 2018.
// https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/19299994#19299994
function isTouchDeviceFunction() {
    var prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
    var mq = function (query) {
        return window.matchMedia(query).matches;
    };

    if (
        "ontouchstart" in window ||
        (window.DocumentTouch && document instanceof DocumentTouch)
    ) {
        return true;
    }

    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    var query = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join("");
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
        nameSVG = fetch(`elements/${fatality.firstname}_name.svg`).then(r =>
            r.text()
        );

        Promise.all([nameSVG]).then(function (responses) {
            const [nameSVG] = responses;
            fatality.namesvg = nameSVG;
            svgIndex++;
            if (svgIndex === deathArray.length) {
                showTimeline(deathArray, 0);
            }
        });
    });
}

// Shows the timeline with the deathArray defined from the json, and the "fatalityIndex" - an index making sure the
// function loops over each person in the array. This method is chosen over forEach to be able to delay each line's
// appearance on the timeline with a setTimeout.
function showTimeline(deathArray, getFatalityIndex) {
    fatalityIndex = getFatalityIndex;

    const fatality = deathArray[fatalityIndex];

    let daysBetweenDeaths = calculateTimelineGap(deathArray, fatalityIndex);

    renderDate(fatality.death);

    let renderedBirthDate = renderDate(fatality.birth);
    let renderedDeathDate = renderDate(fatality.death);

    // console.log(renderedBirthDate);
    // console.log(renderedDeathDate);

    const timelineTemplate = document
        .querySelector(".timeline_template")
        .content.cloneNode(true);

    itemID++;

    // Adding details to the item on the timeline.
    timelineTemplate
        .querySelector(".fatality_item_container")
        .setAttribute("timelineItemID", `${itemID}`);
    timelineTemplate
        .querySelector(".infobox")
        .setAttribute("itemID", `${itemID}`);

    timelineTemplate
        .querySelector(".fatality_item")
        .classList.add(touchDeviceClass);
    timelineTemplate.querySelector(
        ".timeline_icon"
    ).src = `elements/${fatality.deathcategory}.svg`;
    timelineTemplate.querySelector(".timeline_name").innerHTML = fatality.namesvg;
    timelineTemplate.querySelector(".timeline_death_date").textContent =
        renderedDeathDate || fatality.death;

    if (daysBetweenDeaths > 0) {
        timelineTemplate.querySelector(".timeline_line").style.width = "4px";

        let lineLength = Math.round(daysBetweenDeaths + 10);

        timelineTemplate.querySelector(
            ".timeline_line_container"
        ).style.height = `${lineLength}px`;
    }

    // Adding details to the infobox.
    timelineTemplate.querySelector(
        ".infobox_image"
    ).src = `elements/${fatality.firstname}.svg`;
    timelineTemplate.querySelector(".infobox_name").innerHTML = fatality.namesvg;
    timelineTemplate.querySelector(".infobox_birth_date").innerHTML +=
        renderedBirthDate || fatality.birth || "Unknown";
    timelineTemplate.querySelector(".infobox_death_date").innerHTML +=
        renderedDeathDate || fatality.death;
    timelineTemplate.querySelector(".infobox_story").innerHTML += fatality.story;
    timelineTemplate.querySelector(".infobox_death_cause").innerHTML +=
        fatality.causeofdeath;

    timelineTemplate
        .querySelector(".infobox_name")
        .addEventListener("animationend", function () {
        });

    // Adding the whole item to the HTML using the template.
    document.querySelector(".book").appendChild(timelineTemplate);

    let idAttribute;

    // Adds hover function to devices that have a mouse pointer/is not touch.
    if (!isTouchDeviceFunction()) {
        document
            .querySelector(".book")
            .lastElementChild.addEventListener("mouseover", displayInfobox);
    } else {
        document
            .querySelector(".book")
            .lastElementChild.addEventListener("click", displayInfobox);
    }

    function displayInfobox() {
        hideAllInfoboxes();
        document.querySelector(".touch_closing_div").style.display = "block";
        idAttribute = this.getAttribute("timelineItemID");
        document.querySelector(`[itemID="${idAttribute}"]`).style.display = "block";
        document.querySelector("body").classList.add("mobile_hide_overflow");
    }

    // Adds +1 to the fatalityIndex, so the next person in the array will be used next.
    fatalityIndex++;

    // Sets timeout for the next person to appear on the page after x seconds.
    // We might be able to do this with an "animationend" listener instead, to be sure the first name is written
    // before the next starts appearing?
    if (deathArray.length > fatalityIndex) {
        setTimeout(function () {
            showTimeline(deathArray, fatalityIndex);
        }, 2000);
    }
}

document
    .querySelector(".touch_closing_div")
    .addEventListener("click", hideAllInfoboxes);

function hideAllInfoboxes() {
    document.querySelectorAll(".infobox").forEach(infobox => {
        infobox.style.display = "none";
        document.querySelector(".touch_closing_div").style.display = "none";
        document.querySelector("body").classList.remove("mobile_hide_overflow");
    });
}

function calculateTimelineGap(deathArray, thisFatalityIndex) {
    let daysBetweenDeaths;
    let thisFatality = deathArray[thisFatalityIndex];
    let nextFatality = deathArray[thisFatalityIndex + 1];

    let thisFatalityDeath = new Date(thisFatality.death);


    if (nextFatality) {
        let nextFatalityDeath = new Date(nextFatality.death);
        daysBetweenDeaths = Math.round(
            (nextFatalityDeath - thisFatalityDeath) / (1000 * 3600 * 24)
        );
    }

    if (daysBetweenDeaths > 150 && daysBetweenDeaths < 1000) {
        daysBetweenDeaths = Math.round(daysBetweenDeaths / 1.5);
    }

    if (daysBetweenDeaths > 1000) {
        daysBetweenDeaths = Math.round(daysBetweenDeaths / 4);
    }

    return daysBetweenDeaths || 0;
}

// Renders the dates, so it is dd/mm/yy, instead of yy/mm/dd, which is the required format for JS to work with it.
function renderDate(givenDate) {

    let thisDate = new Date(givenDate);

    // Only gives an output if the date is valid, so "invalid" dates will keep original text string or stay empty.
    if (thisDate != "Invalid Date") {

      // "month" is added +1, because JS starts the months at 0 for January, instead of 1 for January.
        let year = thisDate.getFullYear();
        let month = leadingZero(thisDate.getMonth() + 1);
        let day = leadingZero(thisDate.getDate());

        return day + "/" + month + "/" + year;
    }
}

// Adds leading zeros to the date or month, so it will always have two numbers instead of one
// (i.e. 05 instead of 5 for May). It adds a 0 before the number no matter what, but then only returns
// the last two numbers (i.e. for December, it creates 012, but only returns 12).
function leadingZero(number) {
  return ("0" + number).slice(-2);
}