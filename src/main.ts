type Player = "red" | "yellow";
type Winner = Player | "draw" | null;
type Cell = Player | null;
type Board = Cell[][];
type Page = "overview" | "game";

type Game = {
    id: number;
    startedAt: string;
    finishedAt: string | null;
    winner: Winner;
    moves: number[];
};

type AppState = {
    page: Page;
    selectedGameId: number | null;
    viewedMove: number;
    games: Game[];
};


// ============================================================
// APP MODEL
// ============================================================

class AppModel {
    private state: AppState = {
        page: "overview",
        selectedGameId: null,
        viewedMove: 0,
        games: [
            {
                id: 1,
                startedAt: "2026-09-29T08:40:00",
                finishedAt: null,
                winner: null,
                moves: [3, 2, 3, 4, 1, 3]
            },
            {
                id: 2,
                startedAt: "2026-09-28T18:15:00",
                finishedAt: "2026-09-28T18:23:00",
                winner: "red",
                moves: [3, 2, 3, 2, 3, 2, 3]
            },
            {
                id: 3,
                startedAt: "2026-09-27T20:10:00",
                finishedAt: "2026-09-27T20:18:00",
                winner: "yellow",
                moves: [0, 3, 1, 3, 2, 3, 6, 3]
            }
        ]
    };

    getState(): AppState {
        return structuredClone(this.state);
    }

    openGame(gameId: number): void {
        const game = this.findGame(gameId);

        this.state.page = "game";
        this.state.selectedGameId = gameId;
        this.state.viewedMove = game.moves.length;
    }

    backToOverview(): void {
        this.state.page = "overview";
        this.state.selectedGameId = null;
        this.state.viewedMove = 0;
    }

    newGame(): void {
        const nextId = Math.max(0, ...this.state.games.map(game => game.id)) + 1;

        const game: Game = {
            id: nextId,
            startedAt: new Date().toISOString(),
            finishedAt: null,
            winner: null,
            moves: []
        };

        this.state.games.unshift(game);
        this.openGame(game.id);
    }

    playColumn(column: number): void {
        const game = this.getSelectedGame();

        if (game.winner !== null) return;
        if (this.state.viewedMove !== game.moves.length) return;

        let board = createBoardFromMoves(game.moves);

        if (!isLegalMove(board, column)) return;

        // Spilleren er alltid rød
        game.moves.push(column);
        board = createBoardFromMoves(game.moves);

        if (hasWon(board, "red")) {
            this.finishGame(game, "red");
            return;
        }

        if (isBoardFull(board)) {
            this.finishGame(game, "draw");
            return;
        }

        // Roboten er alltid gul
        const robotColumn = chooseRobotColumn(board);

        if (robotColumn !== null) {
            game.moves.push(robotColumn);
        }

        board = createBoardFromMoves(game.moves);

        if (hasWon(board, "yellow")) {
            this.finishGame(game, "yellow");
            return;
        }

        if (isBoardFull(board)) {
            this.finishGame(game, "draw");
            return;
        }

        this.state.viewedMove = game.moves.length;
    }

    goToStart(): void {
        this.state.viewedMove = 0;
    }

    goToPreviousMove(): void {
        this.state.viewedMove = Math.max(0, this.state.viewedMove - 1);
    }

    goToNextMove(): void {
        const game = this.getSelectedGame();
        this.state.viewedMove = Math.min(game.moves.length, this.state.viewedMove + 1);
    }

    goToLatestMove(): void {
        const game = this.getSelectedGame();
        this.state.viewedMove = game.moves.length;
    }

    private findGame(gameId: number): Game {
        const game = this.state.games.find(game => game.id === gameId);

        if (!game) {
            throw new Error(`Fant ikke spill ${gameId}`);
        }

        return game;
    }

    private getSelectedGame(): Game {
        if (this.state.selectedGameId === null) {
            throw new Error("Ingen spill er valgt");
        }

        return this.findGame(this.state.selectedGameId);
    }

    private finishGame(game: Game, winner: Winner): void {
        game.winner = winner;
        game.finishedAt = new Date().toISOString();
        this.state.viewedMove = game.moves.length;
    }
}


// ============================================================
// SPILLMOTOR
// ============================================================

function createEmptyBoard(): Board {
    return Array.from({ length: 6 }, () => Array<Cell>(7).fill(null));
}

function createBoardFromMoves(moves: number[]): Board {
    const board = createEmptyBoard();

    moves.forEach((column, index) => {
        const player: Player = index % 2 === 0 ? "red" : "yellow";
        dropPiece(board, column, player);
    });

    return board;
}

function dropPiece(board: Board, column: number, player: Player): boolean {
    for (let row = board.length - 1; row >= 0; row--) {
        if (board[row][column] === null) {
            board[row][column] = player;
            return true;
        }
    }

    return false;
}

function isLegalMove(board: Board, column: number): boolean {
    return column >= 0 && column < 7 && board[0][column] === null;
}

function getLegalColumns(board: Board): number[] {
    return Array.from({ length: 7 }, (_, column) => column).filter(column => isLegalMove(board, column));
}

function isBoardFull(board: Board): boolean {
    return getLegalColumns(board).length === 0;
}

function hasWon(board: Board, player: Player): boolean {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];

    for (let row = 0; row < 6; row++) {
        for (let column = 0; column < 7; column++) {
            if (board[row][column] !== player) continue;

            for (const [rowDirection, columnDirection] of directions) {
                let count = 1;

                for (let step = 1; step < 4; step++) {
                    const nextRow = row + rowDirection * step;
                    const nextColumn = column + columnDirection * step;

                    if (nextRow < 0 || nextRow >= 6) break;
                    if (nextColumn < 0 || nextColumn >= 7) break;
                    if (board[nextRow][nextColumn] !== player) break;

                    count++;
                }

                if (count === 4) return true;
            }
        }
    }

    return false;
}


// ============================================================
// ENKEL ROBOT
// ============================================================

function chooseRobotColumn(board: Board): number | null {
    const legalColumns = getLegalColumns(board);

    if (legalColumns.length === 0) return null;

    // 1. Vinn hvis mulig
    for (const column of legalColumns) {
        const testBoard = structuredClone(board);

        dropPiece(testBoard, column, "yellow");

        if (hasWon(testBoard, "yellow")) {
            return column;
        }
    }

    // 2. Blokker spilleren
    for (const column of legalColumns) {
        const testBoard = structuredClone(board);

        dropPiece(testBoard, column, "red");

        if (hasWon(testBoard, "red")) {
            return column;
        }
    }

    // 3. Foretrekk midten
    const preferredColumns = [3, 2, 4, 1, 5, 0, 6];

    return preferredColumns.find(column => legalColumns.includes(column)) ?? legalColumns[0];
}


// ============================================================
// RENDERING
// ============================================================

const model = new AppModel();
const app = document.querySelector<HTMLDivElement>("#app")!;

function renderApp(): void {
    const state = model.getState();

    if (state.page === "overview") {
        renderOverview(state);
    } else {
        renderGamePage(state);
    }
}


function renderOverview(state: AppState): void {
    app.innerHTML = `
        <main class="page">
            <header class="main-header">
                <h1>Fire på rad</h1>
            </header>

            <section class="overview">
                <div class="overview-header">
                    <h2>Spilloversikt</h2>
                    <button class="primary" data-action="new-game">Start nytt spill</button>
                </div>

                <div class="game-list">
                    ${state.games.map(renderGameCard).join("")}
                </div>
            </section>
        </main>
    `;
}


function renderGameCard(game: Game): string {
    const board = createBoardFromMoves(game.moves);

    let status: string;

    if (game.winner === null) {
        status = `<span class="status active">Pågår</span>`;
    } else if (game.winner === "red") {
        status = `<span class="winner"><span class="small-disc red"></span> Du vant</span>`;
    } else if (game.winner === "yellow") {
        status = `<span class="winner"><span class="small-disc yellow"></span> Roboten vant</span>`;
    } else {
        status = `<span class="winner">Uavgjort</span>`;
    }

    const dateText = game.finishedAt
        ? `Avsluttet ${formatDate(game.finishedAt)}`
        : `Startet ${formatDate(game.startedAt)}`;

    return `
        <article class="game-card">
            ${renderBoard(board, false, true)}

            <div class="game-info">
                ${status}
                <div>${dateText}</div>
                <div>${game.moves.length} trekk</div>
            </div>

            <button class="primary" data-action="open-game" data-game-id="${game.id}">
                Åpne
            </button>
        </article>
    `;
}


function renderGamePage(state: AppState): void {
    const game = state.games.find(game => game.id === state.selectedGameId)!;

    const displayedMoves = game.moves.slice(0, state.viewedMove);
    const board = createBoardFromMoves(displayedMoves);

    const isLatestMove = state.viewedMove === game.moves.length;
    const canPlay = game.winner === null && isLatestMove;

    app.innerHTML = `
        <main class="page">
            <header class="game-header">
                <button class="back-button" data-action="back">←</button>
                <h1>Fire på rad</h1>
            </header>

            <section class="game">
                ${renderGameStatus(game, state)}
                ${renderBoard(board, canPlay, false)}
                ${renderMoveNavigation(state.viewedMove, game.moves.length)}
            </section>
        </main>
    `;
}


function renderGameStatus(game: Game, state: AppState): string {
    const isLatestMove = state.viewedMove === game.moves.length;

    if (!isLatestMove) {
        return `<div class="history-status">Viser trekk ${state.viewedMove} av ${game.moves.length}</div>`;
    }

    if (game.winner === "red") {
        return `<div class="game-status"><span class="small-disc red"></span> Du vant</div>`;
    }

    if (game.winner === "yellow") {
        return `<div class="game-status"><span class="small-disc yellow"></span> Roboten vant</div>`;
    }

    if (game.winner === "draw") {
        return `<div class="game-status">Uavgjort</div>`;
    }

    return `<div class="game-status"><span class="small-disc red"></span> Din tur</div>`;
}


function renderBoard(board: Board, interactive: boolean, compact: boolean): string {
    const columns = Array.from({ length: 7 }, (_, columnIndex) => {
        const cells = board.map(row => row[columnIndex]);
        const legal = interactive && isLegalMove(board, columnIndex);

        return `
            <div
                class="board-column ${legal ? "interactive" : ""}"
                ${legal ? `data-action="play-column" data-column="${columnIndex}"` : ""}
            >
                ${cells.map(renderCell).join("")}
            </div>
        `;
    }).join("");

    return `
        <div class="board ${compact ? "compact" : ""}">
            ${columns}
        </div>
    `;
}


function renderCell(cell: Cell): string {
    const value = cell ?? "empty";

    return `
        <div class="cell">
            <div class="disc ${value}"></div>
        </div>
    `;
}


function renderMoveNavigation(currentMove: number, totalMoves: number): string {
    return `
        <div class="move-navigation">
            <button data-action="history-start" ${currentMove === 0 ? "disabled" : ""}>|←</button>
            <button data-action="history-previous" ${currentMove === 0 ? "disabled" : ""}>←</button>
            <button data-action="history-next" ${currentMove === totalMoves ? "disabled" : ""}>→</button>
            <button data-action="history-latest" ${currentMove === totalMoves ? "disabled" : ""}>→|</button>
        </div>
    `;
}


// ============================================================
// EVENT DELEGATION
// ============================================================

app.addEventListener("click", event => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const actionElement = target.closest<HTMLElement>("[data-action]");

    if (!actionElement) return;

    const action = actionElement.dataset.action;

    if (action === "new-game") {
        model.newGame();
    }

    if (action === "open-game") {
        model.openGame(Number(actionElement.dataset.gameId));
    }

    if (action === "back") {
        model.backToOverview();
    }

    if (action === "play-column") {
        model.playColumn(Number(actionElement.dataset.column));
    }

    if (action === "history-start") {
        model.goToStart();
    }

    if (action === "history-previous") {
        model.goToPreviousMove();
    }

    if (action === "history-next") {
        model.goToNextMove();
    }

    if (action === "history-latest") {
        model.goToLatestMove();
    }

    renderApp();
});


// ============================================================
// HJELPEFUNKSJONER
// ============================================================

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("nb-NO", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(value));
}


// ============================================================
// FLYTTET STYLING
// ============================================================

// ============================================================
// START APPEN
// ============================================================

renderApp();