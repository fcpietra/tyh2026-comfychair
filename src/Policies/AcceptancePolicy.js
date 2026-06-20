class AcceptancePolicy {
    select(_papers) {
        throw new Error("Must implement select()");
    }
}
module.exports = AcceptancePolicy;
