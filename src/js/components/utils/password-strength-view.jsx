import { Component } from 'react';

class PasswordStrength extends Component {
  counter = (password) => {
    let strength = 0
    if (password.length >= 8)
        strength += 1

    if (password.match(/(?=.*[0-9])/))
        strength += 1

    if (password.match(/(?=.*[!,%,&,@,#,$,^,*,?,_,~,<,>,])/))
        strength += 1

    if (password.match(/(?=.*[a-z])/))
        strength += 1

    if (password.match(/(?=.*[A-Z])/))
        strength += 1

     return strength
  }

  render() {
    const {password} = this.props
    let counter = this.counter(password)
    let clazz = 'password-strength-value';

    if (counter == 1) {
          clazz += ' danger-20';

      } else if (counter == 2) {
          clazz += ' danger-40';

      } else if (counter == 3) {
          clazz += ' danger-60';

      } else if (counter == 4) {
          clazz += ' warning-80';
          
      } else if (counter == 5) {
          clazz += ' safe-100';
      }
 
    return  <div className='center mb-3'>Password strength
              <div className="form-group">
                <div className="progress password-strength-bar">
                  <div className={clazz}></div>
                </div>                  
              </div>
            </div>    
  }
}

export default PasswordStrength