const Session = require('./Session');
const User = require('./User');
const RegularPaper = require('./RegularPaper');
const { Interests } = require('./Bid');

const author1 = new User('Alice', 'UBA', 'alice@uba.ar', 'pass');
const author2 = new User('Bob', 'UTN', 'bob@utn.ar', 'pass');
const author3 = new User('Carol', 'ITBA', 'carol@itba.ar', 'pass');

const r1 = new User('Rev1', 'UBA', 'r1@x.com', 'pass');
const r2 = new User('Rev2', 'UTN', 'r2@x.com', 'pass');
const r3 = new User('Rev3', 'ITBA', 'r3@x.com', 'pass');
const r4 = new User('Rev4', 'UNLP', 'r4@x.com', 'pass');
const r5 = new User('Rev5', 'UNC', 'r5@x.com', 'pass');

const session = new Session();
[r1, r2, r3, r4, r5].forEach(function (r) { session.addReviewer(r); });

const p1 = new RegularPaper('Paper sobre IA', [author1], author1, 'Resumen breve del paper 1');
const p2 = new RegularPaper('Paper sobre BigData', [author2], author2, 'Resumen breve del paper 2');
const p3 = new RegularPaper('Paper sobre IngSoft', [author3], author3, 'Resumen breve del paper 3');

session.submit(p1);
session.submit(p2);
session.submit(p3);

console.log('--- Recepcion ---');
console.log('Stage:', session.stage());
console.log('Papers enviados:', session.papers().map(p => p.title()));
console.log('Revisores:', session.reviewers().map(r => r.fullName));

session.closeSubmissions();
console.log('\n--- Bidding ---');
console.log('Stage:', session.stage());

session.enterBid(p1, r1, Interests.Interested);
session.enterBid(p1, r2, Interests.Maybe);
session.enterBid(p1, r4, Interests.Interested);

session.enterBid(p2, r2, Interests.Interested);
session.enterBid(p2, r3, Interests.Maybe);
session.enterBid(p2, r5, Interests.NotInterested);

session.enterBid(p3, r3, Interests.Interested);
session.enterBid(p3, r4, Interests.Maybe);
session.enterBid(p3, r5, Interests.Interested);

console.log('Bids cargados:', session.bids().length);

session.closeBidding();
console.log('\n--- Asignacion ---');
console.log('Stage:', session.stage());
session.papers().forEach(function (paper) {
    const reviewers = session.assignmentsFor(paper).map(r => r.fullName);
    console.log(`${paper.title()} -> [${reviewers.join(', ')}]`);
});

console.log('Revisiones por revisor:');
const counts = new Map();
session.reviewers().forEach(function (r) { counts.set(r, 0); });
session.papers().forEach(function (paper) {
    session.assignmentsFor(paper).forEach(function (r) {
        counts.set(r, counts.get(r) + 1);
    });
});
counts.forEach(function (n, r) {
    console.log(`  ${r.fullName}: ${n}`);
});

console.log('\n--- Carga de Revisiones ---');
session.papers().forEach(function (paper, i) {
    const baseScores = [[3, 1, 0], [-1, 0, 2], [3, 2, 2]][i];
    session.assignmentsFor(paper).forEach(function (reviewer, j) {
        session.submitReview(paper, reviewer, `review de ${reviewer.fullName}`, baseScores[j]);
    });
});

session.papers().forEach(function (paper) {
    console.log(`${paper.title()} - score: ${paper.score().toFixed(2)} (${paper.reviewsCount()} reviews)`);
});

try {
    session.submitReview(p1, r1, 'cuarta review', 1);
} catch (e) {
    console.log('Error esperado al exceder reviews:', e.message);
}

console.log('\n--- Seleccion ---');
session.closeReviewing();
session.setAcceptancePercentage(70);
const aceptados = session.selectArticles();
console.log('Aceptados:', aceptados.map(p => `${p.title()} (${p.score().toFixed(2)})`));
