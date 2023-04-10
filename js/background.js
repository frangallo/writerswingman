
chrome.runtime.onInstalled.addListener(function() {
  // initialize the API call counter and last updated date
  chrome.storage.local.set({ WritersWingManRemainingRequestCount: 10, lastUpdatedDate: new Date().toLocaleDateString() });
  chrome.alarms.create("resetRequestCount", {
    when: new Date().setHours(24,0,0,0), // set the first alarm to fire at the next midnight
    periodInMinutes: 24 * 60 // set the alarm to repeat every 24 hours
  });

});


// set up a listener for when the alarm fires
chrome.alarms.onAlarm.addListener(function(alarm) {
  // if the alarm is the one we created earlier
  if (alarm.name === "resetRequestCount") {
    // set the local storage variable to 0
    chrome.storage.local.set({ WritersWingManRemainingRequestCount: 10 });
  }
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.highlightedText && request.tone && request.length) {
      queryGPT(request.highlightedText, request.formality, request.tone, request.length ).then((value) => {
        sendResponse(value);
      });
    }
    return true;
  }
);


async function queryGPT(text, formality, tone, length) {
  const API_ENDPOINT = "https://obscure-eyrie-44113.herokuapp.com/api/v1/rewrite?";
  const params = {
    text: text,
    formality: formality,
    tone: tone,
    length: length
  }

  const response = await fetch(API_ENDPOINT + new URLSearchParams(params))
  const json = await response.json();
  return json.content;
}
