-- Add departments
INSERT INTO
    department (name)
VALUES
    ('Sales'),
    ('Engineering'),
    ('HR');

-- Add roles
INSERT INTO
    role (title, salary, department_id)
VALUES
    ('Sales Manager', 80000, 1),
    ('Software Engineer', 100000, 2),
    ('HR Manager', 75000, 3);

-- Add employees
INSERT INTO
    employee (first_name, last_name, role_id, manager_id)
VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1),
    ('Mark', 'Taylor', 3, NULL);