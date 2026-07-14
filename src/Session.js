const { Bid, Interests } = require("./Bid");
const ReceivingState = require("./States/ReceivingState");
const AcceptanceByPercentage = require("./Policies/AcceptanceByPercentage");

class Session {
    constructor() {
        this._name = "";
        this._programCommittee = [];
        this._papers = [];
        this._bids = [];
        this._state = new ReceivingState(this);
        this._acceptancePolicy = new AcceptanceByPercentage(0);
        this._acceptedPapers = [];
    }
    name() {
        return this._name;
    }
    programCommittee() {
        return this._programCommittee;
    }
    reviewers() {
        return this._programCommittee;
    }
    addReviewer(user) {
        this._programCommittee.push(user);
    }

    // Delegated to State
    canSubmit(paper) {
        return this._state.canSubmit(paper);
    }
    submit(paper) {
        this._state.submit(paper);
    }
    updateSubmission(oldPaper, newPaper) {
        this._state.updateSubmission(oldPaper, newPaper);
    }
    submitReview(paper, reviewer, text, score) {
        this._state.submitReview(paper, reviewer, text, score);
    }
    close() {
        this._state.close();
    }
    enterBid(paper, reviewer, interest) {
        this._state.enterBid(paper, reviewer, interest);
    }
    selectArticles() {
        this._acceptedPapers = this._state.selectArticles();
        return this._acceptedPapers;
    }

    // Accessors
    papers() {
        return this._papers;
    }
    bids() {
        return this._bids;
    }
    stage() {
        return this._state.stage();
    }
    _setStage(state) {
        this._state = state;
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

    _assignReviewers() {
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
    }

    _selectReviewersForPaper(paper, quotas, assignmentCounts) {
        const available = this._programCommittee.filter(function (reviewer) {
            const hasQuota = assignmentCounts.get(reviewer) < quotas.get(reviewer);
            const isAuthor = paper.authors && paper.authors().some(author => author.email === reviewer.email);
            const hasConflict = (this.bidExistsFor(paper, reviewer)
                && this.interestFor(paper, reviewer) === Interests.Conflict) || isAuthor;
            return hasQuota && !hasConflict;
        }.bind(this));
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

    setAcceptancePolicy(policy) {
        this._acceptancePolicy = policy;
    }
    acceptancePolicy() {
        return this._acceptancePolicy;
    }

    acceptedPapers() {
        return this._acceptedPapers;
    }
}

module.exports = Session;