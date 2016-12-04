angular.module('userCtrl', ['userService'])


.controller('UserController', function(User) {


    var vm = this;


    User.all()
        .success(function(data) {
            vm.users = data;
        })


})


.controller('UserCreateController', function(User, $location, $window) {

    var vm = this;

    vm.signupUser = function() {
        vm.message = '';
        if (validator.isEmail(vm.userData.email)) {
            User.create(vm.userData)
                .then(function(response) {
                    vm.userData = {};
                    vm.message = response.data.message;
                    console.log(response.data.code)
                    if (response.data.code == 11000) {
                        vm.error = "Email Exist"
                    } else {
                        $window.localStorage.setItem('token', response.data.token);
                        $location.path('/');
                    }
                })
        } else {
            vm.error = "Check Your Details"

        }

    }

})
