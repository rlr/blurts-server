/* eslint-env browser */
/* eslint-disable no-unused-vars */
"use strict";
/* global ga */



const hasParent = (el, selector) => {
  while (el.parentNode) {
    el = el.parentNode;
    if (el.id === selector)
      return el;
  }
  return null;
};

const setMetricsIds = (el) => {
  if (hasParent(el, "scan-another-email")) {
    el.dataset.eventCategory = "Scan Another Email Form";
  }
  if (el.dataset.entrypoint && hasParent(el, "sign-up-banner")) {
    el.dataset.eventCategory = `${el.dataset.eventCategory} - Banner`;
    el.dataset.entrypoint = `${el.dataset.entrypoint}-banner`;
  }
  return;
};


function getLocation() {
  const eventLocation = document.querySelectorAll("[data-page-label]");
  if (eventLocation.length > 0) {
    return `Page ID: ${eventLocation[0].dataset.pageLabel}`;
  } else {
    return "Page ID: Undefined Page";
  }
}

async function sendPing(el, eventAction, eventLabel = null) {
  if (typeof(ga) !== "undefined" && !el.classList.contains("hide")) {
    if (!eventLabel) {
      eventLabel = `${getLocation()}`;
    }
    const eventCategory = `[v2] ${el.dataset.eventCategory}`;
    if (eventCategory.includes("Scan")) {
      // Append user status to eventLabel for scan form events.
      eventLabel = `${eventLabel} [Signed in user: ${document.body.dataset.signedInUser}]`;
    }
    return ga("send", "event", eventCategory, eventAction, eventLabel);
  }
}

function getFxaUtms(url) {
  const utmSource = encodeURIComponent(document.body.dataset.serverUrl.replace(/(^\w+:|^)\/\//g, ""));
  url.searchParams.append("utm_source", utmSource);
  url.searchParams.append("utm_campaign", document.body.dataset.utmCampaign);
  url.searchParams.append("form_type", "email");
  return url;
}

(() => {

  const setMetricsIds = (el) => {
    if (hasParent(el, "scan-another-email")) {
      el.dataset.eventCategory = "Scan Another Email Form";
    }
    if (el.dataset.entrypoint && hasParent(el, "sign-up-banner")) {
      el.dataset.eventCategory = `${el.dataset.eventCategory} - Banner`;
      el.dataset.entrypoint = `${el.dataset.entrypoint}-banner`;
    }
    return;
  };
  // Update data-event-category and data-fxa-entrypoint if the element
  // is nested inside a sign up banner.
  document.querySelectorAll("#scan-user-email, .open-oauth").forEach(el => {
    setMetricsIds(el);
  });


  document.querySelectorAll(".open-oauth").forEach( async(el) => {
    const fxaUrl = new URL("/metrics-flow?", document.body.dataset.fxaAddress);

    const response = await fetch(fxaUrl, {credentials: "omit"});

    fxaUrl.searchParams.append("entrypoint", encodeURIComponent(el.dataset.entrypoint));
    if (response.status === 200) {
      const {flowId, flowBeginTime} = await response.json();
      el.dataset.flowId = flowId;
      el.dataset.flowBeginTime = flowBeginTime;
    }
  });

  if (typeof(ga) !== "undefined") {
    const pageLocation = getLocation();

    // Elements for which we send Google Analytics "View" pings...
    const eventTriggers = [
      "#scan-user-email",
      "#add-another-email-form",
      ".scan-res .show-remaining-breaches",
      ".open-oauth",
    ];

    // Send number of foundBreaches on Scan, Full Report, and User Dashboard pageviews
    if (pageLocation === ("Scan Results")) {
      const breaches = document.querySelectorAll(".breach-card");
      ga("send", "event", "[v2] Breach Count", "Returned Breaches", `${pageLocation}`, breaches.length);
    }

    // Send "View" pings and add event listeners.
    document.querySelectorAll(eventTriggers).forEach(el => {
      sendPing(el, "View", pageLocation);
      if (["BUTTON", "A"].includes(el.tagName)) {
        el.addEventListener("click", async(e) => {
          await sendPing(el, "Engage", pageLocation);
        });
      }
    });

    // Add event listeners to event triggering elements
    // for which we do not send "View" pings.
    document.querySelectorAll("[data-ga-link]").forEach((el) => {
      el.addEventListener("click", async(e) => {
        const linkId = `Link ID: ${e.target.dataset.eventLabel}`;
        await sendPing(el, "Click", `${linkId} // ${pageLocation}`);
      });
    });
  }
})();


