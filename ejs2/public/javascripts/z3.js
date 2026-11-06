
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('myBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      
    {
      let z1 = 0;
      for(i = 1; i < 101; i++) {
        z1 += i;
      }
      cLog("z1: ", z1);
    }

    {
      let i = 0
      let res = '';
      do {
        if(i % 3 != 0)
        {
          res += i + ' ';
        }
        if(i == 8)
        {
          break;
        }
        i++;
      } while(i < 11)
        cLog("z2: ", res);
    }

    {
      let res = 1;
      let yar = 10;
      for (let i = 1; i <= yar; i++) {
        res *= i;
      }
      cLog('z3: ', res);
    }

    {
      let res = "";
      for (let i = 1; i <= 20; i++) {
        const div3 = i % 3 === 0;
        const div5 = i % 5 === 0;

        if (div3 === div5) {
          continue;
        }
        res += i + " ";
      }
      cLog("z4: ", res)
    }
    
    {
      let sum = 0;

      for (let i = 1; i <= 50; i++) {
        if (i % 7 !== 0) {
          continue;
        }
        sum += i;
        if (sum > 100) {
          cLog(`z5: sum>100, i=${i} sum=${sum}`);
          break;
        }
      }
    }
    });
  }
});






