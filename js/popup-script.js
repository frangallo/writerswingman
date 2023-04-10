/*
 * This file includes all scripts running while the extension
 * is active. It is currently only loaded on popup.html
 */

// Listen for clicks to the suggestions button
(function () {

  enableButtonActions()
  enableTextCounter();
  getWritersWingManResetRequestCount();

})();

function getWritersWingManResetRequestCount(){
  const suggestionButton = document.getElementById("suggestions-button");
  const counter = document.getElementById("request-counter");

  chrome.storage.local.get(['WritersWingManRemainingRequestCount'], function(data) {
    setRequestCounter(data.WritersWingManRemainingRequestCount);
    if(data.WritersWingManRemainingRequestCount <=0){
      triggerError(counter, suggestionButton)
    }
  });
}

function enableButtonActions(){
  const suggestionButton = document.getElementById("suggestions-button");


  suggestionButton.addEventListener("click", function () {
    runLoadingScreen();
    var formDetails = getFormDetais();
    runRewriteSentence(formDetails["text"],formDetails["formality"],formDetails["tone"], formDetails["length"])
  });
}

function enableTextCounter(){
  const textArea = document.getElementById("text-to-rewrite")

  textArea.addEventListener("input", function () {
    var text = document.getElementById("text-to-rewrite").value;
    var wordCounter = document.getElementById("word-counter");
    var button = document.getElementById("suggestions-button")
    var count = 0;
    var wordsAllowed = 100;


    var split = text.split(' ');
    for (var i = 0; i < split.length; i++) {
     if (split[i] != "") {
      count ++;
     }
    }

    if (count > 85){
      wordCounter.style.display = "block";
      document.getElementById("show-count").innerHTML = wordsAllowed - count;
    }


   if (count > 100) {
      triggerError(wordCounter, textArea, button)
      sentenceLengthError = true;
    }

    if (sentenceLengthError && count <= 100) {
      removeSentenceLengthError(wordCounter, textArea, button)
      sentenceLengthError = false;
    }

  }, true);
}

function triggerError(element, button){
  element.style.color = "red";
  button.disabled = true;
  button.style.cursor = "not-allowed";
  button.style.opacity = "40%";
}

function removeSentenceLengthError(element, textArea, button){
  element.style.color = "#000000";
  textArea.style.borderColor = "#084887";
  button.disabled = false;
  button.style.cursor = "pointer"
  button.style.opacity = "100%";
}

function checkRequiredFields(){
  //todo: make sure all the required fields are filled out
}

function storeSentenceToRewrite(){

}

function reduceRequestCount(){
  chrome.storage.local.get(['WritersWingManRemainingRequestCount'], function(data) {
    // if the action count is less than 10, increment the count and allow the action to proceed
      chrome.storage.local.set({ WritersWingManRemainingRequestCount: data.WritersWingManRemainingRequestCount - 1 });
  });
}

function setRequestCounter(requestsRemaining){
  var counter = document.getElementById("request-counter");
  counter.innerHTML = requestsRemaining + " Daily Rewrites Remaining"
}

function getFormDetais(){
  var textToRewrite = document.getElementById("text-to-rewrite").value.replace(/(\r\n|\n|\r)/gm, "");
  var formality = getRadioValue("formality");
  var tone = getRadioValue("tone");
  var length = getRadioValue("length");

  return {text: textToRewrite, formality: formality, tone: tone, length: length}
}

function runLoadingScreen(){
  const rewriteForm = document.getElementById("rewrite-form");
  const loader = document.getElementById("loading-screen");
  const toggleButton = document.getElementById("suggestions-button");
  const requestCounter = document.getElementById("request-counter");

  toggleButton.style.display = 'none';
  rewriteForm.style.display = 'none';
  requestCounter.style.display = 'none';
  loader.style.display = 'block';

}

function hideLoadingScreen(){
  const loader = document.getElementById("loading-screen");
  loader.style.display = 'none';

}

function getRadioValue(radioGroupName) {
    const radioValues = document.getElementsByName(radioGroupName);
    var radioValue;

    for(i = 0; i < radioValues.length; i++) {
        if(radioValues[i].checked){
          radioValue= radioValues[i].value;
        }
    }
    return radioValue;
}

function displaySuggestions(htmlResponse){
  const suggestionSection = document.getElementById("suggestion-section");
  const suggestions = document.getElementById("suggestions");
  hideLoadingScreen();
  suggestionSection.style.display = 'block';
  suggestions.innerHTML = htmlResponse;
  addClickListenerToIcos()
}

function runRewriteSentence(text, formality, tone, length){
  var suggestionsResponse;
  chrome.runtime.sendMessage({ highlightedText: text, formality: formality, tone: tone, length: length  }, function(response) {
    suggestionsResponse = buildSuggestions(response);
    displaySuggestions(suggestionsResponse)
    reduceRequestCount();
  });
}

function buildSuggestions(gptResponse){
  const suggestions = parseGptResponse(gptResponse);
  const html = htmlBuilder(suggestions);
  return html
}


function parseGptResponse(response){
  var sentences = response.substring(response.indexOf(":") + 2).split("\n");
  var cleanedSentences =[];

  for (var i = 0; i < sentences.length; i++) {
    if (sentences[i] != ""){
      if (!isNaN(sentences[i].charAt(0))) {
        sentences[i] = sentences[i].substring(3);
      }
      cleanedSentences.push(sentences[i])
    }
  }
  return cleanedSentences;
}

function htmlBuilder(responses){
  var str = "<ol class='suggestions-list'>"

  responses.forEach(function(response) {
    str += "<li class='suggestion'> <div class='suggestionResponse'> <div class='suggestionText'>" + response + "</div><i class='fa-solid fa-copy icon'></i><i class='fa-solid fa-check icon'></i></div></li>";
  });

  str += '</ol>';
  return str;
}

function addClickListenerToIcos(){
  var icons = document.getElementsByClassName("icon");
  for (var i = 0; i < icons.length; i++) {
      icons[i].addEventListener('click', function(event){
        navigator.clipboard.writeText(event.target.previousSibling.innerText);
        event.target.style.display = "none";
        event.target.nextSibling.style.cssText = 'display:inline !important';
      }, false);
  }

}

// document.addEventListener('click', (event) => {
//
//
// });
