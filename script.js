"use strict";

document.addEventListener("DOMContentLoaded", getTimelineJson);

let itemID = 0;
let fatalityIndex;

let headline;
let headlineApple;
let bloodStain;
let svgIndex = 0;

// ----- CHECKING IF TOUCH- OR MOUSE DEVICE -----

const touchDeviceClass = getTouchDeviceClass();

function getTouchDeviceClass() {
  return isTouchDeviceFunction()
    ? "touch_device_item"
    : "not_touch_device_item";
}

// Function that checks if the device is a touch device or not.
// bolmaster2, updated 2018.
// https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/19299994#19299994
function isTouchDeviceFunction() {
  var prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
  var mq = function(query) {
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

  // Fetch specific SVGs we need
  const headlineSVG = fetch("elements/Headline_name.svg").then(r => r.text());
  const appleSVG = fetch("elements/Apple_name.svg").then(r => r.text());
  const bloodStainSVG = fetch("elements/blood.svg").then(r => r.text());

  Promise
      .all([headlineSVG, appleSVG, bloodStainSVG])
      .then(
          function (responses) {
            const [headlineSVG, appleSVG, bloodStainSVG] = responses;
            headline = headlineSVG;
            headlineApple = appleSVG;
            bloodStain = bloodStainSVG;
          }
      );


  // Fetch names from elements-folder, based on first names in the json.
  deathArray.forEach(fatality => {
    const nameSVG = fetch(`elements/${fatality.firstname}_name.svg`).then(r =>
      r.text()
    );

    Promise.all([nameSVG]).then(function(responses) {
      const [nameSVG] = responses;
      fatality.namesvg = nameSVG;
      svgIndex++;
      if (svgIndex === deathArray.length) {
        start(deathArray);
      }
    });
  });
}

function start(deathArray) {

  document.querySelector(".headline").innerHTML = headline;
  document.querySelector(".apple").innerHTML = headlineApple;
  document.querySelector(".bloodstain_note").innerHTML = bloodStain;
  document.querySelector("#bloodstain").innerHTML = bloodStain;

  const musicButton = document.querySelector(".music");
  const music = document.querySelector("#l_theme");

    const musicOnButton = musicButton.querySelector(".music_on_button");
    const musicOffButton = musicButton.querySelector(".music_off_button");

  let musicIsPlaying = false;

  musicButton.addEventListener("click", function() {
    if (!musicIsPlaying) {
      music.play();
      musicIsPlaying = true;
        musicOnButton.style.display = "block";
        musicOffButton.style.display = "none";
    } else {
      music.pause();
      musicIsPlaying = false;
        musicOnButton.style.display = "none";
        musicOffButton.style.display = "block";
    }
  });

  showTimeline(deathArray, 0);
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

  const timelineTemplate = document
    .querySelector(".timeline_template")
    .content.cloneNode(true);

  itemID++;

  // Adding details to the item on the timeline.
  timelineTemplate
      .querySelector(".fatality_item_container")
      .setAttribute("timelineItemID", `${itemID}`);
  // timelineTemplate
  //   .querySelector(".infobox")
  //   .setAttribute("itemID", `${itemID}`);

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

  // Adding the whole item to the HTML using the template.
  document.querySelector(".book_timeline").appendChild(timelineTemplate);

  let idAttribute;

    document
      .querySelector(".book_timeline")
      .lastElementChild.addEventListener("click", displayInfobox);




  function displayInfobox() {

    const infoboxTemplate = document
        .querySelector(".infobox_template")
        .content.cloneNode(true);

    // Adding details to the infobox.
    infoboxTemplate.querySelector(
        ".infobox_image_container"
    ).innerHTML = `<img class="infobox_image" src="elements/${fatality.firstname}.svg"  alt="Image of character">`;
    infoboxTemplate.querySelector(".infobox_name").innerHTML = fatality.namesvg;
    infoboxTemplate.querySelector(".infobox_birth_date").innerHTML +=
        renderedBirthDate || fatality.birth || "Unknown";
    infoboxTemplate.querySelector(".infobox_death_date").innerHTML +=
        renderedDeathDate || fatality.death;
    infoboxTemplate.querySelector(".infobox_story").innerHTML += fatality.story;
    infoboxTemplate.querySelector(".infobox_death_cause").innerHTML +=
        fatality.causeofdeath;

    document.querySelector(".book_infobox").innerHTML = "";
    document.querySelector(".book_infobox").appendChild(infoboxTemplate);

  }

  // Adds +1 to the fatalityIndex, so the next person in the array will be used next.
  fatalityIndex++;

  // Sets timeout for the next person to appear on the page after x seconds.
  // We might be able to do this with an "animationend" listener instead, to be sure the first name is written
  // before the next starts appearing?
  if (deathArray.length > fatalityIndex) {
      showTimeline(deathArray, fatalityIndex);
  }

  else {
    observeTimeline();
  }
}

function observeTimeline() {
  // ----- INTERSECTION OBSERVER -----

// From slides, and edited for our use.
  const elms = document.querySelectorAll('.observe_this');

  const config = {
    root: null,
    rootMargin: '0px',
    threshold: [0, .25, .75, 1]
  };

  let observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.intersectionRatio > .75) {
        entry.target.classList.add('visible');
      }
    });
  }, config);

  elms.forEach(elem => {
    observer.observe(elem);
  });
}

document
  .querySelectorAll(".touch_closing_div").forEach(div => {
    div.addEventListener("click", hideAllInfoboxes);
});

function hideAllInfoboxes() {
  document.querySelectorAll(".infobox").forEach(infobox => {
    infobox.style.display = "none";
    document.querySelectorAll(".touch_closing_div").forEach(div => {
      div.style.display = "none";
    });
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
