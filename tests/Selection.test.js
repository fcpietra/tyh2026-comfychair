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

describe("Selección de pappers: límite exacto", function () {
    it("Debe aceptar exactamente el 30% de 10 papers (3 papers)", function () {
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

    it("Debe aceptar los papers con los puntajes más altos", function () {
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

describe("Article selection - redondeo", function () {
    it("Debe redondear hacia abajo cuando el porcentaje no produce un número entero", function () {
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

    it("Debe redondear hacia abajo con 7 papers y 40%", function () {
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

