/*********************************************************************************
*  WEB700 – Assignment 05
*  Name: Lavatharini Jasinthakumar
*  Online (Heroku) Link: https://web-app-assign5-f74a8ece768e.herokuapp.com/
*
************************************************************************************/

var express = require("express");
var path = require("path");
var exphbs = require('express-handlebars');
var collegeData = require("./modules/collegeData");
var app = express();

// Custom Handlebars helpers
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    helpers: {
        navLink: function(url, options) {
            return '<li class="nav-item' + ((url == app.locals.activeRoute) ? ' active' : '') + '">' +
                '<a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});

// Configure Handlebars
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for incoming request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware for setting active route
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    console.log("Active route:", app.locals.activeRoute);
    next();
});

// Root route to serve the home page
app.get("/", (req, res) => {
    res.render('home');
});

// Route to serve the about page
app.get("/about", (req, res) => {
    res.render('about');  
});

// Route to serve the html page
app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo'); 
});

// Route to retrieve and display students
app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course)
            .then((students) => {
                if (students.length > 0) {
                    res.render("students", { students: students });
                } else {
                    res.render("students", { message: "no results" });
                }
            })
            .catch((error) => {
                res.render("students", { message: "Failed to retrieve students: " + error });
            });
    } else {
        collegeData.getAllStudents()
            .then((students) => {
                if (students.length > 0) {
                    res.render("students", { students: students });
                } else {
                    res.render("students", { message: "no results" });
                }
            })
            .catch((error) => {
                res.render("students", { message: "Failed to retrieve students: " + error });
            });
    }
});

// Routes for student management
app.get("/students/add", (req, res) => {
    collegeData.getCourses()
        .then((data) => {
            res.render("addStudent", { courses: data });
        })
        .catch((err) => {
            console.error("Error retrieving courses:", err);
            res.render("addStudent", { courses: [] });
        });
});

app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Failed to add student: " + err);
        });
});

app.get("/student/:studentNum", (req, res) => {
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum)
        .then((studentData) => {
            if (studentData) {
                viewData.student = studentData; // Store student data in the "viewData" object as "student"
                return collegeData.getCourses();
            } else {
                throw new Error('No student found');
            }
        })
        .then((courses) => {
            viewData.courses = courses; // Store course data in the "viewData" object as "courses"
            // Loop through viewData.courses and add a "selected" property to the matching course
            for (let course of viewData.courses) {
                if (course.courseId === viewData.student.course) {
                    course.selected = true;
                }
            }
            res.render("student", { viewData }); // Render the "student" view
        })
        .catch((err) => {
            console.error("Error fetching student or courses:", err);
            res.status(500).send("Error processing your request");
        });
});

app.get("/student/delete/:studentNum", (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            console.error("Error removing student:", err);
            res.status(500).send("Unable to Remove Student / Student not found");
        });
});

// Routes for course management
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            if (courses.length > 0) {
                res.render("courses", { courses: courses });
            } else {
                res.render("courses", { message: "no results" });
            }
        })
        .catch((error) => {
            res.render("courses", { message: "Failed to retrieve courses: " + error });
        });
});

app.get("/courses/add", (req, res) => res.render('addCourse'));

app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => res.redirect("/courses"))
        .catch(err => res.status(500).send("Failed to add course: " + err));
});

app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => res.redirect("/courses"))
        .catch(err => res.status(500).send("Failed to update course: " + err));
});

app.get("/course/delete/:id", (req, res) => {
    collegeData.deleteCourseById(req.params.id)
        .then(() => res.redirect("/courses"))
        .catch(err => res.status(500).send("Failed to delete course: " + err));
});

app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then(course => {
            if (course) {
                res.render('course', { course });
            } else {
                res.status(404).send("Course Not Found");
            }
        })
        .catch(err => res.status(404).send("Course not found"));
});

// Initialize the data and start the server
collegeData.initialize().then(() => {
    app.listen(process.env.PORT || 8080, () => {
        console.log(`Server is running on port ${process.env.PORT || 8080}`);
    });
}).catch(err => {
    console.error("Failed to start server:", err);
});
