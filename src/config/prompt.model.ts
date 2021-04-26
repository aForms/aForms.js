/**
 * Prompt helps users in customizing the error messages
 * 
 * In the string mention {name} to refer the label and {value} to refer value user entered.
 */
export interface ErrorPrompt {
    empty?                : string;
    checked?              : string;
    email?                : string;
    url?                  : string;
    regExp?               : string;
    integer?              : string;
    decimal?              : string;
    number?               : string;
    is?                   : string;
    isExactly?            : string;
    not?                  : string;
    notExactly?           : string;
    contain?              : string;
    containExactly?       : string;
    doesntContain?        : string;
    doesntContainExactly? : string;
    minLength?            : string;
    length?               : string;
    exactLength?          : string;
    maxLength?            : string;
    match?                : string;
    different?            : string;
    creditCard?           : string;
    minCount?             : string;
    exactCount?           : string;
    maxCount?             : string;
  }
