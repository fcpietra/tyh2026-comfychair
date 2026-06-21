const SessionState = require('./SessionState');
const SessionStatesEnum = require('../Enums/SessionStatesEnum');

class ReceivingState extends SessionState {
    stage() {
        return SessionStatesEnum.RECEIVING;
    }
    canSubmit(paper) {
        return paper.isValid();
    }
    submit(paper) {
        if (!this.canSubmit(paper)) throw new Error("Cannot submit invalid paper");
        this.session.papers().push(paper);
    }
    updateSubmission(oldPaper, newPaper) {
        const papers = this.session.papers();
        const index = papers.indexOf(oldPaper);
        if (index === -1) {
            throw new Error("Paper was not previously submitted");
        }
        if (!this.canSubmit(newPaper)) {
            throw new Error("Cannot submit invalid paper");
        }
        papers[index] = newPaper;
    }
    close() {
        const BiddingState = require('./BiddingState');
        this.session._setStage(new BiddingState(this.session));
    }
}
module.exports = ReceivingState;
