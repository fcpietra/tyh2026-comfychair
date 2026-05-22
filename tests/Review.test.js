const Review = require("../src/Review");
const User = require("../src/User");

let reviewer;
jest.mock("../src/User");

beforeEach(()=>{
    reviewer = new User();
});

describe("A Review", ()=>{
    it("should accept integer scores within -3 and 3", ()=>{
        expect(new Review(reviewer, "ok", -3).score()).toBe(-3);
        expect(new Review(reviewer, "ok", 0).score()).toBe(0);
        expect(new Review(reviewer, "ok", 3).score()).toBe(3);
    })

    it("should reject scores above 3", ()=>{
        expect(()=> new Review(reviewer, "ok", 4)).toThrow("Score is out of range");
    })

    it("should reject scores below -3", ()=>{
        expect(()=> new Review(reviewer, "ok", -4)).toThrow("Score is out of range");
    })

    it("should reject non-integer scores", ()=>{
        expect(()=> new Review(reviewer, "ok", 2.5)).toThrow("Score must be an integer");
        expect(()=> new Review(reviewer, "ok", -0.5)).toThrow("Score must be an integer");
    })

    it("should reject non-numeric scores", ()=>{
        expect(()=> new Review(reviewer, "ok", "3")).toThrow("Score must be an integer");
        expect(()=> new Review(reviewer, "ok", NaN)).toThrow("Score must be an integer");
        expect(()=> new Review(reviewer, "ok", undefined)).toThrow("Score must be an integer");
        expect(()=> new Review(reviewer, "ok", null)).toThrow("Score must be an integer");
    })

    it("should expose reviewer and text", ()=>{
        const review = new Review(reviewer, "good paper", 2);
        expect(review.reviewer()).toBe(reviewer);
        expect(review.text()).toBe("good paper");
    })
})
