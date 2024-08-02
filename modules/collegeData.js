const Sequelize = require('sequelize');
var sequelize = new Sequelize('dee20tk39bnjaf', 'ucdccm5agbjd9r', 'p3159bd67ea6f53d985cc4f3865487870ab4e0d8a5bfd9f26715bca8f1b01771d', {
    host: 'cb5ajfjosdpmil.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    query: {
        raw: true
    }
});

const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    course: {
        type: Sequelize.INTEGER,
        references: {
            model: Course,
            key: 'courseId'
        },
        onDelete: 'SET NULL'
    }
}, {
    underscored: true
});

Course.hasMany(Student, { foreignKey: 'course' });

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync({ force: true }).then(() => {
            resolve("Database synced successfully.");
        }).catch(err => {
            reject("Unable to sync the database: " + err);
        });
    });
};

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        Student.findAll().then(data => {
            resolve(data);
        }).catch(err => {
            reject("No results returned");
        });
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                course: course
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("No results returned");
        });
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                studentNum: num
            }
        }).then(data => {
            resolve(data[0]);
        }).catch(err => {
            reject("No results returned");
        });
    });
};

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll().then(data => {
            resolve(data);
        }).catch(err => {
            reject("No results returned");
        });
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.findAll({
            where: {
                courseId: id
            }
        }).then(data => {
            resolve(data[0]);
        }).catch(err => {
            reject("No results returned");
        });
    });
};

module.exports.addStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;

    for (let key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }

    return new Promise((resolve, reject) => {
        Student.create(studentData).then(() => {
            resolve("Student created successfully.");
        }).catch(err => {
            reject("Unable to create student: " + err);
        });
    });
};

module.exports.updateStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;

    for (let key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }

    return new Promise((resolve, reject) => {
        Student.update(studentData, {
            where: { studentNum: studentData.studentNum }
        }).then(result => {
            if (result[0] > 0) {
                resolve("Student updated successfully.");
            } else {
                reject("No such student found or no update needed.");
            }
        }).catch(err => {
            reject("Unable to update student: " + err);
        });
    });
};

module.exports.addCourse = function (courseData) {
    for (let key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }

    return new Promise((resolve, reject) => {
        Course.create(courseData).then(() => {
            resolve("Course created successfully.");
        }).catch(err => {
            reject("Unable to create course: " + err);
        });
    });
};

module.exports.updateCourse = function (courseData) {
    for (let key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }

    return new Promise((resolve, reject) => {
        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        }).then(result => {
            if (result[0] > 0) {
                resolve("Course updated successfully.");
            } else {
                reject("No such course found or no update needed.");
            }
        }).catch(err => {
            reject("Unable to update course: " + err);
        });
    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.destroy({
            where: { courseId: id }
        }).then(deleted => {
            if (deleted) {
                resolve("Course deleted successfully.");
            } else {
                reject("No course found with that ID.");
            }
        }).catch(err => {
            reject("Unable to delete course: " + err);
        });
    });
};

module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: { studentNum: studentNum }
        })
            .then(deleted => {
                if (deleted) {
                    resolve("Student deleted successfully.");
                } else {
                    reject("Student not found.");
                }
            })
            .catch(err => {
                reject("Error deleting student: " + err);
            });
    });
};
