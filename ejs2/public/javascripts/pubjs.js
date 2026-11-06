window.cLog = function(...args){

    const outputDiv = document.getElementById('ConsoleDiv');
    const cmes = document.createElement('p');
    if (outputDiv) {
      cmes.textContent = `${new Date().toLocaleTimeString()}: ${args.join('')}`;
      outputDiv.appendChild(cmes);
      outputDiv.scrollTop = outputDiv.scrollHeight;
    }
}
window.cClean = function() {
    const outputDiv = document.getElementById('ConsoleDiv');
    if(outputDiv) {
        outputDiv.replaceChildren();
    }
}

document.addEventListener('DOMContentLoaded', function () {
  const cleanBtn = document.getElementById('cleanBtn');
  if (cleanBtn) {
    cleanBtn.addEventListener('click', function () {
        cClean();
    });
  }
});