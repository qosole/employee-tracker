const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table')

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
require('dotenv').config();
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    console.log(`
    ┏━━━━━━━━━━━━━━━━━━┓
    ┃ Employee Tracker ┃
    ┗━━━∩━━━━━━━━━━━∩━━┛
        \\  (!u_u!) /
    `)
  );


// This function prompts for user input.
const menuPrompt = () => {
  // Prompting for user input
  const menuChoices = [
    '1. View all departments',
    '2. View all roles',
    '3. View all employees',
    '4. Add a department',
    '5. Add a role',
    '6. Add an employee',
    "7. Update an employee's role",
    '8. Quit'
  ]
  inquirer.prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      choices: menuChoices,
      name: 'userChoice'
    }
  ]).then(data => {

    // Viewing all departments
    if (data.userChoice == menuChoices[0]) {
      db.query('SELECT * FROM departments', (err, results) => {
        if (err) { console.log(err); }
        console.log(''); // Line break for formatting
        console.table(results); 
      })
      setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break
    }

    // Viewing all roles
    if (data.userChoice == menuChoices[1]) {
      db.query('SELECT * FROM roles', (err, results) => {
        if (err) { console.log(err); }
        console.log(''); // Line break for formatting
        // Replacing department_id with dep_name so the user can more easily read it
        for (let i = 0; i < results.length; i++) {
          
          if (results[i]['department_id'] == 1) {
            // Renaming the department_id key to department and setting the appropriate value
            const newObj = Object.keys(results[i]).reduce((acc, val) => {
              if (val == 'department_id') {
                acc['department'] = 'Sales';
              } else {
                acc[val] = results[i][val];
              }
              return acc;
            }, {});
            results[i] = newObj;
          }
          
          if (results[i]['department_id'] == 2) {
            // Renaming the department_id key to department and setting the appropriate value
            const newObj = Object.keys(results[i]).reduce((acc, val) => {
              if (val == 'department_id') {
                acc['department'] = 'Engineering';
              } else {
                acc[val] = results[i][val];
              }
              return acc;
            }, {});
            results[i] = newObj;
          }
          
          if (results[i]['department_id'] == 3) {
            // Renaming the department_id key to department and setting the appropriate value
            const newObj = Object.keys(results[i]).reduce((acc, val) => {
              if (val == 'department_id') {
                acc['department'] = 'Finance';
              } else {
                acc[val] = results[i][val];
              }
              return acc;
            }, {});
            results[i] = newObj;
          }
          
          if (results[i]['department_id'] == 4) {
            // Renaming the department_id key to department and setting the appropriate value
            const newObj = Object.keys(results[i]).reduce((acc, val) => {
              if (val == 'department_id') {
                acc['department'] = 'Legal';
              } else {
                acc[val] = results[i][val];
              }
              return acc;
            }, {});
            results[i] = newObj;
          }
        }
        console.log(results);
        console.table(results);
      })
      setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break
    }

    // Viewing all employees
    if (data.userChoice == menuChoices[2]) {
      menuPrompt();
    }
    // Adding a department
    if (data.userChoice == menuChoices[3]) {
      menuPrompt();
    }
    // Adding a role
    if (data.userChoice == menuChoices[4]) {
      menuPrompt();
    }
    // Adding an employee
    if (data.userChoice == menuChoices[5]) {
      menuPrompt();
    }
    // Updating an employee's role
    if (data.userChoice == menuChoices[6]) {
      menuPrompt();
    }
    // Quit
    if (data.userChoice == menuChoices[7]) {
      process.exit(0);
    }
  })
}

menuPrompt();