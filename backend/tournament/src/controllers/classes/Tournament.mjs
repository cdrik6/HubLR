import {powerOfTwo} from "../objects/powerOfTwo.mjs";

export class Tournament {
	#id;
	#players;
	#size;
	#shuffledPlayers;
	#matches = [];
	#currentRound = 0;
	#currentMatch = 0;
	#nextWinnerPos;
	#winner = null;

	constructor(id, players) {
		this.#id = id;
		this.#players = players;
		this.#size = players.length;
		this.#shuffledPlayers = Tournament.#shufflePlayers(this.#players);
		this.#createBrackets();
		this.#fillBrackets();
	}

	reset() {
		this.#shuffledPlayers = Tournament.#shufflePlayers(this.#players);
		this.#matches = [];
		this.#currentRound = 0;
		this.#currentMatch = 0;
		this.#winner = null;
		this.#createBrackets();
		this.#fillBrackets();
	}

	get id() {return this.#id}
	get size() {return this.#size}
	get players() {return this.#players}
	get shuffledPlayers() {return this.#shuffledPlayers}
	get matches() {return this.#matches}
	get winner() {return this.#winner}
	get current() {return this.#winner ? null : this.#matches[this.#currentRound][this.#currentMatch]}

	static #shufflePlayers(players) {
		let shuffledPlayers = players.slice();
		for (let i = players.length - 1; i > 0; i--) {
			const rand = Math.floor(Math.random() * (i + 1));
			[shuffledPlayers[i], shuffledPlayers[rand]] = [shuffledPlayers[rand], shuffledPlayers[i]]
		}
		return shuffledPlayers;
	}

	static #findUpperPowerTwo(n) {
		for (let i = 0; i < powerOfTwo.length; i++)
			if (powerOfTwo[i] > n)
				return powerOfTwo[i];
	}

	#createBrackets() {
		let nbMatches = this.#size;
		if (!powerOfTwo.includes(this.#size)) {
			const upperPowerTwo = Tournament.#findUpperPowerTwo(this.#size);
			const lowerPowerTwo = upperPowerTwo/2;
			nbMatches = lowerPowerTwo - (upperPowerTwo - this.#size);
			this.#matches.push(Array(nbMatches).fill().map(a => new Array(2).fill(null)));
			nbMatches = lowerPowerTwo;
		}
		while (nbMatches != 1) {
			nbMatches /= 2;
			this.#matches.push(Array(nbMatches).fill().map(a => new Array(2).fill(null)));
		}
	}

	#fillBrackets() {
		let i = 0;
		for (let j = 0; j < this.#matches[0].length; j++) {
			this.#matches[0][j][0] = this.#shuffledPlayers[i++];
			this.#matches[0][j][1] = this.#shuffledPlayers[i++];
		}
		let j = 0, k = 0;
		while (i < this.#size) {
			this.#matches[1][j][k] = this.#shuffledPlayers[i++];
			if (k) {j++; k=0}
			else {k=1}
		}
		this.#nextWinnerPos = [1, j, k];
	}

	#updateNextWinnerPos() {
		if (this.#nextWinnerPos[2] == 0)
			this.#nextWinnerPos[2] = 1;
		else if (this.#nextWinnerPos[1] != this.#matches[this.#nextWinnerPos[0]].length - 1) {
			this.#nextWinnerPos[2] = 0;
			this.#nextWinnerPos[1]+=1;
		}
		else {
			this.#nextWinnerPos[2] = 0;
			this.#nextWinnerPos[1] = 0;
			this.#nextWinnerPos[0]+=1;
		}
	}

	#updateMatches(winner) {
		this.#matches[this.#nextWinnerPos[0]][this.#nextWinnerPos[1]][this.#nextWinnerPos[2]]
			= winner;
		this.#updateNextWinnerPos();
	}

	#updateCurrent() {
		if (this.#currentMatch != this.#matches[this.#currentRound].length - 1)
			this.#currentMatch++;
		else {
			this.#currentRound++;
			this.#currentMatch = 0;
		}
	}

	update(winner) {
		if (this.#currentRound == this.#matches.length - 1) {
			this.#winner = winner;
			return;
		}
		this.#updateMatches(winner);
		this.#updateCurrent();
	}
}

