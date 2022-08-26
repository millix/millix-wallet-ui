import { Component } from 'react';

class PasswordCheck extends Component {

  counter = (password, strength) => {
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
    const {password, strength} = this.props
    return <h1>Password strength = {this.counter(password, strength)}</h1>    
  }
}

export default PasswordCheck