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
    const factory = new Map([
        [white, new Checker(white, isKing)],
        [black, new Checker(black, isKing)]
    ]);

    return factory.get(checkerColor);
}

class CheckerBoard {
    constructor() {
        this._colCount = 8;
        this._rowCount = 8;
        this._board = new Array(this._rowCount);

        for (let i = 0; i < this._rowCount; i++) {
            let temp = new Array(this._colCount);
            temp.fill(null);

            this._board[i] = temp;
        }
    }

    setChecker(row, col, checker) {
        this._board[row][col] = checker;
    }

    removeChecker(row, col) {
        this.setChecker(row, col, null);
    }

    clear() {
        for (let i = 0; i < this._rowCount; i++) {
            let temp = new Array(this._colCount);
            temp.fill(null);

            this._board[i] = temp;
        }
    }

    get colCount() {
        return this._colCount;
    }

    get rowCount() {
        return this._rowCount;
    }


    get board() {
        return this._board;
    }
}

function drawBoard(checkerBoard) {
    const boardRow = checkerBoard.rowCount;
    const boardCol = checkerBoard.colCount;
    const board = checkerBoard.board;
    const idTransformer = (row, col) => {
        return String.fromCharCode(65 + col).concat(row + 1);
    };
    const getImage = (checkerColor, isKing) => {
        const paths = new Map([
            [white + false, '../images/checkers/wss.png'],
            [black + false, '../images/checkers/bss.png'],
            [white + true, '../images/checkers/wd.png'],
            [black + true, '../images/checkers/bd.png']
        ]);

        const img = new Image();
        img.src = paths.get(checkerColor + isKing);

        return img;
    };

    for (let row = 0; row < boardRow; row++) {
        for (let col = 0; col < boardCol; col++) {
            let checker = board[row][col];

            if (checker !== null) {
                let elemId = idTransformer(row, col);

                document.getElementById(elemId).appendChild(getImage(checker.checkerColor, checker.isKing));
            }
        }
    }
}

function startGame() {
    const rowsCount = 3;

    let board = new CheckerBoard();
    let flag = true;

    for (let i = 0; i < rowsCount; i++) {
        for (let j = 0; j < board.colCount; j++) {
            if (flag) {
                board.setChecker(i, j, checkerFactory(white, false));
            } else {
                board.removeChecker(i, j);
            }

            flag = !flag;
        }

        flag = !flag;
    }

    flag = false;

    for (let i = board.rowCount - 1; i > board.rowCount - 1 - rowsCount; i--) {
        for (let j = 0; j < board.colCount; j++) {
            if (flag) {
                board.setChecker(i, j, checkerFactory(black, false));
            } else {
                board.removeChecker(i, j);
            }

            flag = !flag;
        }

        flag = !flag;
    }

    drawBoard(board);
}

function startExample() {
    let board = new CheckerBoard();
    board.setChecker(3, 5, checkerFactory(white, false));
    board.setChecker(3, 7, checkerFactory(white, false));

    board.setChecker(7, 1, checkerFactory(black, false));
    board.setChecker(0, 2, checkerFactory(black, true));
    board.setChecker(4, 2, checkerFactory(black, false));
    board.setChecker(6, 2, checkerFactory(black, false));
    board.setChecker(6, 4, checkerFactory(black, false));
    board.setChecker(5, 7, checkerFactory(black, false));

    drawBoard(board);
}