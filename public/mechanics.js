var self = this;
var loopTimeout;
var audio;
var game = {};
// Settings are stored here as constants.
game.stimuli = { "position": "", "audio": ""};
game.responses = { "position": false, "audio": false};
game.matchChance = 0.25;
game.roundDisplayDuration = 2000;
game.roundTotalDuration = game.roundDisplayDuration + 300;
game.n = 2;
game.maxRounds = 10 + game.n;

// TODO: 
// Make the game fit the screen on any device.
// Make the settings more beautiful.
// Add about section.
// Make the instructions fit the box.
// Add menu/game and game/menu transition animations.
// Add cosmetic improvements to the menu and game screen.
// CLEAN UP THE CODE!!!
// Fix the esc issue in chrome.
// Find better fonts and/or sizes.
// Make the position and audio stop completely when the user stops the game so that they can restart immediately.

self.showGame = function () {
    $("#game-div").show();
    $("#home-div").hide();
}

self.hideGame = function () {
    $("#home-div").show();
    $("#game-div").hide();
    self.showResult();
}

self.cancelGame = function () {
    self.endGame();            
    $("#home-div").show();
    $("#game-div").hide();
    clearTimeout(loopTimeout);
    audio.pause();
    var selector = "#position-" + game.challenges[game.challenges.length - 1]["position"];
    $(selector).removeClass("active-position");
}            

// Game-specific values stored here then deleted
// after each game.
self.initializeGame = function () {
    game.challenges = new Array();
    game.currentRound = 1;
    self.resetScore();
}

self.endGame = function () {
    delete game.challenges;
    delete game.currentRound;
    delete game.currentRoundMatch;
}

self.resetScore = function () {
    game.currentScore = { };
    for (var stimulus in game.stimuli) {
        if (game.stimuli.hasOwnProperty(stimulus)) {
            game.currentScore[stimulus] = {
                correct: 0,
                mistake: 0
            }
        }
    }
}

self.showResult = function () {
    $("#result").show();
    $("#result p").html("(Correct-Mistakes)<br/>");
    var correct = 0, total = 0;
    for (var stimulus in game.currentScore) {
        $("#result p").append("<strong>" + stimulus + ": </strong>" +
            game.currentScore[stimulus].correct + "-" +
            game.currentScore[stimulus].mistake + "<br/>");
        correct += game.currentScore[stimulus].correct;
        total += game.currentScore[stimulus].correct + game.currentScore[stimulus].mistake;
    }
    $("#result p").append("<strong>Total: </strong>" + Math.round(100 * correct / total) + "%");
}

function getRandomArbitrary(min, max, stimulus) {
    if (game.challenges.length >= game.n + 1) {
        if (Math.random() < game.matchChance) {
            return game.challenges[1][stimulus];
        }
    }
    return Math.floor(Math.random() * (max - min) + min);
}

// Creates challenge object and pushes it to
// the game.challenges array.

self.generateChallenges = function () {
    var challenge = {};
    for (var stimulus in game.stimuli) {
        if (game.stimuli.hasOwnProperty(stimulus))
            challenge[stimulus] = getRandomArbitrary(1, 9, stimulus);
    }
    if (game.challenges.length >= game.n + 1) {
        game.challenges.shift();
    }
    game.challenges.push(challenge);
};

// Checks match between stimuli in corresponding
// challenges and stores the boolean for each stimulus
// in game.currentRoundMatch.

self.verifyMatch = function () {
    game.currentRoundMatch = {};
    for (var stimulus in game.stimuli) {
        if (game.stimuli.hasOwnProperty(stimulus))
            game.currentRoundMatch[stimulus] =
                game.challenges[0][stimulus] === game.challenges[game.n][stimulus];
    }
};

// Calls each stimulus displayer function one after the other.
self.displayChallenge = function () {
    if (game.stimuli.hasOwnProperty("position"))
        self.displayPosition();
    if (game.stimuli.hasOwnProperty("audio"))
        self.playAudio();

    setTimeout(self.resetFeedback, game.roundDisplayDuration);
    setTimeout(self.checkMissed, game.roundDisplayDuration);
    setTimeout(function(){
        document.onkeypress = function(key){
            if(key.key == "Escape")
                self.cancelGame();
         }}, game.roundDisplayDuration);
};

self.displayPosition = function () {
    var selector = "#position-" + game.challenges[game.challenges.length - 1]["position"];
    $(selector).addClass("active-position");
    setTimeout(function () {
        $(selector).removeClass("active-position");
    }, game.roundDisplayDuration);
}

self.playAudio = function () {
    // TODO: Ajust audo volume.
    audio = new Audio("audio/audio-" +
        game.challenges[game.challenges.length - 1].audio + ".wav");
    audio.play();
}
// Applies a feedback class to the stimulus selector based on the response.

self.displayFeedback = function(stimulus) {
    var selector = "#" + stimulus + "-match";
    if (game.responses[stimulus] && game.currentRoundMatch[stimulus])
        $(selector).addClass("feedback-true");
    else if (!game.responses[stimulus] &&
        game.currentRoundMatch[stimulus])
        $(selector).addClass("feedback-missed");
    else $(selector).addClass("feedback-false");
}

// Removes all feedback classes from all selectors.
self.resetFeedback = function () {
    for (var stimulus in game.stimuli) {
        var selector = "#" + stimulus + "-match";
        $(selector).removeClass("feedback-true feedback-false feedback-missed");
    }
}

self.getResponse = function (key) {
    // Wires the keypress event to change the
    // stimuli response status and immediately
    // displays feedback.
    switch (key.key) {
        case 'l':
            stimulus = 'audio';
            game.responses['audio'] = true;
            self.calculateScore(stimulus);
            break;
        case 'a':
            stimulus = 'position';
            game.responses['position'] = true;
            self.calculateScore(stimulus);
            break;
        case "Escape":
            self.cancelGame();
            break;
    }
};

self.resetResponses = function () {
    for (var stimulus in game.stimuli )
        game.responses[stimulus] = false;
}

self.calculateScore = function (stimulus) {
    displayFeedback(stimulus);
    if (game.currentRoundMatch[stimulus] !== game.responses[stimulus]) {
        game.currentScore[stimulus].mistake += 1;
        return false;
    } else if (game.currentRoundMatch[stimulus]) {
        game.currentScore[stimulus].correct += 1;
        return true;
    }
};

self.checkMissed = function () {
    for (var stimulus in game.stimuli) {
        if (!game.responses[stimulus] && game.currentRoundMatch[stimulus]) {
            game.currentScore[stimulus].mistake += 1;
            self.displayFeedback(stimulus);
        }
    }
}

function loopRound() {
    self.resetFeedback();
    self.generateChallenges();
    if (game.challenges.length === game.n + 1)
        verifyMatch();
    self.resetResponses();
    self.displayChallenge();
    document.onkeypress = self.getResponse;

    document.getElementById("remaining").lastChild.textContent =
        game.maxRounds - game.currentRound + 1;
    game.currentRound += 1;
    if (game.currentRound <= game.maxRounds) {
        loopTimeout = setTimeout(loopRound, game.roundTotalDuration);
    } else {
        loopTimeout = setTimeout(function () {
            self.endGame();
            self.hideGame();
        }, game.roundTotalDuration);
    }
};

var runGame = function () {
    self.initializeGame();
    self.showGame();

    //Runs the game
    loopRound();
};
