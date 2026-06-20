const SessionState = require('./SessionState');
const SessionStatesEnum = require('../Enums/SessionStatesEnum');

class RevisionState extends SessionState {
    stage() {
        return SessionStatesEnum.REVISION;
    }
    submitReview(paper, reviewer, text, score) {
        if (!this.session.assignmentsFor(paper).includes(reviewer))
            throw new Error("Reviewer is not assigned to this paper.");

        paper.addReview(reviewer, text, score);
    }
    close() {
        const allReviewed = this.session.papers().every(function (paper) {
            return paper.reviewsCount() === 3;
        });
        if (!allReviewed)
            throw new Error("All papers must have 3 reviews before closing reviewing.");

        const SelectionState = require('./SelectionState');
        this.session._setStage(new SelectionState(this.session));
    }
}
module.exports = RevisionState;
