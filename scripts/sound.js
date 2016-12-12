var Sounds = {};

Sounds.volume = 1;

Sounds.play = (soundTagId, volumeOverride)  => {
	var instance = $(soundTagId).cloneNode();
	var vol = volumeOverride || Sounds.volume;
	if(Sounds.volume > 1){
		Sounds.volume = 1;
	} else if(Sounds.volume < 0){
		Sounds.volume = 0;
	}
	instance.volume = vol;
	instance.play();
};