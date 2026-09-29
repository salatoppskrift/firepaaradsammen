export type Player = "red" | "yellow";
export type Winner = Player | "draw" | null;
export type Cell = Player | null;
export type Board = Cell[][];
export type Page = "overview" | "game";

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