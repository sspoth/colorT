document.addEventListener("DOMContentLoaded", () => {
	const width = 10;
	const grid = document.querySelector(".grid");
	let squares = Array.from(document.querySelectorAll(".grid div"));
	const scoreDisplay = document.querySelector("#score");
	const startBtn = document.querySelector("#start-button");
	let nextRandom = 0;
	let timerId;
	let score = 0;
	const colors = [
		"blue",
		"orange",
		"green",
		"red",
		"magenta",
		"yellow",
		"cyan"
	];
	let reserved = 0;
	let randomTet = -1;
	let paused = false;

	//BLUE RICKY
	const jTetromino = [
		[1, width + 1, width * 2 + 1, 2],
		[width, width + 1, width + 2, width * 2 + 2],
		[1, width + 1, width * 2 + 1, width * 2],
		[width, width * 2, width * 2 + 1, width * 2 + 2]
	];
	//ORANGE RICKY
	const lTetromino = [
		[0, width + 1, width * 2 + 1, 1],
		[width, width + 1, width + 2, width * 2],
		[1, width + 1, width * 2 + 1, width * 2 + 2],
		[width + 2, width * 2, width * 2 + 1, width * 2 + 2]
	];
	//RHODE ISLAND Z
	const sTetromino = [
		[0, width, width + 1, width * 2 + 1],
		[width + 1, width + 2, width * 2, width * 2 + 1],
		[0, width, width + 1, width * 2 + 1],
		[width + 1, width + 2, width * 2, width * 2 + 1]
	];
	//CLEVELAND Z
	const zTetromino = [
		[1, width, width + 1, width * 2],
		[width, width - 1, width * 2, width * 2 + 1],
		[1, width, width + 1, width * 2],
		[width, width - 1, width * 2, width * 2 + 1]
	];
	//TEEWEE
	const tTetromino = [
		[1, width, width + 1, width + 2],
		[1, width + 1, width + 2, width * 2 + 1],
		[width, width + 1, width + 2, width * 2 + 1],
		[1, width, width + 1, width * 2 + 1]
	];
	//SMASHBOY
	const oTetromino = [
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1]
	];
	//HERO
	const iTetromino = [
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3],
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3]
	];

	const theTetrominoes = [
		jTetromino,
		lTetromino,
		sTetromino,
		zTetromino,
		tTetromino,
		oTetromino,
		iTetromino
	];
	let currentPosition = 4;
	let currentRotation = 0;
	let random = Math.floor(Math.random() * theTetrominoes.length);
	let current = theTetrominoes[random][currentRotation];

	function draw() {
		current.forEach((index) => {
			squares[currentPosition + index].classList.add("tetromino");
			squares[currentPosition + index].style.backgroundColor = colors[random];
		});
	}

	function undraw() {
		current.forEach((index) => {
			squares[currentPosition + index].classList.remove("tetromino");
			squares[currentPosition + index].style.backgroundColor = "";
		});
	}

	function control(e) {
		if (!paused) {
			if (e.keyCode === 37) {
				moveLeft();
			} else if (e.keyCode === 38) {
				rotate();
			} else if (e.keyCode === 39) {
				moveRight();
			} else if (e.keyCode === 40) {
				moveDown();
			} else if (e.keyCode === 82) {
				reserveTetromino();
			}
		}
	}

	//document.addEventListener("keyup", control);
	document.addEventListener("keydown", control);

	function moveDown() {
		undraw();
		currentPosition += width;
		if (
			current.some((index) =>
				squares[currentPosition + index].classList.contains("taken")
			)
		) {
			currentPosition -= width;
			freeze();
		}
		draw();
	}

	function freeze() {
		undraw();
		current.forEach((index) => {
			squares[currentPosition + index].classList.add("taken");
			squares[currentPosition + index].style.backgroundColor = colors[random];
		});
		uploadToCurrent();
		reserved = 1;
		addScore();
		draw();
		displayShape();
		gameOver();
	}

	function uploadToCurrent() {
		random = nextRandom;
		//creates the next tetromino
		nextRandom = Math.floor(Math.random() * theTetrominoes.length);
		currentRotation = 0;
		//uploads the display tetromino and resets current position and draws it
		current = theTetrominoes[random][currentRotation];

		currentPosition = 4;
	}

	function moveLeft() {
		undraw();
		const isAtLeftEdge = current.some(
			(index) => (currentPosition + index) % width === 0
		);
		if (!isAtLeftEdge) currentPosition -= 1;

		if (
			current.some((index) =>
				squares[currentPosition + index].classList.contains("taken")
			)
		) {
			currentPosition += 1;
		}
		draw();
	}

	function moveRight() {
		undraw();
		const isAtRightEdge = current.some(
			(index) => (currentPosition + index) % width === width - 1
		);
		if (!isAtRightEdge) currentPosition += 1;

		if (
			current.some((index) =>
				squares[currentPosition + index].classList.contains("taken")
			)
		) {
			currentPosition -= 1;
		}
		draw();
	}

	///FIX ROTATION OF TETROMINOS A THE EDGE
	function isAtRight() {
		return current.some((index) => (currentPosition + index + 1) % width === 0);
	}

	function isAtLeft() {
		return current.some((index) => (currentPosition + index) % width === 0);
	}

	function checkRotatedPosition(P) {
		P = P || currentPosition; //get current position.  Then, check if the piece is near the left side.
		if ((P + 1) % width < 4) {
			//add 1 because the position index can be 1 less than where the piece is (with how they are indexed).
			if (isAtRight()) {
				//use actual position to check if it's flipped over to right side
				currentPosition += 1; //if so, add one to wrap it back around
				checkRotatedPosition(P); //check again.  Pass position from start, since long block might need to move more.
			}
		} else if (P % width > 5) {
			if (isAtLeft()) {
				currentPosition -= 1;
				checkRotatedPosition(P);
			}
		}
	}

	function rotate() {
		let tempRot = currentRotation + 1;
		if (tempRot === theTetrominoes[random].length) tempRot = 0;
		let temp = theTetrominoes[random][tempRot];

		if (
			!temp.some((index) =>
				squares[currentPosition + index].classList.contains("taken")
			)
		) {
			undraw();
			currentRotation++;
			if (currentRotation === theTetrominoes[random].length)
				currentRotation = 0;
			current = theTetrominoes[random][currentRotation];

			checkRotatedPosition();
			draw();
		}
	}

	const displaySquares = document.querySelectorAll(".mini-grid div");
	const displayWidth = 4;
	let displayIndex = 0;

	const upNextTetrominoes = [
		[1, displayWidth + 1, displayWidth * 2 + 1, 2], //jTetromino
		[1, displayWidth + 1, displayWidth * 2 + 1, 0], //lTetromino
		[0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //sTetromino
		[1, displayWidth, displayWidth + 1, displayWidth * 2], //zTetromino
		[1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
		[0, 1, displayWidth, displayWidth + 1], //oTetromino
		[1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] //iTetromino
	];

	function displayShape() {
		displaySquares.forEach((square) => {
			square.classList.remove("tetromino");
			square.style.backgroundColor = "";
		});
		upNextTetrominoes[nextRandom].forEach((index) => {
			displaySquares[displayIndex + index].classList.add("tetromino");
			displaySquares[displayIndex + index].style.backgroundColor =
				colors[nextRandom];
		});
	}

	startBtn.addEventListener("click", () => {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
			paused = true;
		} else {
			paused = false;
			draw();
			timerId = setInterval(moveDown, 1000);

			displayShape();
		}
	});

	function addScore() {
		for (let i = 0; i < 199; i += width) {
			const row = [
				i,
				i + 1,
				i + 2,
				i + 3,
				i + 4,
				i + 5,
				i + 6,
				i + 7,
				i + 8,
				i + 9
			];
			if (row.every((index) => squares[index].classList.contains("taken"))) {
				score += 10;
				scoreDisplay.innerHTML = score;
				row.forEach((index) => {
					squares[index].classList.remove("taken");
					squares[index].classList.remove("tetromino");
					squares[index].style.backgroundColor = "";
				});
				const squaresRemoved = squares.splice(i, width);
				squares = squaresRemoved.concat(squares);
				squares.forEach((cell) => grid.appendChild(cell));
			}
		}
	}
	function gameOver() {
		if (
			current.some((index) =>
				squares[currentPosition + index].classList.contains("taken")
			)
		) {
			scoreDisplay.innerHTML = "end";
			clearInterval(timerId);
		}
	}
	const reserveSquares = document.querySelectorAll(".reserve-grid div");

	function reserveTetromino() {
		//when there is no block in reserve
		if (randomTet < 0) {
			reserved = 2;
			randomTet = random;
			console.log(randomTet);
			undraw();
			uploadToCurrent();
			draw();
			upNextTetrominoes[randomTet].forEach((index) => {
				reserveSquares[displayIndex + index].classList.add("tetromino");
				reserveSquares[displayIndex + index].style.backgroundColor =
					colors[randomTet];
			});
			displayShape();
		} else if (reserved === 1) {
			reserved = 2;
			undraw();
			reserveSquares.forEach((square) => {
				square.classList.remove("tetromino");
				square.style.backgroundColor = "";
			});
			upNextTetrominoes[random].forEach((index) => {
				reserveSquares[displayIndex + index].classList.add("tetromino");
				reserveSquares[displayIndex + index].style.backgroundColor =
					colors[random];
			});

			currentRotation = 0;
			var tempRandom = random;
			current = theTetrominoes[randomTet][currentRotation];
			currentPosition = 4;
			console.log(randomTet);
			random = randomTet;
			randomTet = tempRandom;
			draw();
		}
	}
});
