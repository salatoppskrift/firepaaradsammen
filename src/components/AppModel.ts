// import { BaseComponent } from "./BaseComponent";
import { isLegalMove, hasWon, chooseRobotColumn, getLegalColumns } from "./Robot";
import { createBoardFromMoves } from "./Board";
import type { AppState, Game, Winner, Board } from "../types";

export class AppModel /*extends BaseComponen*/ {
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
    constructor() {
        // super();
    }
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

        function isBoardFull(board: Board): boolean {
            return getLegalColumns(board).length === 0;
        }
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
// protected render(): void {}
// }