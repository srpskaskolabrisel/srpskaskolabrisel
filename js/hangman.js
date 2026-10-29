/* Serbian Cyrillic Hangman — page-specific, dependency-free game. */
(function () {
  'use strict';

  var game = document.getElementById('hangman-game');
  if (!game) { return; }

  var alphabet = 'АБВГДЂЕЖЗИЈКЛЉМНЊОПРСТЋУФХЦЧЏШ'.split('');
  var words = [
    { word: 'ПРИЈАТЕЉСТВО', hint: 'Леп однос пун поверења и доброте међу другарима.', topic: 'Другарство' },
    { word: 'ДОБРОДОШЛИЦА', hint: 'Топао поздрав којим дочекујемо госте.', topic: 'Поздрави' },
    { word: 'ЗАЈЕДНИШТВО', hint: 'Када смо сложни и радимо као један тим.', topic: 'Другарство' },
    { word: 'МАШТОВИТОСТ', hint: 'Способност да замишљамо и стварамо нове светове.', topic: 'Особине' },
    { word: 'БИБЛИОТЕКА', hint: 'Место где позајмљујемо књиге и откривамо приче.', topic: 'Школа' },
    { word: 'РАДОЗНАЛОСТ', hint: 'Жеља да постављамо питања и сазнајемо нове ствари.', topic: 'Особине' },
    { word: 'РАЗНОБОЈНОСТ', hint: 'Много различитих боја на једном месту.', topic: 'Описне речи' },
    { word: 'СТРПЉЕЊЕ', hint: 'Способност да мирно сачекамо свој ред.', topic: 'Особине' },
    { word: 'ЋИРИЛИЦА', hint: 'Писмо којим је написана ова реч.', topic: 'Српски језик' },
    { word: 'ПРИРОДЊАК', hint: 'Особа која воли да истражује биљке и животиње.', topic: 'Природа' },
    { word: 'РАЗУМЕВАЊЕ', hint: 'Када пажљиво слушамо и схватамо шта нам неко говори.', topic: 'Другарство' },
    { word: 'УЧИОНИЦА', hint: 'Просторија у којој заједно учимо.', topic: 'Школа' },
    { word: 'ЗАХВАЛНОСТ', hint: 'Осећање које показујемо када ценимо нечију помоћ.', topic: 'Особине' },
    { word: 'АВАНТУРИСТА', hint: 'Особа која воли узбудљива путовања и истраживања.', topic: 'Људи' },
    { word: 'ДОМОВИНА', hint: 'Земља којој припадамо и коју волимо.', topic: 'Србија' },
    { word: 'БРАТСТВО', hint: 'Веза међу људима који се понашају као породица.', topic: 'Другарство' },
    { word: 'ВЕШТИНА', hint: 'Способност да нешто добро урадимо или направимо.', topic: 'Учење' },
    { word: 'ПУТНИК', hint: 'Особа која путује и истражује нова места.', topic: 'Људи' },
    { word: 'ЧУВАЊЕ', hint: 'Када штитимо нешто драго и важно.', topic: 'Вредности' },
    { word: 'СРЕЋА', hint: 'Позитивно осећање које нас радује и испуњава.', topic: 'Осећања' },
    { word: 'ПЕСМА', hint: 'Музички текст који се пева или рецитује.', topic: 'Уметност' },
    { word: 'БУДНОСТ', hint: 'Способност да пажљиво пратиш шта се дешава.', topic: 'Особине' },
    { word: 'ПРИРОДА', hint: 'Све што нас окружује: дрвеће, река, животиње и небо.', topic: 'Природа' },
    { word: 'ИСТИНА', hint: 'Оно што је тачно и засновано на чињеницама.', topic: 'Српски језик' },
    { word: 'ТЕХНИКА', hint: 'Наука и вештина која помаже да направимо корисне ствари.', topic: 'Школа' },
    { word: 'СПОРАЗУМ', hint: 'Када се људи договоре и нађу заједнички пут.', topic: 'Другарство' },
    { word: 'СЛОГА', hint: 'Када се сви сложимо и радимо заједно.', topic: 'Другарство' },
    { word: 'УЧЕЊЕ', hint: 'Процес стицања нових знања и вештина.', topic: 'Школа' },
    { word: 'ЗДРАВЉЕ', hint: 'Стање доброг телесног и душевног благостања.', topic: 'Здравље' },
    { word: 'ПОСЛОВИЦА', hint: 'Кратка мудра изрека која учи људе.', topic: 'Књижевност' },
    { word: 'ЛЕПОТА', hint: 'Уметничка и привлачна лепота која нас радује.', topic: 'Описне речи' },
    { word: 'МУДРОСТ', hint: 'Способност да размишљамо паметно и исправно одлучујемо.', topic: 'Особине' }
  ];
  var wordNode = document.getElementById('hangman-word');
  var hintNode = document.getElementById('hangman-hint');
  var messageNode = document.getElementById('hangman-message');
  var attemptsNode = document.getElementById('hangman-attempts');
  var keyboard = document.getElementById('hangman-keyboard');
  var scoreNode = document.getElementById('hangman-score');
  var newButton = document.getElementById('hangman-new-game');
  var revealButton = document.getElementById('hangman-reveal');
  var parts = Array.prototype.slice.call(game.querySelectorAll('.hangman-part'));
  var previousIndex = -1;
  var current;
  var guesses;
  var wrong;
  var score = 0;
  var finished;

  function chooseWord() {
    var next = Math.floor(Math.random() * words.length);
    if (words.length > 1 && next === previousIndex) { next = (next + 1) % words.length; }
    previousIndex = next;
    current = words[next];
  }

  function renderWord() {
    wordNode.textContent = '';
    current.word.split('').forEach(function (letter, index) {
      var slot = document.createElement('span');
      slot.className = 'hangman-letter' + (guesses.indexOf(letter) !== -1 || finished ? ' is-revealed' : '');
      slot.textContent = guesses.indexOf(letter) !== -1 || finished ? letter : '';
      slot.setAttribute('aria-hidden', 'true');
      wordNode.appendChild(slot);
    });
    wordNode.setAttribute('aria-label', finished ? 'Реч: ' + current.word : 'Скривена реч, ' + current.word.length + ' слова');
  }

  function finish(won) {
    finished = true;
    keyboard.querySelectorAll('button').forEach(function (button) { button.disabled = true; });
    revealButton.disabled = true;
    if (won) {
      score += 1;
      scoreNode.textContent = String(score);
      messageNode.textContent = 'Браво! Погодио/ла си реч „' + current.word + '“!';
      messageNode.classList.add('is-win');
    } else {
      messageNode.textContent = 'Нема више покушаја. Реч је била „' + current.word + '“. Покушај поново!';
      messageNode.classList.add('is-loss');
    }
    renderWord();
  }

  function guess(letter, button) {
    if (finished || guesses.indexOf(letter) !== -1) { return; }
    guesses.push(letter);
    if (button) { button.disabled = true; button.classList.add(current.word.indexOf(letter) !== -1 ? 'is-correct' : 'is-wrong'); }

    if (current.word.indexOf(letter) === -1) {
      wrong += 1;
      parts.forEach(function (part) {
        if (Number(part.getAttribute('data-part')) <= wrong) { part.classList.add('is-visible'); }
      });
      attemptsNode.textContent = 'Преостало покушаја: ' + (8 - wrong);
      messageNode.textContent = 'То слово није у речи. Покушај поново!';
    } else {
      messageNode.textContent = 'Одлично! То слово се налази у речи.';
    }

    renderWord();
    var complete = current.word.split('').every(function (char) { return guesses.indexOf(char) !== -1; });
    if (complete) { finish(true); }
    else if (wrong >= 8) { finish(false); }
  }

  function startGame() {
    chooseWord();
    guesses = [];
    wrong = 0;
    finished = false;
    hintNode.textContent = current.hint;
    attemptsNode.textContent = 'Преостало покушаја: 8';
    messageNode.textContent = 'Изабери прво слово!';
    messageNode.classList.remove('is-win', 'is-loss');
    revealButton.disabled = false;
    parts.forEach(function (part) { part.classList.remove('is-visible'); });
    keyboard.textContent = '';
    alphabet.forEach(function (letter) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'hangman-key';
      button.textContent = letter;
      button.setAttribute('aria-label', 'Слово ' + letter);
      button.addEventListener('click', function () { guess(letter, button); });
      keyboard.appendChild(button);
    });
    renderWord();
  }

  newButton.addEventListener('click', startGame);
  revealButton.addEventListener('click', function () {
    if (!finished) {
      finished = true;
      keyboard.querySelectorAll('button').forEach(function (button) { button.disabled = true; });
      revealButton.disabled = true;
      renderWord();
      messageNode.textContent = 'Решење је „' + current.word + '“. Притисни „Нова реч“ за следећи круг.';
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey || (event.target.closest && event.target.closest('input, textarea, select, [contenteditable="true"]'))) { return; }
    var letter = event.key.toLocaleUpperCase('sr');
    if (alphabet.indexOf(letter) !== -1) {
      var button = keyboard.querySelector('button:nth-child(' + (alphabet.indexOf(letter) + 1) + ')');
      guess(letter, button);
    }
  });

  startGame();
})();
