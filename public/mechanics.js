(function(window) {

    var loopTimeout;
    var audio;
    var game = {};
    // Settings are stored here as constants.
    game.stimuli = { "position": "", "audio": ""};
    game.responses = { "position": false, "audio": false};
    game.matchChance = 0.25;

    document.getElementById('start-button').onclick = function runGame() {
        initializeGame();
        showGame();

        //Runs the game
        loopRound();
    };

    let initializeGame = function() {
        game.challenges = new Array();
        game.currentRound = 1;

        // Reset every game because localStorage does not fire storage event
        game.n = Number(localStorage.getItem('n-setting'));
        game.maxRounds = Number(localStorage.getItem('rounds-setting')) + game.n;
        game.roundDisplayDuration = Number(localStorage.getItem('round-duration-setting'));
        game.roundTotalDuration = game.roundDisplayDuration + 300;
        console.log(game);
        resetScore();
    };

    let showGame = function() {
        $("#game-div").show();
        $("#home-div").hide();
    };

    let hideGame = function() {
        $("#home-div").show();
        $("#game-div").hide();
        showResult();
    }

    let cancelGame = function() {
        endGame();
        $("#home-div").show();
        $("#game-div").hide();
        clearTimeout(loopTimeout);
        audio.pause();
        var selector = "#position-" + game.challenges[game.challenges.length - 1]["position"];
        $(selector).removeClass("active-position");
    }

    // Game-specific values stored here then deleted
    // after each game.

    let endGame = function() {
        delete game.challenges;
        delete game.currentRound;
        delete game.currentRoundMatch;
    }

    let resetScore = function() {
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

    let showResult = function() {
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

    let getRandomArbitrary = function(min, max, stimulus) {
        if (game.challenges.length >= game.n + 1) {
            if (Math.random() < game.matchChance) {
                return game.challenges[1][stimulus];
            }
        }
        return Math.floor(Math.random() * (max - min) + min);
    }

    // Creates challenge object and pushes it to
    // the game.challenges array.

    let generateChallenges = function() {
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

    let verifyMatch = function() {
        game.currentRoundMatch = {};
        for (var stimulus in game.stimuli) {
            if (game.stimuli.hasOwnProperty(stimulus))
                game.currentRoundMatch[stimulus] =
                    game.challenges[0][stimulus] === game.challenges[game.n][stimulus];
        }
    };

    // Calls each stimulus displayer function one after the other.
    let displayChallenge = function() {
        if (game.stimuli.hasOwnProperty("position"))
            displayPosition();
        if (game.stimuli.hasOwnProperty("audio"))
            playAudio();

        setTimeout(resetFeedback, game.roundDisplayDuration);
        setTimeout(checkMissed, game.roundDisplayDuration);
        setTimeout(function(){
            document.onkeypress = function(key){
                if(key.key == "Escape")
                    cancelGame();
             }}, game.roundDisplayDuration);
    };

    let displayPosition = function() {
        var selector = "#position-" + game.challenges[game.challenges.length - 1]["position"];
        $(selector).addClass("active-position");
        setTimeout(function() {
            $(selector).removeClass("active-position");
        }, game.roundDisplayDuration);
    }

    let playAudio = function() {
        // TODO: Ajust audo volume.
        audio = new Audio("audio/audio-" +
            game.challenges[game.challenges.length - 1].audio + ".wav");
        audio.play();
    }

    // Applies a feedback class to the stimulus selector based on the response.

    let displayFeedback = function(stimulus) {
        var selector = "#" + stimulus + "-match";
        if (game.responses[stimulus] && game.currentRoundMatch[stimulus])
            $(selector).addClass("feedback-true");
        else if (!game.responses[stimulus] &&
            game.currentRoundMatch[stimulus])
            $(selector).addClass("feedback-missed");
        else $(selector).addClass("feedback-false");
    }

    // Removes all feedback classes from all selectors.
    let resetFeedback = function() {
        for (var stimulus in game.stimuli) {
            var selector = "#" + stimulus + "-match";
            $(selector).removeClass("feedback-true feedback-false feedback-missed");
        }
    }

    let getResponse = function(key) {
        // Wires the keypress event to change the
        // stimuli response status and immediately
        // displays feedback.
        switch (key.key) {
            case 'l':
                stimulus = 'audio';
                game.responses['audio'] = true;
                calculateScore(stimulus);
                break;
            case 'a':
                stimulus = 'position';
                game.responses['position'] = true;
                calculateScore(stimulus);
                break;
            case "Escape":
                cancelGame();
                break;
        }
    };

    let resetResponses = function() {
        for (var stimulus in game.stimuli )
            game.responses[stimulus] = false;
    }

    let calculateScore = function(stimulus) {
        displayFeedback(stimulus);
        if (game.currentRoundMatch[stimulus] !== game.responses[stimulus]) {
            game.currentScore[stimulus].mistake += 1;
            return false;
        } else if (game.currentRoundMatch[stimulus]) {
            game.currentScore[stimulus].correct += 1;
            return true;
        }
    };

    let checkMissed = function() {
        for (var stimulus in game.stimuli) {
            if (!game.responses[stimulus] && game.currentRoundMatch[stimulus]) {
                game.currentScore[stimulus].mistake += 1;
                displayFeedback(stimulus);
            }
        }
    }

    let loopRound = function() {
        resetFeedback();
        generateChallenges();
        if (game.challenges.length === game.n + 1)
            verifyMatch();
        resetResponses();
        displayChallenge();
        document.onkeypress = getResponse;

        document.getElementById("remaining").lastChild.textContent =
            game.maxRounds - game.currentRound + 1;
        game.currentRound += 1;
        if (game.currentRound <= game.maxRounds) {
            loopTimeout = setTimeout(loopRound, game.roundTotalDuration);
        } else {
            loopTimeout = setTimeout(function() {
                endGame();
                hideGame();
            }, game.roundTotalDuration);
        }
    };

    // Load audio last to prevent loading from blocking the UI.
    // Now whole page only loads after audio is fully loaded.
    // Would ideally load concurrently to maximize convenience.
    audio = [
        new Audio('audio/audio-1.wav'),
        new Audio('audio/audio-2.wav'),
        new Audio('audio/audio-3.wav'),
        new Audio('audio/audio-4.wav'),
        new Audio('audio/audio-5.wav'),
        new Audio('audio/audio-6.wav'),
        new Audio('audio/audio-7.wav'),
        new Audio('audio/audio-8.wav'),
        new Audio('audio/audio-9.wav')
    ];
})(window)
