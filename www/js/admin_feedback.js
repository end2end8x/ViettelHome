var dataAdminFeedback;
var department;
var isMoreAdminFeedback = true;
function getdataAdmin($scope, page) {
    if (!dataAdminFeedback)
    {
        dataAdminFeedback = {};
        $.post(PARSE + "onLoadReplyFeedback", {userId: userId, session: session, begin: page * maxPage, end: (page + 1) * maxPage}).done(function (json) {
            $scope.$apply(function () {
                dataAdminFeedback = json.result;
                $scope.dataAdminFeedback = dataAdminFeedback;
//                alert(JSON.stringify(dataAdminFeedback));
                $scope.$broadcast('scroll.refreshComplete');
                isMoreAdminFeedback = false;
                page = page + 1;
            });
        }).fail(function (er) {
            alert("Vui lòng kết nối mạng và thử lại!" + JSON.stringify(er));
        });
    } else {
        $scope.dataAdminFeedback = dataAdminFeedback;
    }
}

function getDepartment($scope) {
    if (!department)
    {
        department = {};
        $.post(PARSE + "onLoadDepartment", {userId: userId, session: session, begin: 0, end: 100}).done(function (json) {
            $scope.$apply(function () {
                department = json.result;
                $scope.department = department;
//                alert(JSON.stringify(department));
            });
        }).fail(function () {
            alert("Vui lòng kết nối mạng và thử lại!");
        });
    } else {
        $scope.department = department;
    }
}
;

module.controller('AdminFeedBackCtr', function ($scope, $ionicPopover, $state) {
    var pageAdmin = 0;
    getdataAdmin($scope, pageAdmin);
    getDepartment($scope);
    $scope.icon_admin = ['ion-clipboard', 'ion-camera', 'ion-videocamera'];
    $scope.doRefreshAdminFeedBack = function ()
    {
        dataAdminFeedback = null;
        loadOpinion($scope);
    };

    $scope.loadAdminFeedBack = function () {
        getdataAdmin($scope);
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.moreAdminFeedBackCanBeLoaded = function () {
        return isMoreAdminFeedback;
    };


    /// lọc dữ liệu #####################
    $ionicPopover.fromTemplateUrl('templates/main_popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
    $scope.pop_title = "Lọc dữ liệu";
    $scope.filters = [
        {
            id: 1,
            title: 'Tất cả'
        },
        {
            id: 2,
            title: 'Ý kiến gửi phản ánh'
        },
        {
            id: 3,
            title: 'Phản ánh đã gửi'
        }
    ];
    $scope.settings = function (i) {
        $scope.popover.hide();
        var id = $scope.filters[i].id;
        switch (id) {
            case 1:
                alert(id);
                break;
            case 2:
                alert(id);
                break;
            case 3:
                alert(id);
                break;
            default:
                break;
        }
    };
    $scope.username = fullname;
    /// chuyển trang admin
    $scope.viewAdminFeedBack = function (index) {
        var selectedItem = dataAdminFeedback[index];
        dataAdminFeedback.selectedItemAdmin = selectedItem;
        $state.go('admin_feedback_reply', {title: selectedItem.title});
        if (dataAdminFeedback[index].status == 2) {
            $state.go('admin_feedback_forward', {title: selectedItem.title});
        } else if (dataAdminFeedback[index].status == 1) {
            $state.go('admin_feedback_reply', {title: selectedItem.title});
        }
    };
    $scope.viewFeedBack = function (index) {
        var myFeedback = dataAdminFeedback[index]; // chú ý 2 dữ liệu khác nhau!
        dataAdminFeedback.selectedItem = myFeedback;
        $state.go('admin_feedback_myReply', {});
    };
}
);
module.controller('AdminFeedBackReplyCtr', function ($scope, $state, $ionicPopover,$ionicPopup, goBackViewWithName)
{
    $scope.adFBTXTReply = {};
    $scope.detailAdminFeedback = dataAdminFeedback.selectedItemAdmin;
    $ionicPopover.fromTemplateUrl('templates/admin_img_popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
    $scope.detailAdminFeedback = dataAdminFeedback.selectedItemAdmin;
    $scope.imgs = dataAdminFeedback.selectedItemAdmin.link;
    $scope.zoomImg = function ($event, src) {
        $scope.imgPopover = src;
        $scope.popover.show($event);
    };
    $scope.replys = [
        {
            id: 1,
            reply: 'Cảm ơn bạn! Chúng tôi đang xem xét và  trả lời lại sớm nhất.'
        },
        {
            id: 2, reply: 'Xin vui lòng cung cấp thêm thông tin như Địa điểm, thời gian...Để chúng tôi xác minh'
        },
        {
            id: 3,
            reply: 'Nội dung chưa rõ ràng, xin nói rõ hơn về phản ánh của bạn. Xin cảm ơn!'
        }
    ];
    $scope.fbReply = {
        value: ''
    };
    $scope.adFBTXTReply = {
        value: ''
    };
    $scope.checked = function ()
    {
        $scope.adFBTXTReply.value = $scope.fbReply.value;
    };
    $scope.forwardReply = function () {
        $state.go('feedback_department', {});
    };
    $scope.sentReply = function () {
        var time = new Date();
        var timeparse = parseInt(time.getTime() / 1000);
        $.post(PARSE + "replyFeedback",
                {
                    userId: userId,
                    session: session,
                    feedbackId: $scope.detailAdminFeedback.feedbackId,
                    department: $scope.detailAdminFeedback.department,
                    content: $scope.adFBTXTReply.value,
                    time: timeparse,
                    patternId: 0
                }
        ).done(function (json) {
            $ionicPopup.show({
                title: 'Thông Báo',
                template: 'Bạn gửi ý kiến thành công!',
                buttons: [{text: 'Ok'}]
            });
//            alert(JSON.stringify(json));
            goBackViewWithName('admin_feedback');
        }).fail(function (err) {
            $ionicPopup.show({
                title: 'Thông Báo',
                template:"postFeedback Error " + JSON.stringify(err),
                buttons: [{text: 'Ok'}]
            });
        });
    };
});
module.controller('AdminFeedBackDepartmentCtr', function ($scope, $location, $state, $timeout) {

});
module.controller('AdminFeedBackForwardCtr', function ($scope, $state, $ionicPopover) {
    $ionicPopover.fromTemplateUrl('templates/admin_img_popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
    $scope.detailAdminFeedback = dataAdminFeedback.selectedItemAdmin;
    $scope.imgs = dataAdminFeedback.selectedItemAdmin.link;
    $scope.zoomImg = function ($event, src) {
        $scope.imgPopover = src;
        $scope.popover.show($event);
    };
    $scope.comments = dataAdminFeedback.selectedItemAdmin.comment;
    $scope.reply = function () {
        $state.go('admin_feedback_reply', {});
    };
});
module.controller('AdminFeedBackMyReplyCtr', function ($scope, $state, $ionicModal, $ionicPopup) {
    $scope.item = dataAdminFeedback.selectedItem;
    $scope.comments = dataAdminFeedback.selectedItem.comment;
    alert(JSON.stringify($scope.comments));

    $ionicModal.fromTemplateUrl('templates/FBModalTextbox.html', {
        scope: $scope,
        focusFirstInput: true,
        animation: 'slide-in-up'
    }).then(function (modal)
    {
        $scope.modal = modal;
    });
    $scope.popText = function () {
        $scope.modal.show();
    };
    $scope.$on('$destroy', function ()
    {
        $scope.modal.remove();
    });
    $scope.submit = function ()
    {
        if (txtActiveIndex === 0)
            document.getElementById("txtTitle").value = document.getElementById("modalTxtArea").value;
        else
            document.getElementById("txtContent").value = document.getElementById("modalTxtArea").value;
        $scope.modal.hide();

        document.getElementById("txtOpinionReply").value = document.getElementById("modalTxtArea").value;
        $scope.modal.hide();
    };
    $scope.finish_AdminReply = function () {
        var txtOpinionReply = document.getElementById('txtOpinionReply').value;
        var time = new Date();
        var timeparse = parseInt(time.getTime() / 1000);
        if (txtOpinionReply) {
            var alertOpinionReply = $ionicPopup.show({
                title: 'Thông Báo',
                template: 'Bạn có chắc chắn muốn gửi ý kiến?',
                buttons: [{text: 'Không'},
                    {
                        text: '<b>OK</b>',
                        type: 'button-positive',
                        onTap: function () {
                            alertOpinionReply.close();
                            $.post(PARSE + "replyFeedback",
                                    {
                                        userId: userId,
                                        session: session,
                                        feedbackId: dataAdminFeedback.selectedItem.feedbackId,
                                        department: dataAdminFeedback.selectedItem.department,
                                        content: txtOpinionReply,
                                        time: timeparse,
                                        patternId: 0
                                    }).done(function (json) {
                                $scope.$apply(function ()
                                {
                                    alert(JSON.stringify(json));
                                    var comment_new = {
                                        commentId: json.result.commentId,
                                        content: txtOpinionReply,
                                        time: timeparse};
                                    $scope.$apply(function () {
                                        dataAdminFeedback.selectedItem.comment.push(comment_new);
                                        $state.go('admin_feedback_myReply', {}, {reload: true});
                                    });
                                });
                            }).fail(function () {
                                alert("Vui lòng kết nối mạng và thử lại!");
                            });
                        }
                    }
                ]
            });
        } else {
            $ionicPopup.show({
                title: 'Thông Báo',
                template: 'Bạn chưa nhập ý kiến',
                buttons: [{text: 'Ok'}]
            });
        }
    };
});               