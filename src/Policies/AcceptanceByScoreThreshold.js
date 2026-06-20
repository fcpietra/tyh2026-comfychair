const AcceptancePolicy = require('./AcceptancePolicy');

class AcceptanceByScoreThreshold extends AcceptancePolicy {
    constructor(threshold) {
        super();
        this._threshold = threshold;
    }

    _selectFromSorted(sortedPapers) {
        return sortedPapers.filter(paper => paper.score() >= this._threshold);
    }
}
module.exports = AcceptanceByScoreThreshold;
