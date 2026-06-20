const AcceptancePolicy = require('./AcceptancePolicy');

class AcceptanceByCount extends AcceptancePolicy {
    constructor(count) {
        super();
        if (count < 0) throw new Error("Count must be positive");
        this._count = count;
    }

    select(papers) {
        let sortedPapers = [...papers].sort(function (a, b) {
            return b.score() - a.score();
        });
        return sortedPapers.slice(0, this._count);
    }
}
module.exports = AcceptanceByCount;
