// const wingManMenu = document.createElement('div');
// wingManMenu.id = 'wingManMenu';
// document.body.appendChild(wingManMenu);
//
// const wingManIcon  = document.createElement('img');
// var imgURL = chrome.runtime.getURL("images/icon32.png");
// wingManIcon.id = 'wingManIcon';
// wingManIcon.src = imgURL;
// document.body.appendChild(wingManIcon);


// document.onmouseup = function() {
//   const highlightedText = window.getSelection().toString();
//
//   if (highlightedText.split(' ').length > 5 && !wingManMenu.innerText.includes(highlightedText)) {
//     displayIcon()
//   }
// };

// document.addEventListener('click', (event) => {
//
//   const highlightedText = window.getSelection().toString();
//
//   if (wingManIcon.style.display == 'block' && wingManIcon.contains(event.target)) {
//     displayWingManMenu()
//   }
//   else if (wingManMenu.style.display == 'block' && !wingManMenu.contains(event.target)) {
//     wingManMenu.style.display = 'none';
//   }
//
//
// });

// function displayIcon(){
//   const highlightedTextLocation = window.getSelection().getRangeAt(0).getBoundingClientRect();
//
//   wingManIcon.style.display = 'block';
//   wingManIcon.style.top = (highlightedTextLocation.top + window.scrollY - 35) + 'px';
//   wingManIcon.style.left = (highlightedTextLocation.left + (highlightedTextLocation.width / 2))  + 'px';
// }

function displayWingManMenu(){
  wingManMenu.style.display = 'block';
  wingManMenu.innerHTML = htmlResponse;
  wingManIcon.style.display = 'none';
}

function runRewriteSentence(text, tone, length){
  var rewriteResponse;
  chrome.runtime.sendMessage({ highlightedText: text, tone: tone, length: length  }, function(response) {
    rewriteResponse = buildRewriteResponse(response);
    displayWingManMenu(rewriteResponse)
  });
}
//need to activate app in order to avoid running anytime something is copied

function buildRewriteResponse(gptResponse){
  const response = parseGptResponse(gptResponse);
  const htmlResponse = htmlBuilder(response);
  return htmlResponse
}


function parseGptResponse(response){
  var sentences = response.split("\n");
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
  var str = '<ol>'

  responses.forEach(function(response) {
    str += '<li>'+ response + '</li>';
  });

  str += '</ol>';
  return str;
}
