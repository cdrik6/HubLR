import {MAXPLAYERS} from "./maxPlayers.mjs";

function computePowerOfTwo(max) {
	let powerOfTwo = [];
	let current = 1;
	while (current <= max) {
		powerOfTwo.push(current);
		current*=2;
	}
	return powerOfTwo;
}

export const powerOfTwo = computePowerOfTwo(MAXPLAYERS);