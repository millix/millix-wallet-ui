/* const password_strength = function(password_input_selector, password, strength) {
    window.addEventListener('DOMContentLoaded', () => {
        let password_input = document.querySelector(password_input_selector);
        let strength_bar = document.createElement('div');
        strength_bar.style.cssText = "display: block; height: 0.4rem; width:100%; background: RGB(120, 120, 130); border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem; transition: height 0.3s;";
        password_input.before(strength_bar);
        let strength_color = document.createElement('div');
        strength_color.style.cssText = "width:0; height: 100%; display: block; transition: width 0.3s; border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem;";
        strength_bar.appendChild(strength_color);
 
        
            function passwordCheck(password) {
              if (password.length >= 8)
                strength += 1;
          
              if (password.match(/(?=.*[0-9])/))
                strength += 1;
          
              if (password.match(/(?=.*[!,%,&,@,#,$,^,*,?,_,~,<,>,])/))
                strength += 1;
          
              if (password.match(/(?=.*[a-z])/))
                strength += 1;
          
              if (password.match(/(?=.*[A-Z])/))
                strength += 1;
          
              displayBar(strength);
            }
          
            function displayBar(strength) {
              switch (strength) {
                case 1:
                  strength_color.style.width = '20%'
                  strength_color.style.background = '#de1616'
                  break;
          
                case 2:
                  strength_color.style.width = '40%'
                  strength_color.style.background = '#de1616'                  
                  break;
          
                case 3:
                  strength_color.style.width = '60%'
                  strength_color.style.background = '#de1616'
                  break;
          
                case 4:
                  strength_color.style.width = '80%'
                  strength_color.style.background = '#FFA200'
                  break;
          
                case 5:
                  strength_color.style.width = '100%'
                  strength_color.style.background = '#06bf06'
                  break;
          
                default:
                  strength_color.style.width = '0'
                  strength_color.style.background = '#de1616'
              }
            }

            function init() {
                strength = 0;
                let password = password_input.value;
                passwordCheck(password);
            }


                password_strength.init = init;
    });
};
 */
function passwordCheck(password_input_selector, password, strength) {
  
  
  let password_input = document.querySelector(password_input_selector);
  

    function displayBar(strength) {
      if(password_input.nextElementSibling.tagName == 'DIV') {
        password_input.nextElementSibling.innerHTML = strength
      } else {
        let strength_bar = document.createElement('div');
        password_input.after(strength_bar);
        strength_bar.innerHTML = strength;
      }

    }

  if (password.length >= 8)
    strength += 1;

  if (password.match(/(?=.*[0-9])/))
    strength += 1;

  if (password.match(/(?=.*[!,%,&,@,#,$,^,*,?,_,~,<,>,])/))
    strength += 1;

  if (password.match(/(?=.*[a-z])/))
    strength += 1;

  if (password.match(/(?=.*[A-Z])/))
    strength += 1;

    displayBar(strength);
}

export default passwordCheck;