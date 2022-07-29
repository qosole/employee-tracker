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

  // Loading a list of roles, used in "Add an employee" and "Update an employee's role"
  let roleChoices = [];
  db.query('SELECT roles.title FROM roles', (err, result) => {
    if (err) { console.log(err); }
    for (let i = 0; i < result.length; i++) {
      roleChoices.push(result[i].title);
    }
  });

  // Loading a list of employees, used in "Add an employee" and "Update an employee's role"
  let employeeChoices = [];
  db.query('SELECT CONCAT(employees.first_name, " ", employees.last_name) AS name FROM employees', (err, result) => {
    if (err) { console.log(err); }
    for (let i = 0; i < result.length; i++) {
      employeeChoices.push(result[i].name);
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
          // departmentChoices.indexOf(data.roleDepartment) + 1 gives the department_id of the user-selected department
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
      inquirer.prompt([
        {
          message: "Enter employee's first name (if you change your mind, enter nothing): ",
          name: 'employeeFirstName'
        },
        {
          message: "Enter employee's last name (if you change your mind, enter nothing): ",
          name: 'employeeLastName'
        },
        {
          type: 'list',
          message: "What is the employee's role?",
          choices: roleChoices,
          name: 'employeeRole'
        },
        {
          type: 'list',
          message: "Who is the employee's manager?",
          choices: employeeChoices.unshift('None'),
          name: 'employeeManager'
        }
      ]).then(data => {
        console.log('');
        const trimmedFirstName = data.employeeFirstName.trim();
        const trimmedLastName = data.employeeLastName.trim();
        if (trimmedFirstName == '' || trimmedLastName == '') {
          console.log('No employee added');
          console.log('');
          setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break
        } else {
          // roleChoices.indexOf(data.employeeRole) + 1 gives the role_id of the user-selected role. Similar idea for manager_id (no +1 because I added a None option to the beginning of the array).
          db.query(`INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES ('${trimmedFirstName}', '${trimmedLastName}', ${roleChoices.indexOf(data.employeeRole) + 1}, ${employeeChoices.indexOf(data.employeeManager)})`, (err, result) => {
            if (err) { console.log(err); }
          });
          console.log(`${trimmedFirstName} ${trimmedLastName} successfully added!`);
          console.log('');
          setTimeout(menuPrompt, 100); 
        }
      });
    }
    // Updating an employee's role
    if (data.userChoice == menuChoices[6]) {
      inquirer.prompt([
        {
          type: 'list',
          message: "Which employee would you like to update?",
          choices: employeeChoices,
          name: 'employeeToUpdate'
        },
        {
          type: 'list',
          message: 'Which role do you want to assign the selected employee?',
          choices: roleChoices,
          name: 'roleToAssign'
        }
      ]).then(data => {
        console.log('');
        // roleChoices.indexOf(data.roleToAssign) + 1 gives the role_id of the user-selected role. Similar idea for employee.id
        db.query(`UPDATE employees SET role_id = ${roleChoices.indexOf(data.roleToAssign) + 1} WHERE id = ${employeeChoices.indexOf(data.employeeToUpdate) + 1}`, (err, result) => {
          if (err) { console.log(err); }
        });
        console.log('Role successfully updated!');
        console.log('');
        setTimeout(menuPrompt, 100); // Looping the menu after a delay so it doesn't break
      });
    }
    // Quit
    if (data.userChoice == menuChoices[7]) {
      process.exit(0);
    }
  });
}

menuPrompt();