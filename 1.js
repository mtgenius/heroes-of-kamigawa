var JSON_VERSION = 1;

var SET_NAMES = {
  chk: 'Champions of Kamigawa',
  bok: 'Betrayers of Kamigawa',
  sok: 'Saviors of Kamigawa',
  neo: 'Kamigawa: Neon Dynasty',
};

var ACTIONS = document.getElementById('actions');
var BATTLEFIELD = [];
var BOOSTER_PILE = new Array();
var BOOSTER_PILE_SIZE = document.getElementById('booster-pile-size');
var BOOSTER_WEIGHT_INDEX = 0;
var BOOSTERS_INDEX = 0;
var CARDS_INDEX = 2;
var DRAWING = [];
var DRAWING_LI = document.getElementById('drawing');
var GRAVEYARD = [];
var HAND = [];
var SET_DATA = {};
var SHEETS_INDEX = 1;

var TOTAL_SHEET_WEIGHTS = {};
function getTotalSheetWeight(setId, sheetIndex) {
  if (typeof TOTAL_SHEET_WEIGHTS[setId] === 'undefined') {
    TOTAL_SHEET_WEIGHTS[setId] = [];
  }

  if (typeof TOTAL_SHEET_WEIGHTS[setId][sheetIndex] === 'number') {
    return TOTAL_SHEET_WEIGHTS[setId][sheetIndex];
  }

  var set = SET_DATA[setId];
  var sheets = set[SHEETS_INDEX];
  var sheet = sheets[sheetIndex];
  var totalWeight = 0;
  for (var i = 0; i < sheet.length; i += 2) {
    var weight = sheet[i];
    totalWeight += weight;
  }

  TOTAL_SHEET_WEIGHTS[setId][sheetIndex] = totalWeight;
  return totalWeight;
}

function getCardIndexFromSheet(setId, sheetIndex) {
  var set = SET_DATA[setId];
  var sheets = set[SHEETS_INDEX];
  var sheet = sheets[sheetIndex];
  var totalWeight = getTotalSheetWeight(setId, sheetIndex);
  var randomCard = Math.random() * totalWeight;
  for (var i = 0; i < sheet.length; i += 2) {
    var cardWeight = sheet[i];
    if (randomCard > cardWeight) {
      randomCard -= cardWeight;
      continue;
    }

    var cardIndex = sheet[i + 1];
    return cardIndex;
  }

  // Graceful degradation: return the first card index.
  return sheet[1];
}

function shuffle() {
  return Math.random() - 0.5;
}

var SRC_ORIGIN = 'https://gatherer.wizards.com';
function mapMultiverseIdToSrc(id) {
  return SRC_ORIGIN + '/Handlers/Image.ashx?multiverseid=' + id + '&type=card';
}

function mapCardToElement(card) {
  if (!Array.isArray(card)) {
    var img = document.createElement('img');
    img.className = 'card';
    img.setAttribute('src', mapMultiverseIdToSrc(card));
    return img;
  }

  // Dual-faced card
  var element = document.createElement('span');
  element.className = 'card dfc';
  var front = document.createElement('img');
  var back = document.createElement('img');
  front.setAttribute('src', mapMultiverseIdToSrc(card[0]));
  back.setAttribute('src', mapMultiverseIdToSrc(card[1]));
  element.appendChild(front);
  element.appendChild(back);
  return element;
}

function renderDrawing() {
  if (DRAWING.length === 0) {
    DRAWING_LI.style.setProperty('display', 'none');
    return;
  }

  DRAWING_LI.innerHTML = '<p>' +
    'Put ' + (DRAWING.length - 2) + ' of these cards into your hand.' +
  '</p>';
  const drawingDiv = document.createElement('div');
  for (var i = 0; i < DRAWING.length; i++) {
    var card = DRAWING[i];
    var element = mapCardToElement(card);
    function handleClick(thisI) {
      var thisMultiverseId = DRAWING.splice(thisI, 1)[0];
      HAND.push(thisMultiverseId);
      document.getElementById('hand-size').innerText = HAND.length;

      if (DRAWING.length < 3) {
        GRAVEYARD.push.apply(GRAVEYARD, DRAWING);
        DRAWING.splice(0, DRAWING.length);
        document.getElementById('graveyard-size').innerText = GRAVEYARD.length;
      }

      renderDrawing();
    }
    element.addEventListener('click', handleClick.bind(element, i));
    drawingDiv.appendChild(element);
  }
  DRAWING_LI.appendChild(drawingDiv);
  DRAWING_LI.style.setProperty('display', 'list-item');
}

function openBoosterPackByIndex(setId, boosterIndex) {
  var set = SET_DATA[setId];
  var boosters = set[BOOSTERS_INDEX];
  var booster = boosters[boosterIndex];
  var cards = set[CARDS_INDEX];

  // For each type of card in the booster pack,
  for (var i = 1; i < booster.length; i += 2) {
    var cardCount = booster[i];
    var sheetIndex = booster[i + 1];

    // For this many cards of this type,
    for (var j = 0; j < cardCount; j++) {
      var cardIndex = getCardIndexFromSheet(setId, sheetIndex);
      var card = cards[cardIndex];
      BOOSTER_PILE.push(card);
    }
  }

  BOOSTER_PILE.sort(shuffle);
  DRAWING.push(BOOSTER_PILE.pop());
  DRAWING.push(BOOSTER_PILE.pop());
  DRAWING.push(BOOSTER_PILE.pop());
  DRAWING.push(BOOSTER_PILE.pop());
  BOOSTER_PILE_SIZE.innerHTML = BOOSTER_PILE.length;
  renderDrawing();
}

var TOTAL_SET_ID_WEIGHT = {};
function mapSetIdToTotalWeight(setId) {
  if (typeof TOTAL_SET_ID_WEIGHT[setId] === 'number') {
    return TOTAL_SET_ID_WEIGHT[setId];
  }

  var set = SET_DATA[setId];
  var boosters = set[BOOSTERS_INDEX];
  var totalWeight = 0;
  for (var i = 0; i < boosters.length; i++) {
    var booster = boosters[i];
    var weight = booster[BOOSTER_WEIGHT_INDEX];
    totalWeight += weight;
  }

  TOTAL_SET_ID_WEIGHT[setId] = totalWeight;
  return totalWeight;
}

function openBoosterPackBySet(setId) {
  if (DRAWING.length > 0) {
    return;
  }

  var set = SET_DATA[setId];
  var boosters = set[BOOSTERS_INDEX];
  var totalWeight = mapSetIdToTotalWeight(setId);
  var randomBooster = Math.random() * totalWeight;
  for (var i = 0; i < boosters.length; i++) {
    var booster = boosters[i];
    var weight = booster[BOOSTER_WEIGHT_INDEX];
    if (randomBooster > weight) {
      randomBooster -= weight;
      continue;
    }

    openBoosterPackByIndex(setId, i);
    return;
  }

  // Graceful degradation: open the first booster pack.
  openBoosterPackByIndex(setId, 0);
}

function handleBoosterPackClick(setId, ev) {
  console.log(setId);
  ev.preventDefault();
  openBoosterPackBySet(setId);
}

fetch('./dist/' + JSON_VERSION + '.json')
  .then(function handleResponse(res) {
    return res.json();
  })
  .then(function handleJson(data) {
    var sets = Object.entries(SET_NAMES);

    for (var i = 0; i < sets.length; i++) {
      var set = sets[i];
      var setId = set[0];
      var setName = set[1];
      SET_DATA[setId] = data[setId];

      var li = document.createElement('li');
      var liA = document.createElement('a');
      liA.setAttribute('href', '#');
      var handleClick = handleBoosterPackClick.bind(null, setId);
      liA.addEventListener('click', handleClick);
      liA.innerHTML =
        'Open a <strong>' + setName + '</strong> booster pack.';
      li.appendChild(liA);
      ACTIONS.appendChild(li);
    }

    var hand = document.createElement('li');
    var handA = document.createElement('a');
    handA.setAttribute('href', '#');
    handA.innerHTML = 'Hand (<span id="hand-size">0</span>)';
    hand.appendChild(handA);
    ACTIONS.appendChild(hand);

    var battlefield = document.createElement('li');
    var battlefieldA = document.createElement('a');
    battlefieldA.setAttribute('href', '#');
    battlefieldA.innerHTML =
      'Battlefield (<span id="battlefield-size">0</span>)';
      battlefield.appendChild(battlefieldA);
    ACTIONS.appendChild(battlefield);

    var graveyard = document.createElement('li');
    var graveyardA = document.createElement('a');
    graveyardA.setAttribute('href', '#');
    graveyardA.innerHTML =
      'Graveyard (<span id="graveyard-size">0</span>)';
    graveyard.appendChild(graveyardA);
    ACTIONS.appendChild(graveyard);
  })
  .catch(function handleError(err) {
    var errorBanner = document.getElementById('error-banner');
    errorBanner.innerHTML =
      '<h2>Failed to load set data. Try reloading.</h2>' +
      '<p>' + err.message + '</p>';
    errorBanner.style.setProperty('display', 'block');
  });
