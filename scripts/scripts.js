var wheelWidth = 345;

var wheelHeight = 870;

var vowels = 'aeiou';

var values = ['$250','$1000','BANKRUPT','$700','$500','$800','$300','$2000','$500','$250','$350','LOSE A TURN','$200','$600','BANKRUPT','$500','$200','$550','$400','$200','$900','$250','$300','$900'];

var colors = ['#09f','#f00','#000','#093','#09f','#ff0','#f00','#f0c','#093','#f00','#ff0','#fff','#f90','#093','#000','#f00','#09f','#ff0','#f90','#093','#f00','#ff0','#f90','#093'];

$('wheel').setAttribute('width', wheelWidth);
$('wheel').setAttribute('height', wheelHeight);
$('wheel').style.width = wheelWidth + 'px';
$('wheel').style.height = wheelHeight + 'px';

var wheel = new Spinner($('wheel'), -110, 435, 425, values, colors, $('click'), 0.7);

// Override the spinner handler to handle our special cases
wheel.spinHandler = (value) => {
	if(value == 'BANKRUPT'){
		if(!Teams.isGameOver){
			Sounds.play('bankrupt');
			Teams.currentTeam.setScore(0);
			Teams.next();
		}
	} else if(value == 'LOSE A TURN'){
		Teams.next();
	}
};

$('wheel').addEventListener('click', () => {
	if(!wheel.isSpinning){
		requestAnimationFrame(() => {
			wheel.spin();
		});
	}
});

Tools.shuffle(puzzles);

var board = new Board($('board'), puzzles);

board.nextPuzzle();

resizeDisplay();

// TODO redo this using css grid or flexbox for cells
function resizeDisplay(){
	var w = $('board').contentWidth() / 14;
	var h = w / 3 * 3.75;
	$('board').forEachChild((row) => {
		$(row).forEachChild((cell) => {
			cell.style.height = h + 'px';
			cell.style.fontSize = h * 0.7 + 'px';
			cell.style.lineHeight = h + 'px';
		});
	});
	wheel.repaint();
}

// Generate guessing letters
for(var i = 65; i <= 90; i++){
	var cell = document.createElement('p');
	cell.innerHTML = String.fromCharCode(i);
	$('letters').appendChild(cell);
}

function guessLetter(letter){
	letter = letter.toLowerCase();
	var givePoints = true;
	if(board.guessedLetters.includes(letter)){
		Sounds.play('buzzer');
		return;
	}
	if(vowels.includes(letter)){
		if(Teams.currentTeam.score >= 250){
			Teams.currentTeam.addScore(-250);
			givePoints = false;
		} else {
			Sounds.play('buzzer');
			return;
		}
	}
	var correct = board.guessLetter(letter);
	if(givePoints){
		var wheelVal = parseInt(wheel.getCurrentValue().substring(1));
		Teams.currentTeam.addScore(correct * wheelVal);
	}
	if(correct == 0){
		Teams.next();
	}
	board.guessedLetters.push(letter);
}

// Add event listeners:
$('letters').forEachChild((letter) => {
	letter.addEventListener('click', () => {
		guessLetter(letter.innerHTML);
	});
});

window.addEventListener('resize', resizeDisplay);

window.addEventListener('keydown', (e) => {
	// Block guess key listeners when typing a team name
	if(document.activeElement.tagName.toLowerCase() == 'input'){
		return;
	}
	if(e.keyCode >= 65 && e.keyCode <= 90){
		guessLetter(e.key);
	} else if(e.keyCode == 16) { // shift
		board.solve();
	} else if(e.keyCode == 13) { // enter
		board.nextPuzzle();
	} else if(e.keyCode == 39) { // right arrow
		Teams.next();
	} else if (e.keyCode == 37) { // left arrow
		Teams.previous();
	} else if (e.keyCode == 17) { // left control
		Sounds.play('buzzer');
	} else if (e.keyCode == 32) { // space
		wheel.spin();
	}
});

$('solve').addEventListener('click', board.solve);

$('next-puzzle').addEventListener('click', () => {
	board.nextPuzzle();
});