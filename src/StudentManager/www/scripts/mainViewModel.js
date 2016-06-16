"use strict;"

function remoteObservableCollection(baseUrl, collectionUrl) {
    var self = this;

    self.observableArray = ko.observableArray();

    self.url = baseUrl + collectionUrl;

    self.add = function (item) {
        $.ajax(self.url, {
            data: ko.mapping.toJSON(item),
            type: "post",
            contentType: "application/json",
            success: function (result) {
                console.log(result);
                var newItem = ko.mapping.toJSON(item);
                self.observableArray.push(item);
            }
        });
    }

    self.remove = function (item) {
        console.log(self.url + "/" + ko.mapping.toJS(item).id);
        $.ajax( 
        {
            url: self.url + "/" + ko.mapping.toJS(item).id,
            type: "delete",
            success: function (result) {
                console.log(result);
                self.observableArray.remove(item);
            }
        });
    }

    self.update = function (item) {
        console.log(this);
        item  = this;
        $.ajax(self.url + "/" + ko.mapping.toJS(item).id, {
            data: ko.toJSON(item),
            type: "put",
            contentType: "application/json",
            success: function (result) {
                console.log("Update item: ",item);
                console.log("Update result: ",result);
            }
        });
    }

    self.getFromRemote = function () {
        $.getJSON(self.url, function (data) {
            console.log("Received from remote: ",data);
            var mappedArray = $.map(data, function (item) {
                var mapped = ko.mapping.fromJS(item);
                var keys = Object.keys(mapped);
                keys.forEach(function(key)
                {
                    var subscribeFunction = mapped[key]["subscribe"];
                    if(subscribeFunction)
                    {                      
                         mapped[key]["subscribe"](self.update, mapped)
                    }

                })
                return mapped;
            });
            self.observableArray( mappedArray);
            console.log( mappedArray);
        });
    }

    self.length = ko.computed(function () {
        return self.observableArray().length;
    });
}

function mainViewModel() {
    this.self = this;

    self.baseAddress = "http://localhost:60732/api/";

    self.chosenTableHash = ko.observable();

    // Students

    //Data

    self.searchId = ko.observable();
    self.searchName = ko.observable();
    self.searchLastName = ko.observable();
    self.searchBirthday = ko.observable();

    self.remoteStudents = new remoteObservableCollection(baseAddress, "students");;
    self.students = self.remoteStudents.observableArray;

    self.student = {
        id: ko.computed(
           function () {
            var underlyingArray = students();
            var length = underlyingArray.length;
            if (length === 0) return 0;
            console.log(underlyingArray[length - 1].id())
            return underlyingArray[length - 1].id()+1;
           }, this),
        name: ko.observable(),
        surname: ko.observable(),
        birthday: ko.observable()
    }

    //Behavior

    self.goToStudents = function (param) {
        location.hash = "students";
        return true;
    }

    self.addStudent = function () {
        self.remoteStudents.add(self.student);
    }

    self.deleteStudent = function (item) {
        self.remoteStudents.remove(item);
    }



    self.getStudents = function () {
        self.remoteStudents.getFromRemote();
    }

    //Marks

    //Data

    self.searchMark = ko.observable();
    self.searchDate = ko.observable();

    self.remoteMarks = new remoteObservableCollection(baseAddress, "marks");

    self.marks = remoteMarks.observableArray;

    self.mark = {
        studentId: ko.observable(),
        value: ko.observable(),
        submitTime: ko.observable(),
    }

    //Behavior
    self.goToMarks = function (param) {
        location.hash = "marks";
        return true;
    }

    self.addMark = function () {
        self.remoteMarks.add(self.mark);
        

        //self.mark.studentId("");
        //self.mark.value("");
        //self.mark.submitTime("");
    }

    self.deleteMark = function (item) {
        self.remoteMarks.remove(item);
    }
    self.getMarks = function () {
        self.remoteMarks.getFromRemote();
    };

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

    self.goToSubjects = function (param) {
        location.hash = "subjects";
        return true;
    }

    self.addSubject = function () {
        var data = ko.mapping.toJS(self.subject);
        self.remoteSubjects.add(data);
       // self.subject.name("");
       // self.subject.teacher("");
    }

    self.deleteSubject = function (item) {
        self.remoteSubjects.remove(item);
    }

    self.getSubjects = function () {
        self.remoteSubjects.getFromRemote();
    }
};


var viewModel = new mainViewModel();

$(document).ready(function () {
    // Client-side routes
    $.sammy(function () {
        this.get('#:name', function () {
            console.log(this.params.name);
            self.chosenTableHash(this.params.name);
            var name = "get" + (this.params.name[0].toUpperCase() + this.params.name.slice(1));
            console.log(name);
            self[name].call(self);
        });

        this.get('', function () { this.app.runRoute('get', '#students') });
    }).run();
    ko.applyBindings(viewModel);
});