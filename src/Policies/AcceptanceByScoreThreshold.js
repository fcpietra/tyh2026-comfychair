const AcceptancePolicy = require('./AcceptancePolicy');

class AcceptanceByScoreThreshold extends AcceptancePolicy {
    constructor(threshold) {
        super();
        this._threshold = threshold;
    }

    select(papers) {
        let sortedPapers = [...papers].sort(function (a, b) {
            return b.score() - a.score();
        });
        return sortedPapers.filter(paper => paper.score() >= this._threshold);
    }
}
module.exports = AcceptanceByScoreThreshold;
