export default class Utilities {
  
  static isValidEmail = email => {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );
  };

  static isValidPassword = password => {
    return /^.{6,}$/.test(password);
  };

  static alert = message => {
    alert(message);
  };
}