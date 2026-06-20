class AcceptancePolicy {
    select(papers) {
        let sortedPapers = [...papers].sort(function (a, b) {
            return b.score() - a.score();
        });
        return this._selectFromSorted(sortedPapers);
    }

    _selectFromSorted(_sortedPapers) {
        throw new Error("Must implement _selectFromSorted()");
    }
}
module.exports = AcceptancePolicy;
