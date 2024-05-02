module.exports = function getMultiverseId(cards, uuid) {
  const findCard = ({ uuid: cardUuid }) => cardUuid = uuid;
  const { identifiers: { multiverseId } } = cards.find(findCard);
  return multiverseId;
}
