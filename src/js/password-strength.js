const password_strength = function(password_input_selector) {
    window.addEventListener('DOMContentLoaded', () => {
        let password_input = document.querySelector(password_input_selector);
        let strength_bar = document.createElement('div');
        strength_bar.style.cssText = "display: block; height:0px; width:100%; background: RGB(120, 120, 130); border-top-left-radius: 4px; border-top-right-radius: 4px; transition: height 0.3s;";
        password_input.before(strength_bar);
        let strength_color = document.createElement('div');
        strength_color.style.cssText = "width:0px; height: 100%; display: block; transition: width 0.3s; border-top-left-radius: 4px; border-top-right-radius: 4px;";
        strength_bar.appendChild(strength_color);
        let strength;
        
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

            password_input.addEventListener('focus', function() {
                strength_bar.style.height = '7px';
            });

            password_input.addEventListener('blur', function() {
              strength_bar.style.height = '0px';
            });
          
            password_input.addEventListener('keyup', function(){
                strength = 0;
                let password = password_input.value;
                passwordCheck(password);
            });
    });
};

export default password_strength;