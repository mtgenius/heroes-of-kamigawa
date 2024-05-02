const getMultiverseId = require('./get-multiverse-id.js');
const IndexMap = require('./index-map.js');

/**
 * // set
 * [
 *   // boosters
 *   [
 *     [ booster weight, ( card count, sheet index )+ ],
 *     [ booster weight, ( card count, sheet index )+ ],
 *     [ booster weight, ( card count, sheet index )+ ],
 *     ...
 *   ],
 * 
 *   // sheets
 *   [
 *     [( weight, card index )+ ],
 *     [( weight, card index )+ ],
 *     [( weight, card index )+ ],
 *     ...
 *   ],
 * 
 *   // cards
 *   [
 *     multiverse ID | [front face multiverse ID, back face multiverse ID],
 *     multiverse ID | [front face multiverse ID, back face multiverse ID],
 *     multiverse ID | [front face multiverse ID, back face multiverse ID],
 *     ...
 *   ],
 * ]
 */

const BASE = 10;

module.exports = function mapSet({
  data: {
    cards: setCards,
    booster: {
      draft: {
        boosters,
        sheets,
      },
    },
  },
}) {
  const compressedBoosters = [];
  const compressedCards = [];
  const compressedSheets = [];

  const cardIndices = new IndexMap();
  const sheetIndices = new IndexMap();
  for (const { contents, weight: boosterWeight } of boosters) {
    const compressedBooster = [boosterWeight];
    for (const [sheet, cardCount] of Object.entries(contents)) {
      const sheetIndex = sheetIndices.get(sheet);
      compressedBooster.push(cardCount, sheetIndex);
    }
    compressedBoosters.push(compressedBooster);
  }

  for (const [sheet, { cards: sheetCards }] of Object.entries(sheets)) {
    const sheetIndex = sheetIndices.get(sheet);
    compressedSheets[sheetIndex] = [];
    for (const [card, cardWeight] of Object.entries(sheetCards)) {
      const cardIndex = cardIndices.get(card);
      compressedSheets[sheetIndex].push(cardWeight, cardIndex);
    }
  }

  for (const {
    otherFaceIds,
    uuid,
    identifiers: {
      multiverseId,
    },
  } of setCards) {
    // Back faces
    if (!cardIndices.has(uuid)) {
      continue;
    }

    const cardIndex = cardIndices.get(uuid);
    if (!Array.isArray(otherFaceIds)) {
      compressedCards[cardIndex] = parseInt(multiverseId, BASE);
      continue;
    }
    
    const [backUuid] = otherFaceIds;
    const backMultiverseId = getMultiverseId(setCards, backUuid);
    compressedCards[cardIndex] = [
      parseInt(multiverseId, BASE),
      parseInt(backMultiverseId, BASE),
    ];
  }

  return [
    compressedBoosters,
    compressedSheets,
    compressedCards,
  ];
}
