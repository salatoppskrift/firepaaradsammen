import { BoardClass } from "./Board";
import type { Player } from "../types";
export function chooseRobotColumn(board: BoardClass): number | null {
    const legalColumns = getLegalColumns(board);
    console.log(board);

    if (legalColumns.length === 0) return null;

    // 1. Vinn hvis mulig
    for (const column of legalColumns) {
        const testBoard = structuredClone(board);

        testBoard.dropPiece(column, "yellow");       // 2 parametre, ikke 3

        if (hasWon(testBoard, "yellow")) {
            return column;
        }
    }

    // 2. Blokker spilleren
    for (const column of legalColumns) {
        const testBoard = structuredClone(board);

        testBoard.dropPiece(column, "red");

        if (hasWon(testBoard, "red")) {
            return column;
        }
    }

    // 3. Foretrekk midten
    // const preferredColumns = [3, 2, 4, 1, 5, 0, 6];

    // return preferredColumns.find(column => legalColumns.includes(column)) ?? legalColumns[0];
    
    return preferredColumns([3, 2, 4, 1, 5, 0, 6]);
    
    function preferredColumns(columnArray : number[]) {return columnArray.find(column => legalColumns.includes(column)) ?? legalColumns[0]};
}

// Board?
export function hasWon(board: BoardClass, player: Player): boolean {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];

    for (let row = 0; row < 6; row++) {
        for (let column = 0; column < 7; column++) {
            if (board.getBoardPosition(row, column) !== player) continue;

            for (const [rowDirection, columnDirection] of directions) {
                let count = 1;

                for (let step = 1; step < 4; step++) {
                    const nextRow = row + rowDirection * step;
                    const nextColumn = column + columnDirection * step;

                    if (nextRow < 0 || nextRow >= 6) break;
                    if (nextColumn < 0 || nextColumn >= 7) break;
                    if (board.getBoardPosition(nextRow, nextColumn) !== player) break;

                    count++;
                }

                if (count === 4) return true;
            }
        }
    }

    return false;
}
// Hører til Board?
export function getLegalColumns(board: BoardClass): number[] {
    return Array.from({ length: 7 }, (_, column) => column).filter(column => isLegalMove(board, column));
}
// Board
export function isLegalMove(board: BoardClass, column: number): boolean {
    return column >= 0 && column < 7 && board.getBoardPosition(0, column) === null;
}