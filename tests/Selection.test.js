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

describe("Article selection - empates en el puntaje", function () {
    it("Debe aceptar papers incluso cuando hay empates en el límite", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = createPaperWithScore("P1", author, [reviewer1, reviewer2, reviewer3], [3, 3, 3]);
        let p2 = createPaperWithScore("P2", author, [reviewer1, reviewer2, reviewer3], [2, 2, 2]);
        let p3 = createPaperWithScore("P3", author, [reviewer1, reviewer2, reviewer3], [2, 2, 2]);
        let p4 = createPaperWithScore("P4", author, [reviewer1, reviewer2, reviewer3], [0, 0, 0]);

        // 4 artículos, 50% → 2 aceptados. p2 y p3 tienen la misma puntuación
        setupSessionWithPapers([p1, p2, p3, p4], 50);

        let accepted = session.selectArticles();

        expect(accepted).toHaveLength(2);
        expect(accepted[0]).toBe(p1);
        // uno de los papers con puntaje 2 es aceptado
        expect(accepted[1].score()).toBe(2);
    });

    it("Debe aceptar la cantidad correcta de papers incluso cuando todos los papers tienen el mismo puntaje", function () {
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

describe("Article selection - porcentaje 0 y 100", function () {
    it("Debe aceptar ningún paper con 0% de aceptación", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = createPaperWithScore("P1", author, [reviewer1, reviewer2, reviewer3], [3, 3, 3]);
        let p2 = createPaperWithScore("P2", author, [reviewer1, reviewer2, reviewer3], [2, 2, 2]);

        setupSessionWithPapers([p1, p2], 0);

        let accepted = session.selectArticles();

        expect(accepted).toHaveLength(0);
    });

    it("Debe aceptar todos los papers con 100% de aceptación", function () {
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

describe("Article selection - validación de etapa", function () {
    it("Debe lanzar error al seleccionar fuera de la etapa de selección", function () {
        session = new Session();
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = new Paper("P1", [author], author);
        session.submit(p1);

        let selection = function () { session.selectArticles(); };

        expect(selection).toThrow("No se pueden seleccionar artículos en esta etapa");
    });

    it("Debe lanzar error por porcentaje de aceptación inválido", function () {
        session = new Session();

        let invalidNegative = function () { session.setAcceptancePercentage(-10); };
        let invalidOver100 = function () { session.setAcceptancePercentage(110); };

        expect(invalidNegative).toThrow("Percentage must be between 0 and 100");
        expect(invalidOver100).toThrow("Percentage must be between 0 and 100");
    });
});

describe("Article selection - los papers aceptados son accesibles", function () {
    it("Debe guardar los papers aceptados después de la selección", function () {
        let author = new User("Author", "UBA", "a@uba.ar", "123");
        let p1 = createPaperWithScore("P1", author, [reviewer1, reviewer2, reviewer3], [3, 3, 3]);
        let p2 = createPaperWithScore("P2", author, [reviewer1, reviewer2, reviewer3], [-1, -1, -1]);

        setupSessionWithPapers([p1, p2], 50);

        session.selectArticles();

        expect(session.acceptedPapers()).toHaveLength(1);
        expect(session.acceptedPapers()[0]).toBe(p1);
    });

    it("Debe retornar papers vacíos antes de la selección", function () {
        session = new Session();
        expect(session.acceptedPapers()).toHaveLength(0);
    });
});
