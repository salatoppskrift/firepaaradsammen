import type { Board, Cell, Player } from "../types";
// import { AppModel } from "./AppModel";

export class BoardClass {
    private board : Board = this.createEmptyBoard();
    constructor() {
    }

    private createEmptyBoard(): Board {
        return Array.from({ length: 6 }, () => Array<Cell>(7).fill(null));
    }

    createBoardFromMoves(moves: number[]): Board {
        moves.forEach((column, index) => {
            const player: Player = index % 2 === 0 ? "red" : "yellow";
            this.dropPiece(column, player);
        });

        return this.board;
    }

    dropPiece(column: number, player: Player): boolean {

        for (let row = this.board.length - 1; row >= 0; row--) {
            if (this.board[row][column] === null) {
                this.board[row][column] = player;
                return true;
            }
        }

        return false;
    }

    getBoardPosition(row: number, column: number)
    {
        return this.board[row][column];
    }
}

// export function createEmptyBoard(): Board {
//     return Array.from({ length: 6 }, () => Array<Cell>(7).fill(null));
// }

// export function createBoardFromMoves(moves: number[]): Board {
//     const board = createEmptyBoard();

//     moves.forEach((column, index) => {
//         const player: Player = index % 2 === 0 ? "red" : "yellow";
//         dropPiece(board, column, player);
//     });

//     return board;
// }

// export function dropPiece(board: Board, column: number, player: Player): boolean {


//     for (let row = board.length - 1; row >= 0; row--) {
//         if (board[row][column] === null) {
//             board[row][column] = player;
//             return true;
//         }
//     }

//     return false;
// }