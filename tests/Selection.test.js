const Session = require("../src/Session");
const User = require("../src/User");
const Paper = require("../src/Paper");

let session;
let reviewer1, reviewer2, reviewer3;
let papers;

function createPaperWithScore(title, author, reviewers, scores) {
    let paper = new Paper(title, [author], author);
    scores.forEach(function (score, index) {
        paper.addReview(reviewers[index], "Review text", score);
    });
    return paper;
}

function setupSessionWithPapers(paperList, acceptancePercentage) {
    session = new Session();
    paperList.forEach(function (paper) {
        session.submit(paper);
    });
    session.setAcceptancePercentage(acceptancePercentage);
    session.setStage("Selection");
}

beforeEach(function () {
    reviewer1 = new User("Reviewer One", "UNLP", "r1@unlp.edu", "123");
    reviewer2 = new User("Reviewer Two", "UNLP", "r2@unlp.edu", "123");
    reviewer3 = new User("Reviewer Three", "UNLP", "r3@unlp.edu", "123");
});

describe("Article selection - exact limit", function () {
    it("Should accept exactly 30% of 10 papers (3 papers)", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let paperList = [];
        for (let i = 0; i < 10; i++) {
            let paper = createPaperWithScore("Paper " + (i + 1), author, [reviewer1, reviewer2, reviewer3], [i - 4, i - 3, i - 5]);
            paperList.push(paper);
        }
        setupSessionWithPapers(paperList, 30);

        let accepted = session.selectArticles();

        expect(accepted).toHaveLength(3);
    });

    it("Should accept papers with the highest scores", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let paperHigh = createPaperWithScore("High Score", author, [reviewer1, reviewer2, reviewer3], [3, 3, 3]);
        let paperMid = createPaperWithScore("Mid Score", author, [reviewer1, reviewer2, reviewer3], [1, 1, 1]);
        let paperLow = createPaperWithScore("Low Score", author, [reviewer1, reviewer2, reviewer3], [-2, -2, -2]);
        let paperVeryLow = createPaperWithScore("Very Low", author, [reviewer1, reviewer2, reviewer3], [-3, -3, -3]);

        setupSessionWithPapers([paperLow, paperHigh, paperVeryLow, paperMid], 50);

        let accepted = session.selectArticles();

        expect(accepted).toHaveLength(2);
        expect(accepted[0]).toBe(paperHigh);
        expect(accepted[1]).toBe(paperMid);
    });
});

describe("Article selection - rounding", function () {
    it("Should round down when the percentage does not produce a whole number", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = createPaperWithScore("P1", author, [reviewer1, reviewer2, reviewer3], [3, 3, 3]);
        let p2 = createPaperWithScore("P2", author, [reviewer1, reviewer2, reviewer3], [2, 2, 2]);
        let p3 = createPaperWithScore("P3", author, [reviewer1, reviewer2, reviewer3], [1, 1, 1]);

        // 3 papers, 50% → floor(1.5) = 1
        setupSessionWithPapers([p1, p2, p3], 50);

        let accepted = session.selectArticles();

        expect(accepted).toHaveLength(1);
        expect(accepted[0]).toBe(p1);
    });

    it("Should round down with 7 papers and 40%", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let paperList = [];
        for (let i = 0; i < 7; i++) {
            let paper = createPaperWithScore("Paper " + (i + 1), author, [reviewer1, reviewer2, reviewer3], [i, i, i]);
            paperList.push(paper);
        }
        // 7 papers, 40% → floor(2.8) = 2
        setupSessionWithPapers(paperList, 40);

        let accepted = session.selectArticles();

        expect(accepted).toHaveLength(2);
    });
});

describe("Article selection - score ties", function () {
    it("Should accept papers even when there are ties at the cutoff", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = createPaperWithScore("P1", author, [reviewer1, reviewer2, reviewer3], [3, 3, 3]);
        let p2 = createPaperWithScore("P2", author, [reviewer1, reviewer2, reviewer3], [2, 2, 2]);
        let p3 = createPaperWithScore("P3", author, [reviewer1, reviewer2, reviewer3], [2, 2, 2]);
        let p4 = createPaperWithScore("P4", author, [reviewer1, reviewer2, reviewer3], [0, 0, 0]);

        // 4 articles, 50% → 2 accepted. p2 and p3 have the same score
        setupSessionWithPapers([p1, p2, p3, p4], 50);

        let accepted = session.selectArticles();

        expect(accepted).toHaveLength(2);
        expect(accepted[0]).toBe(p1);
        // one of the papers with score 2 is accepted
        expect(accepted[1].score()).toBe(2);
    });

    it("Should accept the correct number of papers even when all papers have the same score", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = createPaperWithScore("P1", author, [reviewer1, reviewer2, reviewer3], [1, 1, 1]);
        let p2 = createPaperWithScore("P2", author, [reviewer1, reviewer2, reviewer3], [1, 1, 1]);
        let p3 = createPaperWithScore("P3", author, [reviewer1, reviewer2, reviewer3], [1, 1, 1]);
        let p4 = createPaperWithScore("P4", author, [reviewer1, reviewer2, reviewer3], [1, 1, 1]);

        setupSessionWithPapers([p1, p2, p3, p4], 50);

        let accepted = session.selectArticles();

        expect(accepted).toHaveLength(2);
    });
});

describe("Article selection - 0 and 100 percentage", function () {
    it("Should accept no papers with 0% acceptance", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = createPaperWithScore("P1", author, [reviewer1, reviewer2, reviewer3], [3, 3, 3]);
        let p2 = createPaperWithScore("P2", author, [reviewer1, reviewer2, reviewer3], [2, 2, 2]);

        setupSessionWithPapers([p1, p2], 0);

        let accepted = session.selectArticles();

        expect(accepted).toHaveLength(0);
    });

    it("Should accept all papers with 100% acceptance", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = createPaperWithScore("P1", author, [reviewer1, reviewer2, reviewer3], [3, 3, 3]);
        let p2 = createPaperWithScore("P2", author, [reviewer1, reviewer2, reviewer3], [1, 1, 1]);
        let p3 = createPaperWithScore("P3", author, [reviewer1, reviewer2, reviewer3], [-1, -1, -1]);

        setupSessionWithPapers([p1, p2, p3], 100);

        let accepted = session.selectArticles();

        expect(accepted).toHaveLength(3);
        expect(accepted[0]).toBe(p1);
        expect(accepted[1]).toBe(p2);
        expect(accepted[2]).toBe(p3);
    });
});

describe("Article selection - stage validation", function () {
    it("Should throw an error when selecting outside the selection stage", function () {
        session = new Session();
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = new Paper("P1", [author], author);
        session.submit(p1);

        let selection = function () { session.selectArticles(); };

        expect(selection).toThrow("Cannot select articles at this stage");
    });

    it("Should throw an error for an invalid acceptance percentage", function () {
        session = new Session();

        let invalidNegative = function () { session.setAcceptancePercentage(-10); };
        let invalidOver100 = function () { session.setAcceptancePercentage(110); };

        expect(invalidNegative).toThrow("Percentage must be between 0 and 100");
        expect(invalidOver100).toThrow("Percentage must be between 0 and 100");
    });
});

describe("Article selection - accepted papers are accessible", function () {
    it("Should store accepted papers after selection", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = createPaperWithScore("P1", author, [reviewer1, reviewer2, reviewer3], [3, 3, 3]);
        let p2 = createPaperWithScore("P2", author, [reviewer1, reviewer2, reviewer3], [-1, -1, -1]);

        setupSessionWithPapers([p1, p2], 50);

        session.selectArticles();

        expect(session.acceptedPapers()).toHaveLength(1);
        expect(session.acceptedPapers()[0]).toBe(p1);
    });

    it("Should return empty papers before selection", function () {
        session = new Session();
        expect(session.acceptedPapers()).toHaveLength(0);
    });
});
