const white = 'w';
const black = 'b';
const attackSep = ':';
const moveSep = '-';
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
            this.drawHint(i[0], i[1] != null ? attackColor : validColor);
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

    hint(fieldId) {
        const coordinates = idParser(fieldId);
        const row = coordinates[0];
        const col = coordinates[1];
        const checker = this._board.getChecker(row, col);

        if (checker == null) {
            return null;
        }

        const checkerColor = checker.checkerColor;
        const enemyColor = checker.checkerColor === white ? black : white;

        let result = new Map();
        let isAttack = false;
        let continueSearch = true;
        const moveScanner = (row, col, isLeft, isDown) => {
            const isCorrectRow = (r) => {
                return r >= 0 && r < this._board.rowCount;
            };
            const isCorrectCol = (c) => {
                return c >= 0 && c < this._board.colCount;
            };

            if (!isCorrectRow(row) || !isCorrectCol(col) || this._board.containsCheckerWithColor(row, col, checkerColor)) {
                return;
            }
            const vStep = isDown ? -1 : 1;
            const hStep = isLeft ? -1 : 1;

            if (this._board.containsCheckerWithColor(row, col, enemyColor)) {
                let tempRow = row + vStep;
                let tempCol = col + hStep;

                if (isCorrectRow(tempRow) && isCorrectCol(tempCol) && !this._board.containsChecker(tempRow, tempCol)) {
                    const fieldId = idTransformer(tempRow, tempCol);

                    if (!result.has(fieldId)) {
                        result.set(fieldId, idTransformer(row, col));
                    }

                    isAttack = true;

                    tempRow += vStep;
                    tempCol += hStep;

                    if (isCorrectRow(tempRow) && isCorrectCol(tempCol) && this._board.containsChecker(tempRow, tempCol)) {
                        continueSearch = false;
                    }
                } else {
                    continueSearch = false;
                }
            } else {
                const fieldId = idTransformer(row, col);

                if (!result.has(fieldId)) {
                    result.set(fieldId, null);
                }
            }
        };

        if (checker.isKing) {
            for (let i = 0; i < this._board.rowCount && continueSearch; i++) {
                moveScanner(row + i, col + i, false, false);
            }

            continueSearch = true;

            for (let i = 0; i < this._board.rowCount && continueSearch; i++) {
                moveScanner(row + i, col - i, true, false);
            }

            continueSearch = true;

            for (let i = 0; i < this._board.rowCount && continueSearch; i++) {
                moveScanner(row - i, col + i, false, true);
            }

            continueSearch = true;

            for (let i = 0; i < this._board.rowCount && continueSearch; i++) {
                moveScanner(row - i, col - i, true, true);
            }
        } else {
            const isDown = checkerColor === black;
            const currRowDir = (white === checkerColor ? 1 : -1);

            moveScanner(row + currRowDir, col + 1, false, isDown);
            moveScanner(row + currRowDir, col - 1, true, isDown);

            if (isAttack) {
                moveScanner(row - currRowDir, col + 1, false, !isDown);
                moveScanner(row - currRowDir, col - 1, true, !isDown);
            }
        }

        if (isAttack) {
            for (let i of result) {
                if (i[1] == null) {
                    result.delete(i[0]);
                }
            }
        }

        return result;
    }
}

class Recorder {
    constructor() {
        this._startFieldId = null;
        this._currFieldId = null;
        this._isAttack = null;
        this._movedChecker = null;
        this._historyContainerId = 'match_history';
        this._isEmpty = true;
    }

    record(startFieldId, currFieldId, isAttack, movedChecker) {
        this._startFieldId = startFieldId;
        this._currFieldId = currFieldId;
        this._isAttack = isAttack;
        this._movedChecker = movedChecker;
        this._isEmpty = false;
    }

    clear() {
        this._startFieldId = null;
        this._currFieldId = null;
        this._isAttack = null;
        this._movedChecker = null;
        this._isEmpty = true;
    }

    writeToHistory() {
        if (this.isEmpty) {
            return;
        }

        const elem = document.createElement("li");

        elem.innerHTML = this.getRec();
        document.getElementById(this._historyContainerId).append(elem);
    }

    clearHistory() {
        const elem = document.getElementById(this._historyContainerId);

        for (let c = elem.lastChild; c != null; c = elem.lastChild) {
            elem.removeChild(c);
        }
    }

    getRec() {
        if (!this._isEmpty) {
            const recSeparator = this._isAttack ? attackSep : moveSep;

            return this._startFieldId + recSeparator + this._currFieldId;
        }

        return null;
    }

    get startFieldId() {
        return this._startFieldId;
    }

    get currFieldId() {
        return this._currFieldId;
    }

    get isAttack() {
        return this._isAttack;
    }

    get movedChecker() {
        return this._movedChecker;
    }

    get isEmpty() {
        return this._isEmpty;
    }
}

let parserModeOn = false;

class GameController {
    constructor(board, firstMoveColor) {
        this._board = board;
        this._renderer = new BoardRenderer(this._board);
        this._hinter = new Hinter(this._board);
        this._recorder = new Recorder();
        this._currentMoveColor = firstMoveColor;
        this._colorsToName = new Map([
            [white, 'белые'],
            [black, 'чёрные']
        ]);
        this._currentFieldId = null;
        this._availableMoves = null;
        this._isStarted = false;
    }

    whoMove() {
        if (parserModeOn) {
            return;
        }

        alert('Сейчас ходят ' + this._colorsToName.get(this._currentMoveColor));
    }

    commit() {
        if (!this._recorder.isEmpty) {
            this._recorder.writeToHistory();

            let existAttack = false;

            if (this._recorder.isAttack) {
                const victimRowCol = idParser(this._availableMoves.get(this._recorder.currFieldId));

                this._board.removeChecker(victimRowCol[0], victimRowCol[1]);

                if (this.checkMove(this._recorder.currFieldId)) {
                    for (const victimId of this._availableMoves.values()) {
                        if (victimId != null) {
                            existAttack = true;
                            break;
                        }
                    }
                }
            }

            if (this._recorder.isAttack && existAttack) {
                this._currentFieldId = this._recorder.currFieldId;
                this._recorder.clear();
                this.startMoveMode(this._currentFieldId);
            } else {
                this._recorder.clear();
                this.stopMoveMode(this._currentFieldId);
                this.changePlayerMove();
                this.whoMove();
            }
        }
    }

    rollback() {
        if (!this._recorder.isEmpty) {
            const startRowCol = idParser(this._recorder.startFieldId);
            this._board.setChecker(startRowCol[0], startRowCol[1], this._recorder.movedChecker);

            const rowCol = idParser(this._recorder.currFieldId);
            this._board.removeChecker(rowCol[0], rowCol[1]);

            this._recorder.clear();
            this.stopMoveMode(this._currentFieldId);
        }
    }

    startGame(firstMoveColor) {
        this._currentMoveColor = firstMoveColor;
        this._isStarted = true;

        this.stopMoveMode(this._currentFieldId);
        this.whoMove();
        this._recorder.clear();
        this._recorder.clearHistory();
    }

    whoWin() {
        if (this._board.whiteCount === 0) {
            return white;
        }

        if (this._board.blackCount === 0) {
            return black;
        }

        return null;
    }

    stopGame() {
        if (parserModeOn) {
            return;
        }

        const whoWin = this.whoWin();

        if (whoWin != null) {
            this._isStarted = false;
            this._currentFieldId = null;
            this._availableMoves = null;

            this._board.clear();
            this._recorder.clearHistory();
            this._recorder.clear();
            this._renderer.refresh();

            alert(this._colorsToName.get(whoWin) + ' победили!');
        }
    }

    startMoveMode(fieldId) {
        const existMoves = this.checkMove(fieldId);

        if (existMoves) {
            this._currentFieldId = fieldId;
            this._renderer.drawHints(this._availableMoves, fieldId);
        }
    }

    stopMoveMode(fieldId) {
        if (fieldId === this._currentFieldId && this._recorder.isEmpty) {
            this._currentFieldId = null;
            this._availableMoves = null;

            this._renderer.refresh();
        }
    }

    moveTo(fieldId) {
        if (!this._availableMoves.has(fieldId)) {
            return;
        }

        const isAttack = this._availableMoves.get(fieldId) != null;

        const oldRowCol = idParser(this._currentFieldId);
        const newRowCol = idParser(fieldId);
        const canTransformToKing = () => {
            return newRowCol[0] === 0 || newRowCol[0] === this._board.rowCount - 1;
        };
        let movedChecker = this._board.getChecker(oldRowCol[0], oldRowCol[1]);

        this._recorder.record(this._currentFieldId, fieldId, isAttack, movedChecker);
        this._board.removeChecker(oldRowCol[0], oldRowCol[1]);

        if (!movedChecker.isKing && canTransformToKing()) {
            movedChecker = checkerFactory(movedChecker.checkerColor, true);
        }

        this._board.setChecker(newRowCol[0], newRowCol[1], movedChecker);
        this._renderer.refresh();
    }

    changePlayerMove() {
        this._currentMoveColor = this._currentMoveColor === white ? black : white;
    }

    isMoveMode() {
        return this._currentFieldId != null;
    }

    checkMove(fieldId) {
        const isCorrectChecker = this.isCorrectChecker(fieldId);

        if (isCorrectChecker) {
            this._availableMoves = this._hinter.hint(fieldId);
        }

        return this._availableMoves != null && this._availableMoves.size !== 0;
    }

    getCurrRec() {
        return this._recorder.getRec();
    }

    isCorrectChecker(fieldId) {
        const rowCol = idParser(fieldId);

        return this._board.getChecker(rowCol[0], rowCol[1])?.checkerColor === this._currentMoveColor;
    }

    get isStarted() {
        return this._isStarted;
    }

    get availableMoves() {
        return this._availableMoves;
    }

    get currentMoveColor() {
        return this._currentMoveColor;
    }
}

const board = new CheckerBoard();
const controller = new GameController(board, white);

function move(fieldId) {
    if (controller.isStarted) {
        if (controller.isMoveMode()) {
            controller.stopMoveMode(fieldId);

            if (controller.isMoveMode()) {
                controller.moveTo(fieldId);

                return true;
            }
        } else {
            controller.startMoveMode(fieldId);
        }
    }

    return false;
}

function endTurn() {
    if (controller.isStarted && controller.isMoveMode()) {
        controller.commit();
        controller.stopGame();
    }
}

function undoTurn() {
    if (controller.isStarted && controller.isMoveMode()) {
        controller.rollback();
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

    controller.startGame(white);
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

    controller.startGame(white);
}

function activateParserMode() {
    if (!parserModeOn) {
        parserModeOn = true;

        parseHistory();
    }

    parserModeOn = false;
}

function parseHistory() {
    const enteredHistory = document.getElementById('entered-history').value.split('\n').filter((elem) => {
        return '' !== elem.trim();
    });

    if (enteredHistory.length === 0) {
        alert('Поле с историей пусто');

        return;
    }

    const errorStringGenerator = (strNum, errMsg) => {
        return `В строке №${strNum} найдена ошибка: ${errMsg}`;
    };
    const isCorrectFieldId = (letter, num) => {
        const letterCode = letter.charCodeAt(0);
        const isCorrectLetter = firstLetterCode + board.colCount >= letterCode && firstLetterCode <= letterCode;
        const isCorrectNum = num > 0 && num <= board.rowCount;

        return isCorrectLetter && isCorrectNum;
    };
    const isCorrectMoveType = (moveType) => {
        return moveSep === moveType || attackSep === moveType;
    };

    startGame();

    const recorder = new Recorder();
    let isPrefAttack = false;

    // move[0] + move[1] - start field id
    // move[2] - move type. ':' - attack, '-' - move
    // move[3] + move[4] - finish field id
    for (let i = 0; i < enteredHistory.length; i++) {
        const moveRec = enteredHistory[i];
        const pMoveColor = controller.currentMoveColor;
        const pStartFieldId = moveRec[0] + moveRec[1];
        const pMoveType = moveRec[2];
        const pFinishFieldId = moveRec[3] + moveRec[4];

        if (!isCorrectFieldId(moveRec[0], moveRec[1])) {
            alert(errorStringGenerator(i + 1, `Неверный id поля с которого начинается ход ${pStartFieldId}`));

            return;
        }

        if (!controller.isCorrectChecker(pStartFieldId)) {
            alert(errorStringGenerator(i + 1, `Сейчас ход игрока ${controller.currentMoveColor}`));

            return;
        }

        if (!isCorrectMoveType(pMoveType)) {
            alert(errorStringGenerator(i + 1, `Неизвестный тип хода ${pMoveType}`));

            return;
        }

        if (!isCorrectFieldId(moveRec[3], moveRec[4])) {
            alert(errorStringGenerator(i + 1, `Неверный id поля на котором заканчивается ход ${pFinishFieldId}`));

            return;
        }

        recorder.record(pStartFieldId, pFinishFieldId, pMoveType === attackSep, null);
        isPrefAttack = isPrefAttack && recorder.isAttack;

        if (controller.checkMove(recorder.startFieldId) && controller.availableMoves.has(recorder.currFieldId)) {
            if (!isPrefAttack) {
                move(recorder.startFieldId);
            }

            move(recorder.currFieldId);

            if (controller.getCurrRec() !== recorder.getRec()) {
                alert(errorStringGenerator(i + 1, `Запись контроллера ${controller.getCurrRec()} не соответствует записи парсера ${recorder.getRec()}`));

                undoTurn();
                return;
            }

            endTurn();

            isPrefAttack = controller.currentMoveColor === pMoveColor && attackSep === pMoveType;
        } else {
            alert(errorStringGenerator(i + 1, `Ход ${recorder.getRec()} не соответствует правилам`));

            return;
        }
    }
}