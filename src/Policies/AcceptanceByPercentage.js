const AcceptancePolicy = require('./AcceptancePolicy');

class AcceptanceByPercentage extends AcceptancePolicy {
    constructor(percentage) {
        super();
        if (percentage < 0 || percentage > 100) throw new Error("Percentage must be between 0 and 100");
        this._percentage = percentage;
    }

    select(papers) {
        let sortedPapers = [...papers].sort(function (a, b) {
            return b.score() - a.score();
        });
        let maxAccepted = Math.floor(this._percentage / 100 * sortedPapers.length);
        return sortedPapers.slice(0, maxAccepted);
    }
}
module.exports = AcceptanceByPercentage;
