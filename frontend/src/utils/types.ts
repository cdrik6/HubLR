export interface userType {
		id: number;
		username: string;
		email: string;
		avatarURL: string | null;
		is_active: boolean;
}

export interface Player {
    id?: number,
    alias: string
}

export interface GameSettings {
    tournamentId: string,
    local: boolean,
    multi: boolean,
    options: GameOptions,
    players: {
        player1: Player,
        player2: Player,
        player3: Player,
        player4: Player
    },
    viewers: Array<Player>
}

export interface GameOptions {
    speedy: boolean,
    paddy: boolean,
    wally: boolean,
    mirry: boolean
}

export interface LobbyGameSettings {
	type: string, //1v1 - multi - tournament
    options: GameOptions
}

export interface gameLobby {
    id: string,
    size: number,
    host: Player,
    players: Array<Player>,
    settings: LobbyGameSettings,
    isOngoing: boolean,
    sessionId: string
}

export interface Point {
	x: number,
	y: number
}

export interface Box {
	display: boolean,
	x: number,
	y: number,
	player: string,
	rightLine: Array<Point> | null,
	leftLine: Array<Point> | null
}

export interface TournamentSettings {
    id: string,
    size: number,
    players: Array<Player>,
    matches: Array<Array<Array<Player | null>>>,
    current: Array<Array<Array<Player | null>>>,
    winner: Player | null
}
