module.exports = class IndexMap {
  _arr = [];
  _index = new Map();

  get(item) {
    const index = this._index.get(item);
    if (typeof index !== 'undefined') {
      return index;
    }

    const newIndex = this._arr.push(item) - 1;
    this._index.set(item, newIndex);
    return newIndex;
  }

  has(item) {
    return this._index.has(item);
  }
}
