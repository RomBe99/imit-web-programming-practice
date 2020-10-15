const whiteChecker = 'w';
const blackChecker = 'b';
const whiteKing = 'wk';
const blackKing = 'bk';

class Checker {
    constructor(checkerType) {
        this._checkerType = checkerType;
    }

    get checkerType() {
        return this._checkerType;
    }
}

class King extends Checker {
    constructor(checkerType) {
        super(checkerType);
    }
}

function checkerFactory(checkerType) {
    let factory = new Map([
        [whiteChecker, new Checker(whiteChecker)],
        [blackChecker, new Checker(blackChecker)],
        [whiteKing, new King(whiteKing)],
        [blackKing, new King(blackKing)]
    ]);

    return factory.get(checkerType);
}

class CheckerBoard {
    // TODO
    constructor() {
        this._board = null;
    }
}

function startGame() {
    // TODO Implement a standard checker alignment
}

function startExample() {
    // TODO Implement a example checker alignment
}