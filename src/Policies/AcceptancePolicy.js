class AcceptancePolicy {
    select(papers) {
        throw new Error("Must implement select()");
    }
}
module.exports = AcceptancePolicy;
