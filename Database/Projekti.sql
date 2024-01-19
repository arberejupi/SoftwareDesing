create database University
use University2

create table Role(
roleId int not null identity(1,1),
roleName varchar(30) not null primary key
);
select * from Role
insert into Role values ('string')
CREATE TABLE [Users] (
    [user_id] INT IDENTITY(1,1) PRIMARY KEY,
	name Varchar(5000) NOT NULL,
	surname Varchar(500) not null,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
	refreshToken varchar(500) not null,
	tokenCreated datetime2 not null,
	tokenExpires datetime2 not null,
	roleName varchar(30) not null foreign key references Role(roleName),
);



CREATE TABLE University (
    university_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
	abbreviation VARCHAR(20), 
    established_year INT, 
    location VARCHAR(100), 
    website_url VARCHAR(255), 
    contact_email VARCHAR(100), 
    contact_phone VARCHAR(20), 
    accreditation_status VARCHAR(50), 
    ranking INT, 
);

Create table Management (
	management_id int identity(1,1) Primary Key,
	position varchar(255),
	[user_id] int,
	FOREIGN KEY ([user_id]) REFERENCES [Users]([user_id])
);

CREATE TABLE Department (
    department_id INT IDENTITY(1,1) PRIMARY KEY,
    university_id INT,
    name VARCHAR(255) NOT NULL,
	abbreviation VARCHAR(20), 
    head_of_department VARCHAR(100), 
    established_year INT, 
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    FOREIGN KEY (university_id) REFERENCES University(university_id)
);
CREATE TABLE Teacher (
    teacher_id INT IDENTITY(1,1) PRIMARY KEY,
    department_id INT,
    user_id INT,
    office_location VARCHAR(100), -- Office location of the teacher
    office_hours VARCHAR(255), -- Office hours for the teacher
    academic_rank VARCHAR(50), -- Academic rank or title (e.g., Professor, Associate Professor)
    research_interests VARCHAR(255), -- Research interests of the teacher
    FOREIGN KEY (department_id) REFERENCES Department(department_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Course (
    course_id INT IDENTITY(1,1) PRIMARY KEY,
    department_id INT,
    teacher_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20), -- Course code or identifier
    description varchar(500), -- Description of the course
    credit_hours INT, -- Number of credit hours for the course
    start_date datetime, -- Start date of the course
    end_date datetime, -- End date of the course
    FOREIGN KEY (department_id) REFERENCES Department(department_id),
    FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id)
);


CREATE TABLE Faculty (
    faculty_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
	office_location VARCHAR(100), -- Office location of the faculty member
    office_hours VARCHAR(255), -- Office hours for the faculty member
    academic_rank VARCHAR(50), -- Academic rank or title (e.g., Professor, Associate Professor)
    research_interests VARCHAR(255), -- Research interests of the faculty member
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

CREATE TABLE Student (
    student_id INT IDENTITY(1,1) PRIMARY KEY,
	[user_id] INT,
	date_of_birth DATE, -- Date of birth of the student
    gender CHAR(1), -- Gender of the student (M/F/O for Male/Female/Other)
    email VARCHAR(100), -- Email address of the student
    phone_number VARCHAR(20), -- Phone number of the student
    address VARCHAR(255), -- Address of the student
    FOREIGN KEY ([user_id]) REFERENCES [Users]([user_id])
);

CREATE TABLE Room (
    room_number INT IDENTITY(1,1) PRIMARY KEY,
    capacity INT NOT NULL,
    equipment VARCHAR(255),
	building_name VARCHAR(100), 
    floor_number INT, -- Floor number within the building
    room_type VARCHAR(50), -- Type of room (e.g., lecture hall, lab, office)
);

CREATE TABLE Schedule (
    schedule_id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT,
	daytime datetime,
    room_number INT,
    FOREIGN KEY (course_id) REFERENCES Course(course_id),
    FOREIGN KEY (room_number) REFERENCES Room(room_number)
);

CREATE TABLE Enrollment (
    enrollment_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT,
    course_id INT,
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);


-- Many-to-Many relationship table for Faculty and Course
CREATE TABLE Faculty_Course (
    faculty_id INT,
    course_id INT,
    PRIMARY KEY (faculty_id, course_id),
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

select * from Users