// For checking load puzzle animations
var puzzleLoads = 0;

var guessedLetters = [];

function Board(board, puzzles){
	board.panels = [];
	board.guessedLetters = [];
	// Generate cells
	for(var i = 0; i < 56; i++){
		var panel = document.createElement('p');
		if(i == 0 || i == 13 || i == 42 ||i == 55){
			panel.className = 'corner';
		} else {
			board.panels.push(panel);
		}
		board.children[Math.floor(i / 14)].appendChild(panel);
	}
	board.puzzleIndex = null;
	board.puzzles = puzzles;

	board.getCurrentPuzzle = () => {
		return board.puzzles[board.puzzleIndex];
	};

	board.loadPuzzle = (puzzleIndex) => {
		puzzleLoads++;
		board.puzzleIndex = puzzleIndex;
		board.guessedLetters = [];
		var catagory = board.puzzles[puzzleIndex][0];
		var letters = board.puzzles[puzzleIndex][1];
		var openCounter = 0;
		for(var i = 0; i < letters.length; i++){
			board.panels[i].className = '';
			board.panels[i].letter = null;
			board.panels[i].innerHTML = '';
			if(letters[i] != ' '){
				openCounter++;
				board.panels[i].letter = letters[i].toUpperCase();
				window.setTimeout((panel, loads) => {
					if(puzzleLoads == loads){
						panel.className = 'open';
					}
				}, openCounter * 50, board.panels[i], puzzleLoads);
			}
		}
		$('catagory').innerHTML = catagory.toUpperCase();
		$('letters').forEachChild((letter) => {
			letter.className = '';
		});
		Sounds.play('puzzle-reveal');
		console.clear();
		var hostInfo = board.getCurrentPuzzle()[1];
		while(hostInfo.includes('  ')){
			hostInfo = hostInfo.replace('  ', ' ');
		}
		console.log(hostInfo);
	};

	board.getPanels = (letter) => {
		var panels = [];
		for(var i = 0; i < board.getCurrentPuzzle()[1].length; i++){
			if(letter == board.panels.length){
				panels.push(board.panels[i]);
			}
		}
		return panels;
	};

	board.guessLetter = (letter) => {
		letter = letter.toLowerCase();
		var correct = [];
		for(var i = 0; i < board.getCurrentPuzzle()[1].length; i++){
			if(letter == board.getCurrentPuzzle()[1].toLowerCase().charAt(i)){
				correct.push(board.panels[i]);
			}
		}
		var letterButton = $('letters').children[letter.charCodeAt(0) - 97];
		if(correct.length > 0){
			letterButton.className = 'correctGuessed';
			for(var i = 0; i < correct.length; i++){
				setTimeout((panel, loads) => {
					if(puzzleLoads == loads){
						panel.className = 'highlight';
						Sounds.play('ding');
					}
				}, 1000 * i, correct[i], puzzleLoads);
				setTimeout((panel, letter, loads) => {
					if(puzzleLoads == loads){
						panel.className = 'open';
						panel.innerHTML = letter.toUpperCase();
					}
				}, 1000 * i + 1000, correct[i], letter, puzzleLoads);
			}
		} else {
			Sounds.play('buzzer');
			letterButton.className = 'incorrectGuessed';
		}
		return correct.length;
	};

	board.solve = () => {
		board.panels.forEach((panel) => {
			if(panel.innerHTML == '' && panel.letter != null){
				panel.innerHTML = panel.letter;
			}
		});
		if(Teams.currentTeam.score < 1000){
			Teams.currentTeam.setScore(1000);
		}
		Sounds.play('puzzle-solve');
	};

	board.nextPuzzle = () => {
		if(board.puzzleIndex == null){
			board.puzzleIndex = -1;
		}
		board.puzzleIndex++;
		Teams.saveToBank();
		if(board.puzzleIndex < board.puzzles.length){
			board.loadPuzzle(board.puzzleIndex);
			if(board.puzzleIndex == board.puzzles.length - 1){
				$('next-puzzle').innerHTML = 'LAST PUZZLE!';
			}
		} else {
			Teams.gameOver();
		}
	};
	
	return board;
}