export default class IdGenerator {

  idCache = {};

  constructor(elementRegistry) {
    this.elementRegistry = elementRegistry;
  }

  nextSuggested(prefix = 'id_') {
    if (!this.idCache.hasOwnProperty(prefix)) {
      this.idCache[prefix] = 1;
    } else {
      this.idCache[prefix]++;
    }
    return `${prefix}${this.idCache[prefix]}`;
  }

  next(prefix = 'id_') {
    let suggestedId;
    let idFound = false;

    while (!idFound) {
      suggestedId = this.nextSuggested(prefix);
      try {
        this.elementRegistry._validateId(suggestedId);
        idFound = true;
      } catch (err) {
        idFound = false;
      }
    }

    return suggestedId;
  }
}
