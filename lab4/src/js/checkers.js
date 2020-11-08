const white = 'w';
const black = 'b';
const firstLetterCode = 'A'.charCodeAt(0);

function idTransformer(row, col) {
    return String.fromCharCode(firstLetterCode + col).concat(row + 1);
}

function idParser(fieldId) {
    return [fieldId.charAt(1) - 1, fieldId.charCodeAt(0) - firstLetterCode];
}

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
        this._blackCount = 0;
        this._whiteCount = 0;
        this._board = new Array(this._rowCount);

        for (let i = 0; i < this._rowCount; i++) {
            this._board[i] = new Array(this._colCount).fill(null);
        }
    }

    setChecker(row, col, checker) {
        if (checker != null) {
            if (checker.checkerColor === white) {
                this._whiteCount++;
            } else {
                this._blackCount++;
            }
        }

        const tempChecker = this._board[row][col];

        if (tempChecker != null) {
            if (tempChecker.checkerColor === white) {
                this._whiteCount--;
            } else {
                this._blackCount--;
            }
        }

        this._board[row][col] = checker;
    }

    removeChecker(row, col) {
        this.setChecker(row, col, null);
    }

    clear() {
        for (let i = 0; i < this._rowCount; i++) {
            this._board[i] = new Array(this._colCount).fill(null);
        }

        this._whiteCount = 0;
        this._blackCount = 0;
    }

    getChecker(row, col) {
        return this._board[row][col];
    }

    containsChecker(row, col) {
        return this.getChecker(row, col) != null;
    }

    containsCheckerWithColor(row, col, color) {
        const checker = this.getChecker(row, col);

        return checker != null ? checker.checkerColor === color : false;
    }

    get colCount() {
        return this._colCount;
    }

    get rowCount() {
        return this._rowCount;
    }

    get whiteCount() {
        return this._whiteCount;
    }

    get blackCount() {
        return this._blackCount;
    }
}

class BoardRenderer {
    constructor(board) {
        this._board = board;
        this._isRendered = false;
        this._isRenderedHints = false;
    }

    drawHint(fieldId, color) {
        document.getElementById(fieldId).style.backgroundColor = color;
    }

    drawHints(fieldList, fieldId) {
        if (fieldList.size === 0) {
            return;
        }

        const validColor = '#7aff00';
        const attackColor = '#ff0000';
        const currentChecker = '#ffd500';

        this.drawHint(fieldId, currentChecker);

        for (let i of fieldList) {
            this.drawHint(i[0], i[1] ? attackColor : validColor);
        }

        this._isRenderedHints = true;
    }

    clearHints() {
        const whiteColor = '#ffe4c4';
        const blackColor = '#a52a2a';
        let isWhite = false;

        for (let row = 0; row < this._board.rowCount; row++) {
            for (let col = 0; col < this._board.colCount; col++) {
                let fieldId = idTransformer(row, col);

                this.drawHint(fieldId, isWhite ? whiteColor : blackColor);

                isWhite = !isWhite;
            }

            isWhite = !isWhite;
        }

        this._isRenderedHints = false;
    }

    drawBoard() {
        const boardRow = this._board.rowCount;
        const boardCol = this._board.colCount;
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
                let checker = this._board.getChecker(row, col);

                if (checker != null) {
                    let elemId = idTransformer(row, col);

                    document.getElementById(elemId).appendChild(getImage(checker.checkerColor, checker.isKing));
                }
            }
        }

        this._isRendered = true;
    }

    clearBoard() {
        const boardRow = this._board.rowCount;
        const boardCol = this._board.colCount;

        for (let row = 0; row < boardRow; row++) {
            for (let col = 0; col < boardCol; col++) {
                let elemId = idTransformer(row, col);
                let element = document.getElementById(elemId);

                if (element.lastChild != null) {
                    element.removeChild(element.lastChild);
                }
            }
        }

        this._isRendered = false;
    }

    refresh() {
        if (this._isRendered) {
            this.clearBoard();
        }

        if (this._isRenderedHints) {
            this.clearHints();
        }

        this.drawBoard();
    }
}

class Hinter {
    constructor(board) {
        this._board = board;
    }

    checkRow(row) {
        return row >= 0 && row < this._board.rowCount;
    }

    checkCol(col) {
        return col >= 0 && col < this._board.colCount;
    }

    hint(fieldId) {
        const coordinates = idParser(fieldId);
        const row = coordinates[0];
        const col = coordinates[1];

        if (!this.checkRow(row) || !this.checkCol(col)) {
            return null;
        }

        const checker = this._board.getChecker(row, col);

        if (checker == null) {
            return null;
        }

        const enemyColor = checker.checkerColor === white ? black : white;

        if (checker.isKing) {
            return this.hintForKing(row, col, checker.checkerColor, enemyColor);
        }

        return this.hintForChecker(row, col, checker.checkerColor, enemyColor);
    }

    hintForChecker(row, col, checkerColor) {
        const rowDirections = new Map([
            [black, -1],
            [white, 1]
        ]);
        const currRowDir = rowDirections.get(checkerColor);
        let result = new Map();
        let isAttack = false;
        const moveScanner = (row, col, isLeft) => {
            if (this.checkRow(row) && this.checkCol(col)
                && !this._board.containsCheckerWithColor(row, col, checkerColor)) {
                if (!this._board.containsChecker(row, col)) {
                    const fieldId = idTransformer(row, col);
                    result.set(fieldId, false);
                } else {
                    let tempRow = row + currRowDir;
                    let tempCol = col + (isLeft ? -1 : 1);

                    if (!this._board.containsChecker(tempRow, tempCol)) {
                        const fieldId = idTransformer(tempRow, tempCol);
                        result.set(fieldId, true);

                        isAttack = true;
                    }
                }
            }
        };

        moveScanner(row + currRowDir, col + 1, false);
        moveScanner(row + currRowDir, col - 1, true);

        if (isAttack) {
            for (let i of result) {
                if (!i[1]) {
                    result.delete(i[0]);
                }
            }
        }

        return result;
    }

    hintForKing(row, col, checkerColor) {
        let result = new Map();
        let isAttack = false;
        const moveScanner = (row, col, isLeft, isDown) => {
            if (this.checkRow(row) && this.checkCol(col)
                && !this._board.containsCheckerWithColor(row, col, checkerColor)) {
                if (!this._board.containsChecker(row, col)) {
                    const fieldId = idTransformer(row, col);
                    if (!result.has(fieldId)) {
                        result.set(fieldId, false);
                    }
                } else {
                    let tempRow = row + (isDown ? -1 : 1);
                    let tempCol = col + (isLeft ? -1 : 1);

                    if (!this._board.containsChecker(tempRow, tempCol)) {
                        const fieldId = idTransformer(tempRow, tempCol);
                        if (!result.has(fieldId)) {
                            result.set(fieldId, true);
                        }

                        isAttack = true;
                    }
                }
            }
        };

        for (let i = 0; i < this._board.rowCount; i++) {
            moveScanner(row + i, col + i, false, false);
        }

        for (let i = 0; i < this._board.rowCount; i++) {
            moveScanner(row + i, col - i, true, false);
        }

        for (let i = 0; i < this._board.rowCount; i++) {
            moveScanner(row - i, col + i, false, true);
        }

        for (let i = 0; i < this._board.rowCount; i++) {
            moveScanner(row - i, col - i, true, true);
        }

        if (isAttack) {
            for (let i of result) {
                if (!i[1]) {
                    result.delete(i[0]);
                }
            }
        }

        return result;
    }
}

class GameController {
    constructor(board, firstMoveColor) {
        this._board = board;
        this._renderer = new BoardRenderer(this._board);
        this._hinter = new Hinter(this._board);
        this._currentMoveColor = firstMoveColor;
        this._currentFieldId = null;
        this._availableMoves = null;
    }

    moveModeControl(fieldId) {
        if (this.isMoveMode()) {
            this.stopMoveMode(fieldId);
        } else {
            this.startMoveMode(fieldId);
        }
    }

    startGame(firstMoveColor) {
        this._currentMoveColor = firstMoveColor;

        this.stopMoveMode(this._currentFieldId);
    }

    startMoveMode(fieldId) {
        this._availableMoves = this._hinter.hint(fieldId);

        if (this._availableMoves != null && this._availableMoves.size !== 0) {
            this._currentFieldId = fieldId;
            this._renderer.drawHints(this._availableMoves, fieldId);
        }
    }

    stopMoveMode(fieldId) {
        if (fieldId === this._currentFieldId) {
            this._currentFieldId = null;
            this._availableMoves = null;

            this._renderer.refresh();
        }
    }

    isMoveMode() {
        return this._currentFieldId != null;
    }
}

const board = new CheckerBoard();
let gameController = new GameController(board, white);

function move(fieldId) {
    gameController.moveModeControl(fieldId);
}

function endTurn() {
    if (gameController.isMoveMode()) {
        // TODO
    }
}

function undoTurn() {
    if (gameController.isMoveMode()) {
        // TODO
    }
}

function startGame() {
    board.clear();

    let flag = true;
    const rowsCount = 3;

    for (let i = 0; i < rowsCount; i++) {
        for (let j = 0; j < board.colCount; j++) {
            if (flag) {
                board.setChecker(i, j, checkerFactory(white, false));
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
            }

            flag = !flag;
        }

        flag = !flag;
    }

    gameController.startGame(white);
}

function startExample() {
    board.clear();

    board.setChecker(3, 5, checkerFactory(white, false));
    board.setChecker(3, 7, checkerFactory(white, false));

    board.setChecker(7, 1, checkerFactory(black, false));
    board.setChecker(0, 2, checkerFactory(black, true));
    board.setChecker(4, 2, checkerFactory(black, false));
    board.setChecker(6, 2, checkerFactory(black, false));
    board.setChecker(6, 4, checkerFactory(black, false));
    board.setChecker(5, 7, checkerFactory(black, false));

    gameController.startGame(white);
}