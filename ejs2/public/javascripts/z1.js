
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('myBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      //alert('Кнопка нажата!');
    
        let x = 5;
        let y = 7;
        let abc = 7.5;

        cLog(`x=${x};`);
        cLog(`y=${y};`);
        cLog(` abc=${abc}`);
        // console.log(`x=${x};`);
        // console.log(`y=${y};`);
        // console.log(` abc=${abc}`);
    });
  }
});






