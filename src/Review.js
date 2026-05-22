class Review{
    constructor(reviewer, text, score){
        this._reviewer = reviewer;
        this._text = text;
        this._score = this.validateScoreRange(score, true);
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
    validateScoreRange(score, throwError) {
        const isValid = score <= 3 && score >= -3 && Number.isInteger(score)

        if(throwError && !isValid) {
            throw new Error("Score is out of range")
        }

        return score
    }
}

module.exports = Review;