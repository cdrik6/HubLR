import {Player} from "../utils/types.js";
import {GameOptions} from "../utils/types.js";
import {Point} from "../utils/types.js";
import {Box} from "../utils/types.js";
import { renderTournamentEnd } from "./afterGameMenu.js";
import { inLobby, updateGameSession } from "./lobbies.js";

import {renderPong} from "./pong.js";

function resetBrackets() {
	const appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const brackets = document.createElement('canvas');
	brackets.id = 'brackets';
	appContainer.appendChild(brackets);
}



function displayBrackets(n: number, brackets: Array<Array<Array<Player | null>>>, winner: Player | null) {

	// -------------- Constants -------------- //

	// Canvas && Context
	const canvas = document.getElementById("brackets") as HTMLCanvasElement;
	canvas.height = window.innerHeight - document.getElementById("header")!.clientHeight;
	canvas.width = window.innerWidth;
	const c = canvas.getContext("2d") as CanvasRenderingContext2D;
	
	// Proportions
	const w = canvas.width;
	const h = canvas.height;
	const rectW = w/8;
	const rectH = h/20;
	
	// Styles && Fonts
	const rectDefaultFillStyle = "rgba(100, 200, 200, 0.6)";
	const rectLoserFillStyle = "rgba(253, 9, 29, 0.6)";
	const rectWinnerFillStyle = "rgba(55, 253, 0, 0.6)";
	const rectBigWinnerFillStyle = "rgba(255, 225, 0, 0.6)";
	const textFillStyle = "rgba(0, 0, 0, 1)";
	const textFont = "bold 2vh fira sans";
	c.font = textFont;
	
	// Alignment
	c.textAlign = "center";
	c.textBaseline = "middle";

	// ----------------------------------------- //

	// -------------- Tournament -------------- //

	// Rounds
	function findUpperLimit(n: number) {
		let p = 1;
		while (n > p)
			p*=2;
		return p;
	}

	const upperLimit = findUpperLimit(n);
	const preMatches = 2*n - upperLimit;
	const dispLimit = upperLimit - preMatches;
	const rounds = Math.log(upperLimit)/Math.log(2)

	// ----------------------------------------- //

	// --------------- Computing --------------- //


	function computePlayer(i: number, j: number) {
		if (i == brackets.length)
			return winner !== null ? winner!.alias : "?";
		if (i == 0)
			j -= dispLimit;
		if (j%2 == 0)
			return brackets[i][j/2][0] ? brackets[i][j/2][0]!.alias : "?";
		else
			return brackets[i][Math.floor(j/2)][1] !== null ? brackets[i][Math.floor(j/2)][1]!.alias : "?";
	}

	function computeRightLine(boxes: Array<Array<Box>>, i: number, j: number,
			xCenter: number, yCenter: number, xOffset: number, yOffset: number) {
		if (i == rounds)
			return null;
		let lines = [] as Array<Point>;
		lines.push({x: xCenter+rectW/2, y: yCenter});
		lines.push({x: xCenter+xOffset/2, y: yCenter});
		lines.push({x: xCenter+xOffset/2, y: i ?
			j%2==0 ? (boxes[i - 1][2*j].y + boxes[i - 1][2*j + 3].y) / 2 : (boxes[i][j-1].rightLine as Array<Point>)[(boxes[i][j-1].rightLine as Array<Point>).length - 1].y
			: j%2==0 ? yCenter + yOffset/2:yCenter - yOffset/2});
		return lines;
	}

	function computeLeftLine(boxes: Array<Array<Box>>, i: number, j: number,
			xCenter: number, yCenter: number, xOffset: number) {
		if (i == 0 || !boxes[i - 1][2*j].display)
			return null;
		let lines = [] as Array<Point>;
		lines.push({x: xCenter-rectW/2, y: yCenter});
		lines.push({x: xCenter-xOffset/2, y: yCenter});
		return lines;
	}

	function computeBrackets(boxes: Array<Array<Box>>) {
		const xOffset = w / (rounds+2); // rounds + winner + 1
		const yOffset = h / (upperLimit+1);
		let xCenter = 0;
		let roundsPlayers = upperLimit;
		let display;
		for (let i = 0; i < rounds + 1; i++) {
			boxes.push([]);
			xCenter+=xOffset;
			let yCenter = 0;
			for (let j = 0; j < roundsPlayers; j++) {
				yCenter = i ? (boxes[i - 1][2*j].rightLine as Array<Point>)[2].y : yCenter+yOffset;
				display = (i == 0 && j < dispLimit) ? false : true;
				boxes[i].push({
					display: display,
					x: xCenter, y: yCenter, player: display ? computePlayer(i, j) : "",
					rightLine: computeRightLine(boxes, i, j, xCenter, yCenter, xOffset, yOffset),
					leftLine: computeLeftLine(boxes, i, j, xCenter, yCenter, xOffset)});
			}
			roundsPlayers/=2;
		}
	}

	// ----------------------------------------- //

	// ---------------- Drawing ---------------- //

	function chooseColor(boxes: Array<Array<Box>>, i: number, j: number) {
		if (i == boxes.length - 1) {
			if (boxes[i][j].player != "?")
				return rectBigWinnerFillStyle;
			else
				return rectDefaultFillStyle;
		}
		if (boxes[i + 1][Math.floor(j/2)].player == "?")
			return rectDefaultFillStyle;
		else if (boxes[i + 1][Math.floor(j/2)].player == boxes[i][j].player)
			return rectWinnerFillStyle;
		else
			return rectLoserFillStyle;
	}

	function drawRect(x: number, y: number, fillStyle: string) {
		c.fillStyle = fillStyle;
		c.lineWidth = 1.5;
		c.beginPath();
		c.roundRect(x-rectW/2, y-rectH/2, rectW, rectH, 20);
		c.fill();
		c.stroke();
	}
	
	function drawText(x: number, y: number, text: string) {
		c.fillStyle = textFillStyle;
		c.fillText(text, x, y);
	}
	
	function drawLine(lines: Array<Point>) {
		c.strokeStyle = "#36BFB1";
		c.lineWidth = 3;
		c.beginPath();
		c.moveTo(lines[0].x, lines[0].y);
		for (let i = 1; i < lines.length; i++)
			c.lineTo(lines[i].x, lines[i].y);
		c.stroke();
	}
	
	function drawBrackets(boxes: Array<Array<Box>>) {
		for (let i = 0; i < boxes.length; i++) {
			for (let j = 0; j < boxes[i].length; j++) {
				if (!boxes[i][j].display)
					continue;
				drawRect(boxes[i][j]["x"], boxes[i][j]["y"], chooseColor(boxes, i, j));
				drawText(boxes[i][j]["x"], boxes[i][j]["y"], boxes[i][j]["player"])
				if (boxes[i][j]["rightLine"]) drawLine(boxes[i][j].rightLine as Array<Point>);
				if (boxes[i][j]["leftLine"]) drawLine(boxes[i][j].leftLine as Array<Point>);
			}
		}
	}

	// ----------------------------------------- //

	let boxes = [] as Array<Array<Box>>;
	computeBrackets(boxes);
	drawBrackets(boxes);
}

function displayMatch(player1: string, player2: string) {
	const appContainer = document.getElementById("app");
	if (!appContainer)
		return ;
	appContainer.innerHTML = '';
	const matchAnnouncement = document.createElement('h1');
	matchAnnouncement.classList = 'text-8xl font-medium text-neutral-400';
	matchAnnouncement.textContent = `${player1} VS ${player2}`;
	appContainer.appendChild(matchAnnouncement);
}

export async function startTournament(players: Array<Player>, options: GameOptions, isLocal: boolean = true, existingId: string | null = null) {

	const endpoint = `/api/tournament`;

	let res;
	let tournamentId : string | null = existingId;
	if (!existingId)
	{
		res = await fetch (`${endpoint}/`, {
			method: "POST",
			credentials: "include",
			headers: {"content-type":"application/json"},
			body: JSON.stringify({players: players})
		})
		if (!res.ok)
			return (console.log("Error during tournament launch"));
	
		tournamentId = (await res.json()).tournamentId;
	}

	res = await fetch(`${endpoint}/${tournamentId}`, {credentials:'include'});
	if (!res.ok)
		return (console.log("Error during tournament launch"));
	let tournamentInfo = await res.json();

	updateGameSession(tournamentId);
	while(!tournamentInfo.winner) {
		console.log(location.pathname);		
		resetBrackets();
		displayBrackets(tournamentInfo.size, tournamentInfo.matches, tournamentInfo.winner);
		await new Promise(r => setTimeout(r, 4000));
		res = await fetch(`${endpoint}/${tournamentId}`, {credentials:'include'});
		if (!res.ok) {
			if (res.status == 404)
				return ;
			else
				return (console.log("Error during tournament launch"));
		}

		displayMatch(tournamentInfo.current[0].alias, tournamentInfo.current[1].alias);
		await new Promise(r => setTimeout(r, 4000));
		res = await fetch(`${endpoint}/${tournamentId}`, {credentials:'include'});
		if (!res.ok) {
			if (res.status == 404)
				return ;
			else
				return (console.log("Error during tournament launch"));
		}

		await renderPong({tournamentId: tournamentId!, local:isLocal, multi: false, options: options,
			players: {player1: tournamentInfo.current[0], player2: tournamentInfo.current[1], player3: {alias: ""}, player4: {alias: ""}}, viewers: players})
			
		res = await fetch(`${endpoint}/${tournamentId}`, {credentials:'include'});
		if (!res.ok) {
			if (res.status == 404)
				return ;
			else
				return (console.log("Error during tournament launch"));
		}
		tournamentInfo = await res.json();

	}

	resetBrackets();
	displayBrackets(tournamentInfo.size, tournamentInfo.matches, tournamentInfo.winner);
	await new Promise(r => setTimeout(r, 4000));
	if (isLocal)
		renderTournamentEnd(tournamentId!, isLocal, options);
}