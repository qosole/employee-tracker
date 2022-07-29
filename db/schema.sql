DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE departments(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dep_name VARCHAR(30) NOT NULL
);
CREATE TABLE roles;
CREATE TABLE employees;