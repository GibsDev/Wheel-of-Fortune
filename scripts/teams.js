
var Teams = {};

Teams.teams = [];

Teams.isGameOver = false;

Teams.teamColors = ['#c00', '#e6e600', '#002db3'];

for(var i = 0; i < 3; i++){
	Teams.teams.push(new Team('Team ' + (i + 1), Teams.teamColors[i]));
	$('teams').appendChild(Teams.teams[i].element);
}

Teams.currentTeam = Teams.teams[0];

Teams.currentTeam.select();

Teams.next = () => {
	var index = (Teams.teams.indexOf(Teams.currentTeam) + 1) % Teams.teams.length;
	Teams.currentTeam = Teams.teams[index];
	Teams.currentTeam.select();
};

Teams.previous = () => {
	var index = ((Teams.teams.indexOf(Teams.currentTeam) - 1) + Teams.teams.length) % Teams.teams.length;
	Teams.currentTeam = Teams.teams[index];
	Teams.currentTeam.select();
};

Teams.saveToBank = () => {
	Teams.teams.forEach((team) => {
		if(!Teams.isGameOver){
			if(team == Teams.currentTeam){
				team.addBank(team.score);
			}
			team.setScore(0);
		}
	});
};

Teams.gameOver = () => {
	if(Teams.isGameOver){
		return;
	}
	Teams.isGameOver = true;
	var winner = [Teams.teams[0]];
	Teams.teams.forEach((team) => {
		team.setScore(team.bank);
		team.element.removeChild(team.element.children[3]);
	});
	Teams.teams.forEach((team) => {
		if(team.score > winner[0].score){
			winner = [team];

		} else if (team.score == winner[0].score){
			winner.push(team);
		}
		team.element.className = '';
	});
	winner.forEach((winner) => {
		winner.element.className = 'winner';
	});
	for(var i = 0; i < 6; i++){
		setTimeout(() => {
			Sounds.play('ding');
		}, i * 150);
	}
};

function Team(name, color){
	this.score = 0;
	this.bank = 0;
	this.name = name;
	this.element = document.createElement('div');
	this.element.style.background = color;
	this.nameElement = document.createElement('h2');
	this.scoreElement = document.createElement('h1');
	this.bankElement = document.createElement('h2');
	this.nameChangeElement = document.createElement('input');

	this.select = () => {
		Teams.currentTeam = this;
		Teams.teams.forEach((team) => {
			team.element.className = '';
		});
		this.element.className = 'selected';
	};

	this.setScore = (score) => {
		this.score = score;
		this.scoreElement.innerHTML = '$' + score;
	};

	this.addScore = (score) => {
		this.setScore(this.score + score);
	};


	this.setBank = (amount) => {
		this.bank = amount;
		this.bankElement.innerHTML = '$' + amount;
	};

	this.addBank = (amount) => {
		this.setBank(this.bank + amount);
	};

	this.element.appendChild(this.nameElement);
	this.element.appendChild(this.nameChangeElement);
	this.element.appendChild(this.scoreElement);
	this.element.appendChild(this.bankElement);

	this.nameElement.addEventListener('click', () => {
		this.nameChangeElement.style.display = 'block';
		this.nameElement.style.display = 'none';
		this.nameChangeElement.value = this.name;
		this.nameChangeElement.style.fontSize = window.getComputedStyle(this.nameElement, null).getPropertyValue('font-size');
		this.nameChangeElement.select();
	});

	this.nameChangeElement.addEventListener('keypress', (e) => {
		if(e.key == 'Enter'){
			this.nameChangeElement.style.display = 'none';
			this.nameElement.style.display = 'block';
			this.name = this.nameChangeElement.value;
			this.nameElement.innerHTML = this.name;
		}
	});
	
	this.element.addEventListener('click', (e) => {
		this.select();
	});

	this.nameChangeElement.style.type = 'text';
	this.nameChangeElement.style.display = 'none';

	this.nameElement.innerHTML = this.name;
	this.setScore(0);
	this.setBank(0);

	return this;
}
