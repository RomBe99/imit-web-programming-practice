const whiteChecker = 'w';
const blackChecker = 'b';

class Checker {
    constructor(checkerColor, isKing) {
        this._checkerColor = checkerColor;
        this._isKing = isKing;
    }

    changeType() {
        this._isKing = !this._isKing;
    }

    get checkerColor() {
        return this._checkerColor;
    }

    get isKing() {
        return this._isKing;
    }
}

function checkerFactory(checkerType, isKing) {
    let factory = new Map([
        [whiteChecker, new Checker(whiteChecker, false)],
        [blackChecker, new Checker(blackChecker, false)]
    ]);

    const checker = factory.get(checkerType);

    if (isKing) {
        checker.changeType();
    }

    return checker;
}

class CheckerBoard {
    constructor() {
        this._boardSize = 8;
        this._board = [];

        for (let i = 0; i < this._boardSize; i++) {
            let temp = [];

            for (let j = 0; j < this._boardSize; j++) {
                temp[j] = null;
            }

            this._board[i] = temp;
        }
    }

    getChecker(row, col) {
        return this._board[row][col];
    }

    isCheckerColor(row, col, checkerColor) {
        const checker = this.getChecker(row, col);
        return checker != null && checkerColor === checker.checkerColor();
    }

    setChecker(row, col, checker) {
        this._board[row][col] = checker;
    }

    removeChecker(row, col) {
        this.setChecker(row, col, null);
    }
}

class Game {
    constructor(checkerBoard, firstMoveColor) {
        this._checkerBoard = checkerBoard;
        this._currentMoveColor = firstMoveColor;
    }

    move(oldRow, oldCol, newRow, newCol) {
        if (!this.canMoveTo(oldRow, oldCol, newRow, newCol)) {
            return;
        }

        const movingChecker = this._checkerBoard.getChecker(oldRow, oldCol);
        this._checkerBoard.removeChecker(oldRow, oldCol);
        this._checkerBoard.setChecker(newRow, newCol, movingChecker);

        this._currentMoveColor = this._currentMoveColor === whiteChecker ? blackChecker : whiteChecker;
    }

    canMoveTo(oldRow, oldCol, newRow, newCol) {
        return this._checkerBoard.isCheckerColor(oldRow, oldCol, this._currentMoveColor)
            && this._checkerBoard.getChecker(newRow, newCol) == null;
    }
}

function startGame() {
    // TODO Implement a standard checker alignment
}

function startExample() {
    // TODO Implement a example checker alignment
}