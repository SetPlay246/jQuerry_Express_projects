/*
const btn1 = document.getElementById('myBtn1');
  if (btn1) {
    btn1.addEventListener('click', function () {

    });
  }
*/

document.addEventListener('DOMContentLoaded', function () {
  const btn1 = document.getElementById('myBtn1');
  if (btn1) {
    btn1.addEventListener('click', function () {
    
        let x = 5;
        let y = 7;
        let abc = 7.5;

        cLog(`x=${x};`);
        cLog(`y=${y};`);
        cLog(` abc=${abc}`);
    });
  }
  const btn2 = document.getElementById('myBtn2');
  if (btn2) {
    btn2.addEventListener('click', function () {
    
        let i=-5;
        let d=7.3;
        let str="Hello";
        let b_1=false;
        let b_2=true;

        cLog(i);
        cLog(d);
        cLog(str);
        cLog(b_1);
        clog(b_2);
    });
  }
  const btn3 = document.getElementById('myBtn3');
  if (btn3) {
    btn3.addEventListener('click', function () {
      let x = 5;
      let y = 7.5

      cLog(x + y);
      cLog(x - y);
      cLog(x * y);
      cLog(x / y);
      cLog(x % y);
    });
  }
  const btn4 = document.getElementById('myBtn4');
  if (btn4) {
    btn4.addEventListener('click', function () {
      let str_1 = "23";
      let str_2 = "12";

      cLog(str_1+str_2);
      cLog(parseInt(str_1, 10)+parseInt(str_2, 10));
    });
  }
  const btn5 = document.getElementById('myBtn5');
  if (btn5) {
    btn5.addEventListener('click', function () {
      let x = 5;
      let y = 10;
      let b = x < y;  
      cLog(b);
      cLog(!b);
      
      cLog("b1 b2 !b1 & || ^")
      for(b1 = 0; b1 < 2; b1++) {
        for(b2 = 0; b2 < 2; b2++) {
          cLog(`${b1}__${b2}__${+!b1}___${+b1&&b2}_${b1||b2}__${b1^b2}`)
        }
      }
    });
  }
  const btn6 = document.getElementById('myBtn6');
  if (btn6) {
    btn6.addEventListener('click', function () {
      for(let i = 0; i < 10; i++) {
        cLog(i);
        if(i == 0){
          cLog("шин нет на складе");
        }
        else {
          cLog("шин нет на складе");
        }
        if(0<i && i<4)
        {
          cLog("нет полного комплекта");
        }
      }
    });
  }
  const btn7 = document.getElementById('myBtn7');
  if (btn7) {
    btn7.addEventListener('click', function () {
      for(let i = 0; i < 5; i++) {
        switch(i)
        {
          case 0:
            cLog(i, " шин на складе");
            break;
          case 1:
            cLog(i, " шина на складе");
            break;
          case 2:
            cLog(i, " шина на складе");
            break;
          default:
            cLog("много шин на складе");
            break;
        }
      }
    });
  }
  const btn8 = document.getElementById('myBtn8');
  if (btn8) {
    btn8.addEventListener('click', function () {
      let i = 1;
      let kol = 101;
      while(i < kol)
      {
        cLog("i=",i);
        i++;
      }
    });
  }
  const btn9 = document.getElementById('myBtn9');
  if (btn9) {
    btn9.addEventListener('click', function () {
      let i = 0
      do {
        if(i % 3 != 0)
        {
          cLog(i);
        }
        if(i == 8)
        {
          break;
        }
        i++;
      } while(i < 11)
    });
  }
  const btn10 = document.getElementById('myBtn10');
  if (btn10) {
    btn10.addEventListener('click', function () {
  
    const arr = [-7.5, 5, 'str', false];
    cLog('Массив: ', arr);

    const found = arr.find(item => item === 5);
    cLog('нийти 5: ', found);
      
    cLog('цикл вывод массива: ');
    for (let i = 0; i < arr.length; i++) {
      cLog(`${i}= `, arr[i]);
    }
    //подмасивы
    const numbers0to5 = [];
    for (let i = 0; i <= 5; i++) numbers0to5.push(i);
    const numbers0to10 = [];
    for (let i = 0; i <= 10; i++) numbers0to10.push(i);
    const numbers0to15 = [];
    for (let i = 0; i <= 15; i++) numbers0to15.push(i);
    
    const matrix = [numbers0to5, numbers0to10, numbers0to15];
    cLog('стандартный вывод матрици: ', matrix);
    
    let str = '';
    cLog('матрица циклами: ');
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        str = str + matrix[i][j] + ' ';
      }
      cLog(str);
      str = '';
    }
    });
  }
  const btn11 = document.getElementById('myBtn11');
  if (btn11) {
    btn11.addEventListener('click', function () {
        
    const arr = [15, 7, 8, 10, -5, 0, 1];
    cLog('массив ', arr);

    cLog('длинна ', arr.length);

    cLog('через ; ', arr.join(';'));

    const asc = [...arr].sort((a, b) => a - b);
    cLog('- > + ', asc.join(';'));

    const desc = [...arr].sort((a, b) => b - a);
    cLog('+ > - ', desc.join(';'));

    const countries = ['россия', 'индия', 'турция', 'венгрия', 'франция'];
    const populations = [233, 6442, 53, 244, 533];

    
    const newWin = window.open('', '_blank');

    newWin.document.write(`<h1>Страны и население</h1>`)
    for (let i = 0; i < countries.length; i++) {
      newWin.document.write(`<p>${countries[i]} — ${populations[i]} млн чел.</p>`);
    }
    });
  }
});






