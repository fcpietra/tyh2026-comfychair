const { Bid, Interests } = require("./Bid");
const SessionStatesEnum = require("./Enums/SessionStatesEnum");

class Session {
    constructor() {
        this._name = "";
        this._programCommittee = [];
        this._papers = [];
        this._bids = [];
        this._assignments = new Map();
        this._stage = SessionStatesEnum.RECEIVING;
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
        if (this.stage() == SessionStatesEnum.RECEIVING)
            return paper.isValid();
        else
            return false;
    }
    submit(paper) {
        if (!this.canSubmit(paper)) throw new Error("Cannot submit invalid paper");

        if (this.stage() == SessionStatesEnum.RECEIVING)
            this._papers.push(paper);
        else
            throw new Error("Cannot submit papers at this stage");
    }
    papers() {
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
        this.setStage(SessionStatesEnum.BIDDING);
    }
    enterBid(paper, reviewer, interest) {
        if (this.stage() == SessionStatesEnum.BIDDING)
            if (this.bidExistsFor(paper, reviewer)) {
                let existing = this.bidFor(paper, reviewer);
                existing.setInterest(interest);
            }
            else {
                let bid = new Bid(paper, reviewer, interest);
                this._bids.push(bid);
            }
        else
            throw new Error("Cannot enter bids from the current stage.");
    }
    closeBidding() {
        if (this.stage() != SessionStatesEnum.BIDDING)
            throw new Error("Cannot close bidding from the current stage.");

        const totalPapers = this.papers().length;
        const totalReviewers = this.reviewers().length;
        const totalReviews = totalPapers * 3;
        const base = Math.floor(totalReviews / totalReviewers);
        const remainder = totalReviews % totalReviewers;

        //Calcula la cantidad de revisiones por revisor
        const quotas = new Map();
        this._programCommittee.forEach(function (reviewer, index) {
            quotas.set(reviewer, index < remainder ? base + 1 : base);
        });

        //Asigna revisiones
        this._assignments = new Map();
        const assignmentCounts = new Map();
        //Inicializa el contador de revisiones
        this._programCommittee.forEach(function (reviewer) {
            assignmentCounts.set(reviewer, 0);
        });

        //Asigna revisiones
        this._papers.forEach(function (paper) {
            const assigned = this._selectReviewersForPaper(paper, quotas, assignmentCounts);
            this._assignments.set(paper, assigned);

            //Incrementa el contador de revisiones
            assigned.forEach(function (reviewer) {
                assignmentCounts.set(reviewer, assignmentCounts.get(reviewer) + 1);
            });
        }.bind(this));

        this.setStage(SessionStatesEnum.REVISION);
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
    assignments() {
        return this._assignments;
    }
    assignmentsFor(paper) {
        return this._assignments.get(paper) || [];
    }
    _selectReviewersForPaper(paper, quotas, assignmentCounts) {
        const available = this._programCommittee.filter(function (reviewer) {
            return assignmentCounts.get(reviewer) < quotas.get(reviewer);
        });
        const interested = [];
        const maybe = [];
        const noBid = [];
        const notInterested = [];
        available.forEach(function (reviewer) {
            //Revisa cada revisor disponible y lo clasifica según su interés
            if (this.bidExistsFor(paper, reviewer)) {
                const interest = this.interestFor(paper, reviewer);
                if (interest === Interests.Interested) interested.push(reviewer);
                else if (interest === Interests.Maybe) maybe.push(reviewer);
                else if (interest === Interests.NotInterested) notInterested.push(reviewer);
            } else {
                noBid.push(reviewer);
            }
        }.bind(this));

        // Within each category, prioritize reviewers with more remaining quota
        function byRemainingQuota(a, b) {
            const remainingA = quotas.get(a) - assignmentCounts.get(a);
            const remainingB = quotas.get(b) - assignmentCounts.get(b);
            return remainingB - remainingA;
        }
        interested.sort(byRemainingQuota);
        maybe.sort(byRemainingQuota);
        noBid.sort(byRemainingQuota);
        notInterested.sort(byRemainingQuota);

        const prioritized = interested.concat(maybe).concat(noBid).concat(notInterested);
        return prioritized.slice(0, 3);
    }

}

module.exports = Session;