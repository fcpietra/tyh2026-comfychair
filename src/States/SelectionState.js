const SessionState = require('./SessionState');
const SessionStatesEnum = require('../Enums/SessionStatesEnum');

class SelectionState extends SessionState {
    stage() {
        return SessionStatesEnum.SELECTION;
    }
    selectArticles() {
        return this.session._applyAcceptancePolicy();
    }
}
module.exports = SelectionState;
