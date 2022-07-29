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
      // Selecting roles table but changing the department_id column to department for user readability
      db.query('SELECT roles.id, roles.title, departments.dep_name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id', (err, results) => {
        if (err) { console.log(err); }
        console.log(''); // Line break for formatting
        console.table(results);
      });
      setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break
    }

    // Viewing all employees
    if (data.userChoice == menuChoices[2]) {
      // Selecting employees table but changing the role_id column to title, changing manager_id column to manager, and adding the data from the roles table for user readability
      db.query('SELECT employees1.id, employees1.first_name, employees1.last_name, roles.title, departments.dep_name AS department, roles.salary, CONCAT(employees2.first_name, " ", employees2.last_name) AS manager FROM employees employees1 JOIN roles ON employees1.role_id = roles.id JOIN departments ON roles.department_id = departments.id LEFT JOIN employees employees2 ON employees1.manager_id = employees2.id;', (err, results) => {
        if (err) { console.log(err); }
        console.log(''); // Line break for formatting
        console.table(results);
      })
      setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break
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