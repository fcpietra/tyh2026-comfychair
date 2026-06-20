const SessionState = require('./SessionState');
const SessionStatesEnum = require('../Enums/SessionStatesEnum');
const { Bid } = require('../Bid');

class BiddingState extends SessionState {
    stage() {
        return SessionStatesEnum.BIDDING;
    }
    enterBid(paper, reviewer, interest) {
        if (this.session.bidExistsFor(paper, reviewer)) {
            let existing = this.session.bidFor(paper, reviewer);
            existing.setInterest(interest);
        } else {
            let bid = new Bid(paper, reviewer, interest);
            this.session.bids().push(bid);
        }
    }
    closeBidding() {
        this.session._assignReviewers();
        const RevisionState = require('./RevisionState');
        this.session._setStage(new RevisionState(this.session));
    }
}
module.exports = BiddingState;
