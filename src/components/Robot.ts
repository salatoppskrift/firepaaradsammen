import { dropPiece } from "./Board";
import type { Board, Player } from "../types";
export function chooseRobotColumn(board: Board): number | null {
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

export function hasWon(board: Board, player: Player): boolean {
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
export function getLegalColumns(board: Board): number[] {
    return Array.from({ length: 7 }, (_, column) => column).filter(column => isLegalMove(board, column));
}
export function isLegalMove(board: Board, column: number): boolean {
    return column >= 0 && column < 7 && board[0][column] === null;
}