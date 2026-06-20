class SessionState {
    constructor(session) {
        this.session = session;
    }
    stage() {
        throw new Error("Must implement stage()");
    }
    canSubmit(paper) { return false; }
    submit(paper) { throw new Error("Cannot submit papers at this stage"); }
    close() { throw new Error("Cannot close from the current stage."); }
    enterBid(paper, reviewer, interest) { throw new Error("Cannot enter bids from the current stage."); }
    submitReview(paper, reviewer, text, score) { throw new Error("Cannot review at this stage."); }
    selectArticles() { throw new Error("Cannot select articles at this stage"); }
}
module.exports = SessionState;
