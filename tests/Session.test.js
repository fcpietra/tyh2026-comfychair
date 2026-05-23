const Session = require("../src/Session");
const User = require("../src/User");
const Paper = require("../src/Paper");
const {Bid, Interests} = require("../src/Bid");
const SessionStatesEnum = require("../src/Enums/SessionStatesEnum");

let newSession;
let asse;
let juan, julian, matias;
let paper01, paper02, paper03;

beforeEach( ()=> {
    newSession = new Session();
    asse = new Session();
    juan = new User("Juan Gardey", "LIFIA, UNLP", "jgardey@lifia.ar", "123");
    julian = new User("Julián Grigera", "LIFIA, UNLP", "jgrigera@lifia.ar", "123");
    matias = new User("Matias Urbieta", "LIFIA, UNLP", "murbieta@lifia.ar", "123");
    paper01 = new Paper("A new approach on something", [juan, julian], juan);
    paper02 = new Paper("Another approach on something else", [matias, julian], matias);
    paper03 = new Paper("Yet another approach on something", [juan, matias], juan);
});

describe("A new Session", () =>{
    it("should have an empty name", ()=> {
        expect(newSession.name()).toBe("");
    })

    it("should have an empty Program Committee", ()=>{
        expect(newSession.programCommittee()).toHaveLength(0);
    })
})

describe("A Session", ()=>{
    it("should be able to add PC members.", ()=>{
        asse.addReviewer(juan);
        expect(asse.reviewers()).toContain(juan);
        expect(asse.reviewers()).toHaveLength(1);
    })
    it("should allow paper submissions", ()=>{
        expect(asse.canSubmit(paper01)).toBe(true);
        asse.submit(paper01);
        expect(asse.papers()).toContain(paper01);
    })
})

describe("During the bidding process, a Session", ()=>{
    it("should receive bids", ()=>{
        asse.closeSubmissions();
        asse.enterBid(paper02, juan, Interests.Interested);
        expect(asse.bidExistsFor(paper02, juan)).toBe(true);
        expect(asse.interestFor(paper02, juan)).toBe(Interests.Interested);
    })
    it("should allow overriding bids", ()=>{
        asse.closeSubmissions();
        asse.enterBid(paper02, juan, Interests.Interested);
        const secondBid = () => {asse.enterBid(paper02, juan, Interests.Maybe)};
        expect(secondBid).not.toThrow();
        expect(asse.interestFor(paper02, juan)).toBe(Interests.Maybe);
        expect(asse.bids()).toHaveLength(1);
    })
    it("should not allow to receive submissions", ()=>{
        asse.closeSubmissions();
        expect(asse.canSubmit(paper01)).toBe(false);
    })
    it("should fail to receive submissions", ()=>{
        asse.closeSubmissions();
        let submission = ()=>{asse.submit(paper01)};
        expect(submission).toThrow();
    })
})

describe("When closing bidding, a Session", ()=>{
    it("should change stage to Revision", ()=>{
        asse.addReviewer(juan);
        asse.addReviewer(julian);
        asse.addReviewer(matias);
        asse.submit(paper01);
        asse.closeSubmissions();
        asse.closeBidding();
        expect(asse.stage()).toBe(SessionStatesEnum.REVISION);
    })

    it("should throw error if not in Bidding stage", ()=>{
        expect(function() { asse.closeBidding(); }).toThrow("Cannot close bidding from the current stage.");
    })

    it("should assign exactly 3 reviewers per paper", ()=>{
        const session = new Session();
        const reviewers = [];
        for (let i = 0; i < 6; i++) {
            const reviewer = new User("Reviewer " + i, "Univ", "r" + i + "@test.com", "pass");
            reviewers.push(reviewer);
            session.addReviewer(reviewer);
        }

        const papers = [];
        for (let i = 0; i < 4; i++) {
            const author = new User("Author " + i, "Univ", "a" + i + "@test.com", "pass");
            const paper = new Paper("Paper " + i, [author], author);
            papers.push(paper);
            session.submit(paper);
        }

        session.closeSubmissions();
        session.closeBidding();

        papers.forEach(function(paper) {
            expect(session.assignmentsFor(paper)).toHaveLength(3);
        });
    })

    it("should distribute quotas with remainder correctly (exact division)", ()=>{
        // 6 papers, 6 reviewers => 18 reviews, 18/6 = 3 each, remainder 0
        const session = new Session();
        const reviewers = [];
        for (let i = 0; i < 6; i++) {
            const reviewer = new User("Reviewer " + i, "Univ", "r" + i + "@test.com", "pass");
            reviewers.push(reviewer);
            session.addReviewer(reviewer);
        }

        const papers = [];
        for (let i = 0; i < 6; i++) {
            const author = new User("Author " + i, "Univ", "a" + i + "@test.com", "pass");
            const paper = new Paper("Paper " + i, [author], author);
            papers.push(paper);
            session.submit(paper);
        }

        session.closeSubmissions();
        session.closeBidding();

        // Each reviewer should have exactly 3 assignments
        const counts = new Map();
        reviewers.forEach(function(r) { counts.set(r, 0); });
        papers.forEach(function(paper) {
            session.assignmentsFor(paper).forEach(function(reviewer) {
                counts.set(reviewer, counts.get(reviewer) + 1);
            });
        });

        reviewers.forEach(function(reviewer) {
            expect(counts.get(reviewer)).toBe(3);
        });
    })

    it("should distribute quotas with remainder correctly (with remainder)", ()=>{
        // Enunciado example: 10 papers, 7 reviewers => 30 reviews
        // 30/7 = 4 base, remainder 2 => 2 reviewers do 5, 5 reviewers do 4
        const session = new Session();
        const reviewers = [];
        for (let i = 0; i < 7; i++) {
            const reviewer = new User("Reviewer " + i, "Univ", "r" + i + "@test.com", "pass");
            reviewers.push(reviewer);
            session.addReviewer(reviewer);
        }

        const papers = [];
        for (let i = 0; i < 10; i++) {
            const author = new User("Author " + i, "Univ", "a" + i + "@test.com", "pass");
            const paper = new Paper("Paper " + i, [author], author);
            papers.push(paper);
            session.submit(paper);
        }

        session.closeSubmissions();
        session.closeBidding();

        // Count assignments per reviewer
        const counts = new Map();
        reviewers.forEach(function(r) { counts.set(r, 0); });
        papers.forEach(function(paper) {
            session.assignmentsFor(paper).forEach(function(reviewer) {
                counts.set(reviewer, counts.get(reviewer) + 1);
            });
        });

        // Total reviews must equal 30
        let totalAssigned = 0;
        const countValues = [];
        reviewers.forEach(function(reviewer) {
            const c = counts.get(reviewer);
            countValues.push(c);
            totalAssigned += c;
        });
        expect(totalAssigned).toBe(30);

        // Each reviewer does at most ceil(30/7)=5 and at least floor(30/7)=4
        countValues.forEach(function(c) {
            expect(c).toBeGreaterThanOrEqual(4);
            expect(c).toBeLessThanOrEqual(5);
        });

        // Exactly 2 reviewers do 5 and 5 reviewers do 4
        const doingFive = countValues.filter(function(c) { return c === 5; }).length;
        const doingFour = countValues.filter(function(c) { return c === 4; }).length;
        expect(doingFive).toBe(2);
        expect(doingFour).toBe(5);

        // Each paper still has exactly 3
        papers.forEach(function(paper) {
            expect(session.assignmentsFor(paper)).toHaveLength(3);
        });
    })

    it("should prioritize Interested reviewers first", ()=>{
        // 2 papers, 4 reviewers => 6 reviews, 6/4 = 1 base, remainder 2
        // First 2 reviewers get quota 2, last 2 get quota 1
        // All have enough quota to be assigned to at least 1 paper
        const session = new Session();
        const rev1 = new User("Rev 1", "Univ", "r1@test.com", "pass");
        const rev2 = new User("Rev 2", "Univ", "r2@test.com", "pass");
        const rev3 = new User("Rev 3", "Univ", "r3@test.com", "pass");
        const rev4 = new User("Rev 4", "Univ", "r4@test.com", "pass");
        session.addReviewer(rev1);
        session.addReviewer(rev2);
        session.addReviewer(rev3);
        session.addReviewer(rev4);

        const author1 = new User("Author 1", "Univ", "author1@test.com", "pass");
        const author2 = new User("Author 2", "Univ", "author2@test.com", "pass");
        const paper1 = new Paper("Paper 1", [author1], author1);
        const paper2 = new Paper("Paper 2", [author2], author2);
        session.submit(paper1);
        session.submit(paper2);
        session.closeSubmissions();

        // For paper1: rev2, rev3, rev4 are interested; rev1 is not interested
        session.enterBid(paper1, rev1, Interests.NotInterested);
        session.enterBid(paper1, rev2, Interests.Interested);
        session.enterBid(paper1, rev3, Interests.Interested);
        session.enterBid(paper1, rev4, Interests.Interested);

        session.closeBidding();

        const assigned = session.assignmentsFor(paper1);
        expect(assigned).toHaveLength(3);
        // The 3 interested reviewers should be picked over the not-interested one
        expect(assigned).toContain(rev2);
        expect(assigned).toContain(rev3);
        expect(assigned).toContain(rev4);
        expect(assigned).not.toContain(rev1);
    })

    it("should fall back to Maybe when not enough Interested", ()=>{
        const session = new Session();
        const rev1 = new User("Rev 1", "Univ", "r1@test.com", "pass");
        const rev2 = new User("Rev 2", "Univ", "r2@test.com", "pass");
        const rev3 = new User("Rev 3", "Univ", "r3@test.com", "pass");
        const rev4 = new User("Rev 4", "Univ", "r4@test.com", "pass");
        session.addReviewer(rev1);
        session.addReviewer(rev2);
        session.addReviewer(rev3);
        session.addReviewer(rev4);

        const author = new User("Author", "Univ", "author@test.com", "pass");
        const paper = new Paper("Paper", [author], author);
        session.submit(paper);
        session.closeSubmissions();

        session.enterBid(paper, rev1, Interests.Interested);
        session.enterBid(paper, rev2, Interests.Maybe);
        session.enterBid(paper, rev3, Interests.Maybe);
        session.enterBid(paper, rev4, Interests.NotInterested);

        session.closeBidding();

        const assigned = session.assignmentsFor(paper);
        expect(assigned).toHaveLength(3);
        // Should pick: rev1 (Interested), rev2 (Maybe), rev3 (Maybe)
        expect(assigned).toContain(rev1);
        expect(assigned).toContain(rev2);
        expect(assigned).toContain(rev3);
        expect(assigned).not.toContain(rev4);
    })

    it("should fall back to reviewers with no bid before NotInterested", ()=>{
        const session = new Session();
        const rev1 = new User("Rev 1", "Univ", "r1@test.com", "pass");
        const rev2 = new User("Rev 2", "Univ", "r2@test.com", "pass");
        const rev3 = new User("Rev 3", "Univ", "r3@test.com", "pass");
        const rev4 = new User("Rev 4", "Univ", "r4@test.com", "pass");
        session.addReviewer(rev1);
        session.addReviewer(rev2);
        session.addReviewer(rev3);
        session.addReviewer(rev4);

        const author = new User("Author", "Univ", "author@test.com", "pass");
        const paper = new Paper("Paper", [author], author);
        session.submit(paper);
        session.closeSubmissions();

        // Only rev1 bids Interested, rev4 bids NotInterested
        // rev2 and rev3 have NO bid (default)
        session.enterBid(paper, rev1, Interests.Interested);
        session.enterBid(paper, rev4, Interests.NotInterested);

        session.closeBidding();

        const assigned = session.assignmentsFor(paper);
        expect(assigned).toHaveLength(3);
        // Priority: Interested > Maybe > NoBid > NotInterested
        // rev1 (Interested), then rev2 and rev3 (no bid) before rev4 (NotInterested)
        expect(assigned).toContain(rev1);
        expect(assigned).toContain(rev2);
        expect(assigned).toContain(rev3);
        expect(assigned).not.toContain(rev4);
    })

    it("should not allow bids after closing bidding", ()=>{
        asse.addReviewer(juan);
        asse.addReviewer(julian);
        asse.addReviewer(matias);
        asse.submit(paper01);
        asse.closeSubmissions();
        asse.closeBidding();
        expect(function() {
            asse.enterBid(paper01, juan, Interests.Interested);
        }).toThrow();
    })
})