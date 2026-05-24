const { Bid, Interests } = require("./Bid");

const STAGES = {
    receiving: "Receiving",
    bidding: "Bidding",
    reviewing: "Reviewing",
    selection: "Selection"
}

class Session {
    constructor() {
        this._name = "";
        this._programCommittee = [];
        this._papers = [];
        this._bids = [];
        this._stage = STAGES.receiving;
        this._acceptancePercentage = 0;
        this._acceptedPapers = [];
    }
    name() {
        return this._name;
    };
    programCommittee() {
        return this._programCommittee;
    };
    reviewers() {
        return this._programCommittee;
    };
    addReviewer(user) {
        this._programCommittee.push(user);
    }
    canSubmit(paper) {
        if (this.stage() == STAGES.receiving)
            return paper.isValid();
        else
            return false;
    }
    submit(paper) {
        if (!this.canSubmit(paper)) throw new Error("Cannot submit invalid paper");

        if (this.stage() == STAGES.receiving)
            this._papers.push(paper);
        else
            throw new Error("Cannot submit papers at this stage");
    }
    submitReview(paper, reviewer, text, score) {
        if (this.stage() !== 'Reviewing')
            throw new Error("Cannot review at this stage.");

        //TODO: metodo para validar asignacion del paper al reviewer
        paper.addReview(reviewer, text, score);
    }
    papers(){
        return this._papers;
    }
    bids() {
        return this._bids;
    }
    stage() {
        return this._stage;
    }
    setStage(stage) {
        this._stage = stage;
    }
    closeSubmissions() {
        this.setStage(STAGES.bidding);
    }
    closeBidding(){
        if (this.stage() !== "Bidding")
            throw new Error("Can only close bidding from the Bidding stage.");
        this.setStage("Reviewing");
    }
    enterBid(paper, reviewer, interest){
        if (this.stage() == STAGES.bidding )
            if(this.bidExistsFor(paper, reviewer)){
                let existing =  this.bidFor(paper, reviewer);
                existing.setInterest(interest);
            }
            else {
                let bid = new Bid(paper, reviewer, interest);
                this._bids.push(bid);
            }
        else
            throw new Error("Cannot enter bids from the current stage.");
    }
    bidExistsFor(paper, reviewer) {
        return typeof (this.bidFor(paper, reviewer)) != "undefined";
    }
    bidFor(paper, reviewer) {
        return this._bids.find((suspect) => (suspect.paper() == paper) && (suspect.reviewer() == reviewer));
    }
    interestFor(paper, reviewer) {
        return this.bidFor(paper, reviewer).interest();
    }
    setAcceptancePercentage(percentage) {
        if (percentage < 0 || percentage > 100) throw new Error("Percentage must be between 0 and 100");
        this._acceptancePercentage = percentage;
    }
    acceptancePercentage() {
        return this._acceptancePercentage;
    }
    selectArticles() {
        if (this.stage() !== STAGES.selection)
            throw new Error("Cannot select articles at this stage");

        let sortedPapers = [...this._papers].sort(function (a, b) {
            return b.score() - a.score();
        });

        let maxAccepted = Math.floor(this._acceptancePercentage / 100 * this._papers.length);
        this._acceptedPapers = sortedPapers.slice(0, maxAccepted);
        return this._acceptedPapers;
    }
    acceptedPapers() {
        return this._acceptedPapers;
    }
}

module.exports = Session;
module.exports.STAGES = STAGES;