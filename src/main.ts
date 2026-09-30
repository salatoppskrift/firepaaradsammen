// ============================================================
// TYPES FLYTTET
// ============================================================
import { AppModel } from "./components/AppModel";
import { isLegalMove } from "./components/Robot";
import { BoardClass } from "./components/Board";
import type {AppState, Board, Game, Cell} from "./types";
import styles from "./styles/style.css";

// ============================================================
// FLYTTET APP MODEL TIL EGEN FIL I COMPONENTS
// ============================================================

// ============================================================
// SPILLMOTOR
// ============================================================
// ISLEGAL MOVE FLYTTET
// GETLEGAL COLUMN FLYTTET


// ============================================================
// ENKEL ROBOT FLYTTET
// ============================================================


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
    const board = new BoardClass();

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
            ${renderBoard(board.createBoardFromMoves(game.moves), board, false, true)}

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
    const board = new BoardClass();
    // const boardMoves = board.getBoardPosition();

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
                ${renderBoard(board.createBoardFromMoves(displayedMoves), board, canPlay, false)}
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


function renderBoard(boardMoves: Board, boardClass: BoardClass, interactive: boolean, compact: boolean): string {
    const columns = Array.from({ length: 7 }, (_, columnIndex) => {
        const cells = boardMoves.map(row => row[columnIndex]);
        const legal = interactive && isLegalMove(boardClass, columnIndex);

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