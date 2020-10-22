const white = 'w';
const black = 'b';

class Checker {
    constructor(checkerColor, isKing) {
        this._checkerColor = checkerColor;
        this._isKing = isKing;
    }

    get checkerColor() {
        return this._checkerColor;
    }

    get isKing() {
        return this._isKing;
    }
}

function checkerFactory(checkerColor, isKing) {
    let factory = new Map([
        [white, new Checker(white, isKing)],
        [black, new Checker(black, isKing)]
    ]);

    return factory.get(checkerColor);
}

class CheckerBoard {
    constructor() {
        this._boardCol = 8;
        this._boardRow = 8;
        this._board = new Array(this._boardRow);

        for (let i = 0; i < this._boardRow; i++) {
            this._board.push(new Array(this._boardCol));
        }
    }

    setChecker(row, col, checker) {
        this._board[row][col] = checker;
    }

    removeChecker(row, col) {
        this.setChecker(row, col, undefined);
    }

    clear() {
        for (let i = 0; i < this._boardRow; i++) {
            this._board.push(new Array(this._boardCol));
        }
    }

    get boardCol() {
        return this._boardCol;
    }

    get boardRow() {
        return this._boardRow;
    }
}

function moves() {
    let result = [];

    return result;
}



function startGame() {
    // TODO Implement a standard checker alignment
}

function startExample() {
    // TODO Implement a example checker alignment
}