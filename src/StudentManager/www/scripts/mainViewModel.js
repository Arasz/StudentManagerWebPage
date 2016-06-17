"use strict;"

function remoteObservableCollection(baseUrl, collectionUrl) {
    var self = this;

    self.observableArray = ko.observableArray();

    self.url = baseUrl + collectionUrl;

    self.add = function (item, url) {
        if (url === undefined) url = self.url;
        console.log(item);
        $.ajax(url, {
            data: ko.mapping.toJSON(item),
            type: "post",
            contentType: "application/json",
            success: function (result) {
                console.log(result);
                var newItem = ko.mapping.fromJS(result);
                self.subscribe(newItem);
                console.log(newItem);
                self.observableArray.push(newItem);
            }
        });
    }

    self.remove = function (item, url) {
        console.log("Befor update in remove: ", url);
        if (url === undefined) {
            url = self.url;
            url = url + "/" + ko.mapping.toJS(item).id;
        }
        console.log("After update in remove: ", url);
        console.log(url);
        $.ajax(
        {
            url: url,
            type: "delete",
            success: function (result) {
                console.log(result);
                self.observableArray.remove(item);
            }
        });
    }

    self.update = function (item) {
        console.log(this);
        item = this;
        $.ajax(self.url + "/" + ko.mapping.toJS(item).id, {
            data: ko.toJSON(item),
            type: "put",
            contentType: "application/json",
            success: function (result) {
                console.log("Update item: ", item);
                console.log("Update result: ", result);
            }
        });
    }

    self.fetchFromUrl = function (url) {
        $.getJSON(url, function (data) {
            console.log("Received from remote: ", data);
            var mappedArray = $.map(data, function (item) {
                var mapped = ko.mapping.fromJS(item);
                self.subscribe(mapped);
                return mapped;
            });
            self.observableArray(mappedArray);
            console.log(mappedArray);
        });
    }

    self.getFromRemote = function (query) {
        if (query == undefined) query = "";
        $.getJSON(self.url + query, function (data) {
            console.log("Received from remote: ", data);
            var mappedArray = $.map([].concat(data), function (item) {
                var mapped = ko.mapping.fromJS(item);
                self.subscribe(mapped);
                return mapped;
            });
            self.observableArray(mappedArray);
            console.log("Received array: ", mappedArray);
            console.log("Received observable array: ", self.observableArray);
        });
    }

    self.subscribe = function (mapped) {
        var keys = Object.keys(mapped);
        keys.forEach(function (key) {
            var subscribeFunction = mapped[key]["subscribe"];
            if (subscribeFunction) {
                mapped[key]["subscribe"](self.update, mapped);
            }
        });

        self.length = ko.computed(function () {
            return self.observableArray().length;
        });
    }
}

function mainViewModel() {
    this.self = this;

    self.baseAddress = "http://localhost:60732/api/";

    self.chosenTableHash = ko.observable();

    // Students

    //Data
    self.searchBirthday = ko.observable();
    self.searchName = ko.observable();
    self.searchLastName = ko.observable();

    self.remoteStudents = new remoteObservableCollection(baseAddress, "students");;
    self.students = self.remoteStudents.observableArray;

    self.student = {
        name: ko.observable(""),
        surname: ko.observable(""),
        birthday: ko.observable(""),
    }

    self.studentsAppendix = ko.observable("");

    //Behavior

    self.goToStudents = function (param) {
        location.hash = "students";
        self.getStudents();
    }

    self.goToStudentWithMark = function (mark) {
        location.hash = "students";
        self.getStudentForMark(mark.studentId());
    }

    self.addStudent = function () {
        self.remoteStudents.add(self.student);
        self.student.name("");
        self.student.birthday("");
        self.student.surname("");
    }

    self.deleteStudent = function (item) {
        self.remoteStudents.remove(item);
    }

    self.getStudents = function () {
        self.remoteStudents.getFromRemote();
    }

    self.getStudentForMark = function (id) {
        self.remoteStudents.getFromRemote("/" + id + "");
    }

    //Marks

    //Data

    self.searchMarkValue = ko.observable();
    self.searchDate = ko.observable();
    self.searchStudentId = ko.observable();

    self.remoteMarks = new remoteObservableCollection(baseAddress, "marks");

    self.marks = remoteMarks.observableArray;

    self.marksAppendix = ko.observable("");

    self.mark = {
        studentId: ko.observable(),
        value: ko.observable(),
        submitTime: ko.observable(),
    }

    self.subjectid = "";

    //Behavior
    self.goToMarks = function (param) {
        location.hash = "marks";
        self.marksAppendix("");
        self.getMarks();
    }

    self.goToMarksForSubject = function (subject) {
        location.hash = "marks";
        self.marksAppendix("for " + subject.name());
        self.getMarksForSubject(subject.id());
    }

    self.goToMarksForStudent = function (student) {
        location.hash = "marks";
        self.marksAppendix("for " + student.name() + " " + student.surname());
        self.getMarksForStudent(student.id());
    }

    self.addMark = function (subject) {
        if (self.subjectid !== "") {
            self.remoteMarks.add(self.mark, self.baseAddress + "subjects/" + self.subjectid + "/marks");
        }
        self.mark.studentId("");
        self.mark.value("");
        self.mark.submitTime("");
    }

    self.deleteMark = function (item) {
        console.log(item);
        console.log(self.subjectid);
        if (self.subjectid !== "") {
            self.remoteMarks.remove(item, self.baseAddress + "subjects/" + self.subjectid + "/marks/" + item.id() + "/" + item.studentId());
        }
    }
    self.getMarks = function () {
        self.remoteMarks.getFromRemote();
    };

    self.getMarksForSubject = function (id) {
        self.subjectid = id;
        self.remoteMarks.fetchFromUrl(baseAddress + "subjects" + "/" + id + "/marks");
    }

    self.getMarksForStudent = function (id) {
        self.remoteMarks.fetchFromUrl(baseAddress + "students" + "/" + id + "/marks");
    }

    //Subjects

    //Data

    self.searchSubject = ko.observable();
    self.searchTeacher = ko.observable();

    self.remoteSubjects = new remoteObservableCollection(baseAddress, "subjects");

    self.subjects = remoteSubjects.observableArray;

    self.subject = {
        name: ko.observable(),
        teacher: ko.observable(),
    }

    //Behavior

    self.goToSubjects = function () {
        location.hash = "subjects";
        self.getSubjects();
    }

    self.addSubject = function () {
        self.remoteSubjects.add(self.subject);
        self.subject.name("");
        self.subject.teacher("");
    }

    self.deleteSubject = function (item) {
        self.remoteSubjects.remove(item);
    }

    self.getSubjects = function () {
        self.remoteSubjects.getFromRemote();
    }

    self["get" + location.hash[1].toUpperCase() + location.hash.slice(2)]();

    self.searchName.subscribe(function (name) {
        self.remoteStudents.getFromRemote("/?name=" + name);
    });
    self.searchLastName.subscribe(function (surname) {
        self.remoteStudents.getFromRemote("/?surname=" + surname);
    });
    self.searchBirthday.subscribe(function (birthday) {
        self.remoteStudents.getFromRemote("/?afterDate=" + birthday + "&beforeDay=" + birthday);
    });

    self.searchMarkValue.subscribe(function (mark) {
        self.remoteMarks.getFromRemote("/?value=" + mark);
    });

    self.searchDate.subscribe(function (date) {
        self.remoteMarks.getFromRemote("/?date=" + date);
    });

    self.searchStudentId.subscribe(function (date) {
        self.remoteMarks.getFromRemote("/?studentId=" + date);
    });

    self.searchSubject.subscribe(function (subject) {
        self.remoteSubjects.getFromRemote("/?name=" + subject);
    });

    self.searchTeacher.subscribe(function (teacher) {
        self.remoteSubjects.getFromRemote("/?teacher=" + teacher);
    });
};

var viewModel = new mainViewModel();

$(document).ready(function () {
    // Client-side routes
    ko.applyBindings(viewModel);
});