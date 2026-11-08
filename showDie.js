function showDie() {
  // Generate a random die face (1-6)
  const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return faces[Math.floor(Math.random() * 6)];
}

function createDieElement() {
  const die = document.createElement('div');
  die.className = 'die';
  die.innerHTML = '⚀';
  die.addEventListener('click', () => {
    die.innerHTML = showDie();
  });
  return die;
}

document.body.appendChild(createDieElement());
