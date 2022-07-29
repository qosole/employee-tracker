const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

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
        \\  (!^_^!) /
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
  ];

  // Loading a list of departments, used in "Add a role"
  let departmentChoices = [];
  db.query('SELECT departments.dep_name FROM departments', (err, result) => {
    if (err) { console.log(err); }
    for (let i = 0; i < result.length; i++) {
      departmentChoices.push(result[i].dep_name);
    }
  });

  inquirer.prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      choices: menuChoices,
      name: 'userChoice'
    }
  ]).then(data => {

    // Line break for formatting
    console.log(''); 

    // Viewing all departments
    if (data.userChoice == menuChoices[0]) {
      db.query('SELECT * FROM departments', (err, results) => {
        if (err) { console.log(err); }
        console.table(results);
        setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break 
      });
    }

    // Viewing all roles
    if (data.userChoice == menuChoices[1]) {
      // Selecting roles table but changing the department_id column to department for user readability
      db.query('SELECT roles.id, roles.title, departments.dep_name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id', (err, results) => {
        if (err) { console.log(err); }
        console.table(results);
        setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break
      });
    }

    // Viewing all employees
    if (data.userChoice == menuChoices[2]) {
      // Selecting employees table but changing the role_id column to title, changing manager_id column to manager, and adding the data from the roles table for user readability
      db.query('SELECT all_employees.id, all_employees.first_name, all_employees.last_name, roles.title, departments.dep_name AS department, roles.salary, CONCAT(manager_employees.first_name, " ", manager_employees.last_name) AS manager FROM employees all_employees JOIN roles ON all_employees.role_id = roles.id JOIN departments ON roles.department_id = departments.id LEFT JOIN employees manager_employees ON all_employees.manager_id = manager_employees.id;', (err, results) => {
        if (err) { console.log(err); }
        console.table(results);
        setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break
      });
    }
    // Adding a department
    if (data.userChoice == menuChoices[3]) {
      inquirer.prompt([
        {
          message: 'Enter the name of the department (if you change your mind, enter nothing): ',
          name: 'departmentName'
        }
      ]).then(data => {
        console.log('');
        const trimmedName = data.departmentName.trim();
        if (trimmedName == '') {
          console.log('No department added');
          console.log('');
          setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break
        } else {
          db.query(`INSERT INTO departments(dep_name) VALUES ('${trimmedName}')`, (err, result) => {
            if (err) { console.log(err); }
          });
          console.log(`${trimmedName} successfully added!`);
          console.log('');
          setTimeout(menuPrompt, 100); 
        }
      });
    }
    // Adding a role
    if (data.userChoice == menuChoices[4]) {
      inquirer.prompt([
        {
          message: 'Enter the name of the role (if you change your mind, enter nothing): ',
          name: 'roleName'
        },
        {
          message: 'Enter the salary of the role (if you change your mind, enter nothing): ',
          name: 'roleSalary'
        },
        {
          type: 'list',
          message: 'Which department does the role belong to?',
          choices: departmentChoices,
          name: 'roleDepartment'
        }
      ]).then(data => {
        console.log('');
        const trimmedName = data.roleName.trim();
        const trimmedSalary = data.roleSalary.trim();
        if (trimmedName == '' || trimmedSalary == '') {
          console.log('No role added');
          console.log('');
          setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break
        } else {
          db.query(`INSERT INTO roles(title, department_id, salary) VALUES ('${trimmedName}', ${departmentChoices.indexOf(data.roleDepartment) + 1}, ${trimmedSalary})`, (err, result) => {
            if (err) { console.log(err); }
          });
          console.log(`${trimmedName} successfully added!`);
          console.log('');
          setTimeout(menuPrompt, 100);
        }
      })
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
  });
}

menuPrompt();