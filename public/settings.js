(function(window) {

    // Check that settings were not previously stored.
    // localStorage should only contain 3 setting items
    // and 1 audio array. (Audio loaded after settings)
    if (localStorage.length === 0) {
        localStorage.setItem('n-setting', 2);
        localStorage.setItem('rounds-setting', 15);
        localStorage.setItem('round-duration-setting', 2000);

        document.getElementById('n-setting').value = 2;
        document.getElementById('rounds-setting').value = 15;
        document.getElementById('round-duration-setting').value = 2000;
    } else {
        let nSetting = localStorage.getItem('n-setting');
        let roundSetting = localStorage.getItem('rounds-setting');
        let durationSetting = localStorage.getItem('round-duration-setting');

        document.getElementById('n-setting').value = nSetting;
        document.getElementById('rounds-setting').value = roundSetting;
        document.getElementById('round-duration-setting').value = durationSetting;
    }

    document.getElementById('instructions-button').onclick = function toggleInstructions() {
        var ins = document.getElementById('instructions');
        ins.hidden = ins.hidden ? false : true;
    };

    document.getElementById('settings-button').onclick = function showSettings() {
        document.getElementById('settings-table').hidden = false;
        document.getElementById('hide-settings-button').hidden = false;
    };

    document.getElementById('hide-settings-button').onclick = function hideSettings(e) {
        e.cancelBubble = true;
        document.getElementById('settings-table').hidden = true;
        document.getElementById('hide-settings-button').hidden = true;
    };

    document.getElementById('n-setting').onchange = function changeN(e) {
        const N = e.target.value;
        localStorage.setItem('n-setting', N);

        document.getElementById('setting-added-n').innerText = '+' + N;
        document.getElementById('header-n').innerText = N;
    };

    document.getElementById('rounds-setting').onchange = function change(e) {
        const rounds = e.target.value;
        localStorage.setItem('rounds-setting', rounds);
    };

    document.getElementById('round-duration-setting').onchange = function changeN(e) {
        const duration = e.target.value;
        localStorage.setItem('round-duration-setting', duration);
    };

})(window)
