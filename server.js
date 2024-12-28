const inquirer = require("inquirer");
const db = require("./db"); // Assuming your db.js file exists and is properly set up

// Main menu function
const mainMenu = async () => {
  // Ask the user what action they want to perform
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Exit",
      ],
    },
  ]);

  // Handle the action based on the user selection
  switch (action) {
    case "View all departments":
      viewDepartments();
      break;
    case "View all roles":
      viewRoles();
      break;
    case "View all employees":
      viewEmployees();
      break;
    case "Add a department":
      addDepartment();
      break;
    case "Add a role":
      addRole();
      break;
    case "Add an employee":
      addEmployee();
      break;
    case "Update an employee role":
      updateEmployeeRole();
      break;
    case "Exit":
      console.log("Goodbye!");
      process.exit(); // Exit the program
      break;
    default:
      console.log("Invalid action");
      mainMenu(); // Prompt the user again
      break;
  }
};

// Function to view all departments
const viewDepartments = async () => {
  console.log("Viewing all departments...");
  const res = await db.query("SELECT * FROM department");
  console.table(res.rows); // Show departments in a table
  mainMenu(); // After action, return to main menu
};

// Function to view all roles
const viewRoles = async () => {
  console.log("Viewing all roles...");
  const res = await db.query(
    "SELECT role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id"
  );
  console.table(res.rows); // Show roles in a table
  mainMenu();
};

// Function to view all employees
const viewEmployees = async () => {
  console.log("Viewing all employees...");
  const res = await db.query(`
        SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON manager.id = employee.manager_id
    `);
  console.table(res.rows); // Show employees in a table
  mainMenu();
};

// Function to add a new department
const addDepartment = async () => {
  const { name } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter the name of the new department:",
    },
  ]);
  await db.query("INSERT INTO department (name) VALUES ($1)", [name]);
  console.log(`Department "${name}" added successfully!`);
  mainMenu();
};

// Function to add a new role
const addRole = async () => {
  const departments = await db.query("SELECT * FROM department");
  const departmentChoices = departments.rows.map((department) => ({
    name: department.name,
    value: department.id,
  }));

  const { title, salary, department_id } = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Enter the title of the new role:",
    },
    {
      type: "input",
      name: "salary",
      message: "Enter the salary of the new role:",
    },
    {
      type: "list",
      name: "department_id",
      message: "Select the department for this role:",
      choices: departmentChoices,
    },
  ]);

  await db.query(
    "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
    [title, salary, department_id]
  );
  console.log(`Role "${title}" added successfully!`);
  mainMenu();
};

// Function to add a new employee
const addEmployee = async () => {
  const roles = await db.query("SELECT * FROM role");
  const roleChoices = roles.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const managers = await db.query(
    "SELECT * FROM employee WHERE manager_id IS NULL"
  );
  const managerChoices = managers.rows.map((manager) => ({
    name: `${manager.first_name} ${manager.last_name}`,
    value: manager.id,
  }));

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    {
      type: "input",
      name: "first_name",
      message: "Enter the first name of the new employee:",
    },
    {
      type: "input",
      name: "last_name",
      message: "Enter the last name of the new employee:",
    },
    {
      type: "list",
      name: "role_id",
      message: "Select the role for this employee:",
      choices: roleChoices,
    },
    {
      type: "list",
      name: "manager_id",
      message: "Select the manager for this employee:",
      choices: managerChoices,
      when: () => managerChoices.length > 0, // Only show manager options if there are managers
    },
  ]);

  await db.query(
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
    [first_name, last_name, role_id, manager_id || null]
  );
  console.log(`Employee "${first_name} ${last_name}" added successfully!`);
  mainMenu();
};

// Function to update an employee's role
const updateEmployeeRole = async () => {
  const employees = await db.query("SELECT * FROM employee");
  const employeeChoices = employees.rows.map((employee) => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  const roles = await db.query("SELECT * FROM role");
  const roleChoices = roles.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const { employee_id, role_id } = await inquirer.prompt([
    {
      type: "list",
      name: "employee_id",
      message: "Select an employee to update:",
      choices: employeeChoices,
    },
    {
      type: "list",
      name: "role_id",
      message: "Select the new role for this employee:",
      choices: roleChoices,
    },
  ]);

  await db.query("UPDATE employee SET role_id = $1 WHERE id = $2", [
    role_id,
    employee_id,
  ]);
  console.log(`Employee's role updated successfully!`);
  mainMenu();
};

// Start the application by showing the main menu
mainMenu();
