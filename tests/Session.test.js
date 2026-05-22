const Session = require("../src/Session");
const User = require("../src/User");
const Paper = require("../src/Paper");
const {Bid, Interests} = require("../src/Bid");

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

describe("During the reviewing process, a Session", ()=>{
    beforeEach(()=>{
        asse.submit(paper01);
        asse.closeSubmissions();
        asse.closeBidding();
    })

    it("should accept a review on an assigned paper", ()=>{
        asse.submitReview(paper01, julian, "Solid contribution", 2);
        expect(paper01.reviews()).toHaveLength(1);
        expect(paper01.score()).toBe(2);
    })

    it("should reject reviews when not in Reviewing stage", ()=>{
        const newSession = new Session();
        newSession.submit(paper02);
        let earlyReview = ()=>{newSession.submitReview(paper02, julian, "ok", 1)};
        expect(earlyReview).toThrow("Cannot review at this stage.");
    })

    it("should reject a fourth review on the same paper", ()=>{
        asse.submitReview(paper01, juan, "ok", 1);
        asse.submitReview(paper01, julian, "ok", 2);
        asse.submitReview(paper01, matias, "ok", 3);
        let fourth = ()=>{asse.submitReview(paper01, julian, "extra", 0)};
        expect(fourth).toThrow("Cannot allow any more reviews");
    })

    it("should reject reviews with invalid score", ()=>{
        let invalidScore = ()=>{asse.submitReview(paper01, julian, "ok", 5)};
        expect(invalidScore).toThrow("Score is out of range");
    })

    it.todo("should reject a review from a reviewer not assigned to the paper")
})