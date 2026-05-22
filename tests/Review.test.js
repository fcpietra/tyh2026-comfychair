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
        expect(()=> new Review(reviewer, "ok", 4)).toThrow();
    })

    it("should reject scores below -3", ()=>{
        expect(()=> new Review(reviewer, "ok", -4)).toThrow();
    })

    it("should reject non-integer scores", ()=>{
        expect(()=> new Review(reviewer, "ok", 2.5)).toThrow();
        expect(()=> new Review(reviewer, "ok", -0.5)).toThrow();
    })

    it("should reject non-numeric scores", ()=>{
        expect(()=> new Review(reviewer, "ok", "3")).toThrow();
        expect(()=> new Review(reviewer, "ok", NaN)).toThrow();
        expect(()=> new Review(reviewer, "ok", undefined)).toThrow();
        expect(()=> new Review(reviewer, "ok", null)).toThrow();
    })

    it("should expose reviewer and text", ()=>{
        const review = new Review(reviewer, "good paper", 2);
        expect(review.reviewer()).toBe(reviewer);
        expect(review.text()).toBe("good paper");
    })
})
