var mapLocal =
        {
            local: ''
        };
var fbDepartment =
        {
            value: ''
        };
var listDepartment = {};
var listLocation = {};
module.controller('FeedbackController', function ($scope, $state, $Capture, $Camera, $ionicPopover, $ionicModal, goBackViewWithName)
{
    $scope.items = [
        {
            title: 'ĐỊA ĐIỂM',
            desc: 'Địa điểm không chọn được mặc định tại nơi công tác hoặc tự động định vị theo vị trí  hiện tại (Vui lòng bật xác định vị trí trong mục cài đặt)',
            content: 'Anh chỉ mong sao Em có thể nói lên hết những tâm tư bao lâu nay của hai đứa.Nhưng sau hôm nay Em nói xóa mau đi bao nhiêu kí ức Em vội ra đi riêng mình Em. Em có biết rất khó mới tìm thấy nhau, như lúc này Anh xin Em hãy quay trở lại.'
        },
        {
            title: 'THỜI GIAN',
            desc: 'Thời gian không chọn thì được tự động để mặc định với thời gian hiện tại',
            content: 'Anh chỉ mong sao Em có thể nói lên hết những tâm tư bao lâu nay của hai đứa.Nhưng sau hôm nay Em nói xóa mau đi bao nhiêu kí ức Em vội ra đi riêng mình Em. Em có biết rất khó mới tìm thấy nhau, như lúc này Anh xin Em hãy quay trở lại.'
        }, {
            title: 'LỰA CHỌN CẤP GỬI',
            desc: 'Cấp gửi không chọn thì được mặc định gửi tới cấp thuộc phòng/ban trung tâm công tác',
        }
    ];
    $scope.mediaUrl = [];

    $('#demo_datetime').mobiscroll().datetime({
        theme: 'mobiscroll-dark',
        mode: 'mode',
        display: 'bottom',
        lang: 'en-UK',
        minDate: new Date(2010, 01, 01, 00, 00), // More info about minDate: http://docs.mobiscroll.com/2-14-0/datetime#!opt-minDate
        maxDate: new Date(2020, 01, 01, 00, 00), // More info about maxDate: http://docs.mobiscroll.com/2-14-0/datetime#!opt-maxDate
        stepMinute: 1  // More info about stepMinute: http://docs.mobiscroll.com/2-14-0/datetime#!opt-stepMinute
    });

    $ionicModal.fromTemplateUrl('templates/FBModalTextbox.html', {
        scope: $scope,
        focusFirstInput: true,
        animation: 'slide-in-up'
    }).then(function (modal)
    {
        $scope.modal = modal;
    });

    $scope.$on('$destroy', function ()
    {
        $scope.modal.remove();
    });
    $scope.$on('$locationChangeSuccess', function ()
    {
        $scope.local = mapLocal.local;
        $scope.department = fbDepartment.value;
    });
    $scope.showScreen = function (i)
    {
        switch (i) {
            case 0:
                $state.go("feedback_location");
                break;
            case 2:
                $state.go("feedback_department");
                break;
            default:
                alert("NOT FOUND showScreen " + i);
                break;
        }
    };

    $ionicPopover.fromTemplateUrl('templates/admin_img_popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
    $scope.zoomImg = function ($event, src) {
        if (src) {
            $scope.imgPopover = src;
            $scope.popover.show($event);
        }
    };

    $scope.updateEditor = function (elementId, minHeight)
    {
        resizeTextArea(elementId, minHeight);
    };

    $scope.feedbackId = -1;
    $scope.postFeedback = function ()
    {
        if (validText("txtTitle", "Tiêu đề"))
            if (validText("txtContent", "Nôi dung phản ánh"))
            {
                $.post(PARSE + "postFeedback",
                        {
                            userId: userId,
                            session: session,
                            state: '1',
                            domain: '1',
                            title: document.getElementById('txtTitle').value,
                            content: document.getElementById('txtContent').value,
                            attach_type: '0',
                            location: 'Noi trai tim co nang',
                            time: new Date().getTime(),
                            department: '1',
                            attach_count: $scope.mediaUrl.length
                        }
                ).done(function (json) {

                    $scope.feedbackId = json.result[0].feedbackId;
                    alert('postFeedback Success feedbackId: ' + $scope.feedbackId + ' ' + JSON.stringify(json));

                    if ($scope.mediaUrl.length > 0) {
                        for (var i = 0; i < $scope.mediaUrl.length; i++) {
                            $scope.mediaUrl[i].key = $scope.feedbackId + "_" + i;
                            $scope.mediaUrl[i].index = i;
                            $scope.mediaUrl[i].title = document.getElementById('txtTitle').value;
                            $scope.mediaUrl[i].content = document.getElementById('txtContent').value;
                            $scope.mediaUrl[i].feedbackId = $scope.feedbackId;
//                            window.resolveLocalFileSystemURI($scope.mediaUrl[i].url, readFile, onError);
                        }
                        store.batch($scope.mediaUrl, function (json) {
//                            alert('insert ' + JSON.stringify(json));
                            for (var i = 0; i < json.length; i++) {
                                window.resolveLocalFileSystemURI(json[i].url, readFile, onError);
                            }
                        });
                    }
                    goBackViewWithName('main');
                }).fail(function (err) {
                    $scope.feedbackId = -1;
                    alert("postFeedback Error " + JSON.stringify(err));
                });
            }
    };

    function readFile(fileEntry) {
//        alert('fileEntry ' + JSON.stringify(fileEntry));
        fileEntry.file(function (file) {
            var reader = new FileReader();
//            alert('fileEntry.file ' + JSON.stringify(file));
            reader.onprogress = function (evt) {
                alert('onprogress ' + JSON.stringify(evt));
            };
            reader.onloadend = function (evt) {
//                alert('onloadend ' + sizeof(evt.target.result));
//                alert('fileEntry.file 2 ' + JSON.stringify(file));
//                alert('fileEntry.file 2 ' + JSON.stringify(evt.target.result));
                $.post(PARSE + "uploadFileFeedback",
                        {
                            userId: userId,
                            session: session,
                            attach_type: '1',
                            feedbackId: $scope.feedbackId,
                            file_index: '1',
                            filename: file.name,
                            stringData: evt.target.result
                        }
                ).done(function (json) {
                    alert('uploadFileFeedback Success ' + JSON.stringify(json));
                    store.get($scope.feedbackId + '_0', function (json) {
                        json.status = 1;
                        store.save(json);
                    });

                    var query = new Parse.Query(Parse.Installation);
                    Parse.Push.send({
                        where: query, // Set our Installation query
                        data: {
                            alert: "Đồng chí " + fullName + ' vừa gửi phản ánh : ' + document.getElementById('txtTitle').value
                        }
                    }, {
                        success: function () {
//                            alert('Parse.Push.send Success');
                        },
                        error: function (error) {
                            alert('Parse.Push.send Error' + JSON.stringify(error));
                        }
                    });
                }).fail(function (err) {
                    alert("uploadFileFeedback Error " + JSON.stringify(err));
                    store.get($scope.feedbackId + '_0', function (json) {
                        json.status = 0;
                        store.save(json);
                    });
                });
            }
            reader.readAsDataURL(file);
        });
    }

    $scope.imgFeedback = null;
    function onError(error) {
        alert('onError ' + JSON.stringify(error));
    }
    $scope.choosePicture = function ()
    {
        $Camera.getPicture({
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        }).then(function (file_uri) {
            var date = new Date();
            var json = {feedbackId: "", index: $scope.mediaUrl.length.toString(), url: file_uri, title: "", content: "", type: 1, date: date, status: 2, progess: 0};
            $scope.mediaUrl.push(json);
            $scope.imgFeedback = file_uri;
//            var image = document.getElementById('feedback_image');
//            image.src = file_uri;
        }, onError);
    };

    $scope.takePicture = function () {
        $Camera.getPicture({
            quality: 100,
            targetWidth: 320,
            targetHeight: 320,
            saveToPhotoAlbum: false
        }).then(function (file_uri) {
            var date = new Date();
            var json = {feedbackId: "", index: $scope.mediaUrl.length.toString(), url: file_uri, title: "", content: "", type: 1, date: date, status: 2, progess: 0};
            $scope.mediaUrl.push(json);
            $scope.imgFeedback = file_uri;
//            var image = document.getElementById('feedback_image');
//            image.src = file_uri;
        }, onError);
    };

    $scope.takeVideo = function () {
        $Capture.captureVideo({limit: 1, duration: 1}).then(function (files_uri) {
            var date = new Date();
            var json = {feedbackId: "", index: $scope.mediaUrl.length.toString(), url: files_uri[0], title: "", content: "", type: 2, date: date, status: 2, progess: 0};
            $scope.mediaUrl.push(json);
        }, onError);
    };

//    function videoSuccess(videoData) {
//        alert('upLoadVideo ' + sizeof(videoData));
//        var file = new Parse.File("feedback_video.mp4", {base64: videoData});
//        file.save().then(function () {
//            alert('videoSuccess  ' + file.url());
//            var obj = new Parse.Object("FeedbackVideo");
//            obj.set("file", file);
//            obj.save().then(function () {
//                var query = new Parse.Query(Parse.Installation);
//                Parse.Push.send({
//                    where: query, // Set our Installation query
//                    data: {
//                        alert: "Dong chi co phan anh video moi!"
//                    }
//                }, {
//                    success: function () {
//                        alert('Parse.Push.send Success');
//                    },
//                    error: function (error) {
//                        alert('Parse.Push.send Error' + JSON.stringify(error));
//                    }
//                });
//            });
//        }, onError);
//    }

//    function imageSuccess(imageData) {
//        var image = document.getElementById('feedback_image');
//        image.src = "data:image/jpeg;base64," + imageData;
//
//        var file = new Parse.File("feedback_image.jpg", {base64: imageData});
//        file.save().then(function () {
////            alert('imageSuccess  ' + file.url());
//            var obj = new Parse.Object("FeedbackImage");
//            obj.set("file", file);
//
//            obj.save().then(function () {
//                var query = new Parse.Query(Parse.Installation);
//                Parse.Push.send({
//                    where: query, // Set our Installation query
//                    data: {
//                        alert: "Dong chi co phan anh hinh anh moi!"
//                    }
//                }, {
//                    success: function () {
//                        alert('Parse.Push.send Success');
//                    },
//                    error: function (error) {
//                        alert('Parse.Push.send Error ' + JSON.stringify(error));
//                    }
//                });
//            });
//        }, onError);
//    }
});

module.controller('FeedbackLocationController', function ($scope, $state, $ionicPopover, goBackViewWithName)
{
    $scope.fbDataFilter = {};
    $scope.fbTxtOtherLocal = {};
    getDepartments($scope);
    $ionicPopover.fromTemplateUrl('templates/FBPopoverLocation.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (popover) {
        $scope.popover = popover;
    });
    $scope.$on('$destroy', function () {
        $scope.popover.remove();
    });
    $scope.selectLocation = function (value)
    {
        $scope.fbDataFilter.query = value;
        $scope.popover.hide();
    };
    $scope.sumitLocal = function ()
    {
        if ($scope.fbTxtOtherLocal.value)
            mapLocal = {
                local: $scope.fbTxtOtherLocal.value
            };
        else
            mapLocal = {
                local: $scope.fbDataFilter.query
            };
        goBackViewWithName('feedback');
    };
    $scope.clearSearch = function ()
    {
        $scope.popover.hide();
        $scope.fbDataFilter.query = '';
    };
    $scope.updateEditor = function (elementId, minHeight)
    {
        resizeTextArea(elementId);
    };
    $scope.showScreen = function (i)
    {
        $state.go("feedback_map");
    };
});
module.controller('FBDepartmentCtr', function ($scope, $ionicPopover, goBackViewWithName)
{
    $scope.fbDataFilter = {};
    $scope.department = {
        value: 'Phòng tổng hợp'
    };
    getDepartments($scope);
    $ionicPopover.fromTemplateUrl('templates/FBPopoverLocation.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
    $scope.$on('$destroy', function () {
        $scope.popover.remove();
    });
    $scope.selectLocation = function (value)
    {
        $scope.fbDataFilter.query = value;
        $scope.popover.hide();
    };
    $scope.sumitDepartment = function ()
    {
        if (document.getElementById('fbCheckDepartment').checked)
            fbDepartment = {
                value: $scope.fbDataFilter.query
            };
        else
            fbDepartment = {
                value: $scope.department.value
            };
        goBackViewWithName('feedback');
    };
    $scope.clearSearch = function ()
    {
        $scope.popover.hide();
        $scope.fbDataFilter.query = '';
    };
});

module.controller('FBMapCtrl', function ($scope, goBackViewWithName)
{
    $scope.isLoadedMap = false;
    loadMap($scope);
    getListLocation($scope);
    $scope.local = {
        loc: ''
    };
    $scope.sumitLocal = function ()
    {
        mapLocal = {
            local: $scope.local.loc
        };
        goBackViewWithName('feedback');
    };
});
function loadMap($scope)
{
    navigator.geolocation.getCurrentPosition(function (pos)
    {
        var myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

        var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
                mapOptions);
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'My Position'
        });
        google.maps.event.addListener(marker, 'click', function ()
        {
            infowindow.open(map, marker);
        });
        $scope.$apply(function ()
        {
            $scope.map = map;
            $scope.isLoadedMap = true;
        });
    }, function (err)
    {
        alert(err);
    });
}
module.factory('$Camera', ['$q', function ($q) {

        return {
            getPicture: function (options) {
                var q = $q.defer();

                navigator.camera.getPicture(function (result) {
                    q.resolve(result);
                }, function (err) {
                    q.reject(err);
                }, options);

                return q.promise;
            }
        }
    }]);

module.service('goBackManyView', function ($ionicHistory) {
    return function (depth) {
        var historyId = $ionicHistory.currentHistoryId();
        var history = $ionicHistory.viewHistory().histories[historyId];
        var targetViewIndex = history.stack.length - 1 - depth;
        $ionicHistory.backView(history.stack[targetViewIndex]);
        $ionicHistory.goBack();
    };
});

module.service('goBackViewWithName', function ($ionicHistory) {
    return function (stateName) {
        var historyId = $ionicHistory.currentHistoryId();
        var history = $ionicHistory.viewHistory().histories[historyId];
        for (var i = history.stack.length - 1; i >= 0; i--)
        {
            if (history.stack[i].stateName == stateName)
            {
                $ionicHistory.backView(history.stack[i]);
                $ionicHistory.goBack();
            }
        }
    };
});
module.factory('$Capture', ['$q', function ($q) {

        return {
            captureVideo: function (options) {
                var q = $q.defer();

                navigator.device.capture.captureVideo(function (result) {
                    q.resolve(result);
                }, function (err) {
                    q.reject(err);
                }, options);

                return q.promise;
            }
        }
    }]);

function sizeof(_1) {
    var _2 = [_1];
    var _3 = 0;
    for (var _4 = 0; _4 < _2.length; _4++) {
        switch (typeof _2[_4]) {
            case "boolean":
                _3 += 4;
                break;
            case "number":
                _3 += 8;
                break;
            case "string":
                _3 += 2 * _2[_4].length;
                break;
            case "object":
                if (Object.prototype.toString.call(_2[_4]) != "[object Array]") {
                    for (var _5 in _2[_4]) {
                        _3 += 2 * _5.length;
                    }
                }
                for (var _5 in _2[_4]) {
                    var _6 = false;
                    for (var _7 = 0; _7 < _2.length; _7++) {
                        if (_2[_7] === _2[_4][_5]) {
                            _6 = true;
                            break;
                        }
                    }
                    if (!_6) {
                        _2.push(_2[_4][_5]);
                    }
                }
        }
    }
    return _3;
}

function getDepartments($scope)
{
    $.post(PARSE + "onLoadDepartment", {userId: userId, session: session, begin: 0, end: 50})
            .done(function (data)
            {
                $scope.$apply(function ()
                {
                    listDepartment = data.result;
                    $scope.items = listDepartment;
                });
            }).fail(function (err)
    {
        $scope.items = {};
        alert('Xin hãy kiểm tra lại kết nối');
    });
}
function getListLocation($scope)
{
    $.post(PARSE + "onSuggestDepartment", {userId: userId, session: session, begin: 0, end: 50})
            .done(function (data)
            {
                $scope.$apply(function ()
                {
                    listLocation = data.result;
                    $scope.items = listLocation;
                });
            }).fail(function (err)
    {
        $scope.items = {};
        alert('Xin hãy kiểm tra lại kết nối');
    });
}
function resizeTextArea(elementId, minHeight)
{
    var element = document.getElementById(elementId);
    if (element.scrollHeight < minHeight)
        element.style.height = minHeight + "px";
    else
        element.style.height = element.scrollHeight + "px";
}
;

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type: mimeString});
}