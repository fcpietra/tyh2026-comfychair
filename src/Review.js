class Review{
    constructor(reviewer, text, score){
        this._reviewer = reviewer;
        this._text = text;
        this._score = this.validateScoreRange(score);
    }
    reviewer(){
        return this._reviewer;
    }
    text(){
        return this._text;
    }
    score(){
        return this._score;
    }
    validateScoreRange(score) {
        if (!Number.isInteger(score)) {
            throw new Error("Score must be an integer");
        }

        if (score < -3 || score > 3) {
            throw new Error("Score is out of range");
        }
        return score;
    }
}

module.exports = Review;