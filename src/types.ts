export type Player = "red" | "yellow";
export type Winner = Player | "draw" | null;
export type Cell = Player | null;
export type Board = Cell[][];
export type Page = "overview" | "game";
// type ColumnNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Game = {
    id: number;
    startedAt: string;
    finishedAt: string | null;
    winner: Winner;
    moves: number[];
};

export type AppState = {
    page: Page;
    selectedGameId: number | null;
    viewedMove: number;
    games: Game[];
};