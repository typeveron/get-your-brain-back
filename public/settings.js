function showInstructions() {
    $("#instructions").show();
    $("#instructions-link").hide();
}

function hideInstructions() {
    $("#instructions").hide();
    $("#instructions-link").show();
}

function toggleInstructions() {
	var ins = document.getElementById('instructions');
	if (ins.hidden)
		ins.hidden = false;
	else
	    ins.hidden = true;
}

function showSettings() {
	document.getElementById('settings-table').hidden = false;
	document.getElementById('hide-settings-button').hidden = false;
}

function hideSettings() {
	document.getElementById('settings-table').hidden = true;
	document.getElementById('hide-settings-button').hidden = true;
}

function setDefaultSettings() {
	document.getElementById('n-back').value = 2;
	document.getElementById('rounds').value = 10;
	document.getElementById('round-duration').value = 2000;
}

function changeSetting (setting) {
	if (setting.id === 'n-back') {
		document.getElementById('setting-added-n').innerText = '+' + setting.value;
		document.getElementById('header-n').innerText = setting.value;
		game.maxRounds = game.maxRounds - game.n + Number(setting.value);
		game.n = Number(setting.value);
				
	} else if (setting.id === 'rounds') {
		game.maxRounds = Number(setting.value) + game.n;
		
	} else if (setting.id === 'round-duration') {
		game.roundDisplayDuration = Number(setting.value);
		
	}
}
