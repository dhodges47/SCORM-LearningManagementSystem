# SCORM - Learning Management System

This is an open source demonstration of a SCORM LMS (Learning Management System).
It implements the SCORM 1.2 standard (with some support for SCORM 2004).

# Platform
.Net Core 2.1, Entity Framework Core, and SQL Server. I used Visual Studio Community Edition 2017 as the IDE.
The pages are very lightly styled using Bootstrap.

It gives the ability to upload SCORM packages, play the courses in the built-in SCORM Player, and track results by student.

 # How to use this application:
      
   * Use as a base to build your own in-house LMS
   * Use for educational purposes to learn how SCORM works<
   * Use to build your own SCORM Cloud
   * By hosting your own site, you can avoid paying licensing fees to the big SCORM vendors
         
 # Installation
 After cloning this repository, modify appsettings.json with your database information.
 
 After you create your database, you can run the application from Visual Studio for the first time, and it should populate the database for you.
 If not, from the package manager console, run update-database.
 
 # Usage
 
 When you first run the application, follow these steps:
 1. Create a login for yourself
 2. Upload a SCORM package
 3. Add the SCORM course to your courses (Main Menu: "All Courses". Click on your course and then click "Package Details", then click "Add to my study area".
 4. Run the course (Main Menu: My Courses for Study, then click "Launch this course"
 
        
