var dataAdminFeedback = [];
var pageAdminFeedback = 0;
var isLoadMore = false;
module.controller('AdminFeedBackCtr', function ($scope, $ionicPopover, $ionicPopup, $state) 
{
    $scope.statusFilter=1;
//    getDepartment($scope, $ionicPopup);
    $scope.icon_admin = ['ion-clipboard', 'ion-camera', 'ion-videocamera'];

    $.post(PARSE + "onLoadReplyFeedback", {userId: userId, session: session, begin: 0, end: maxPage}).done(function (json) {
        $scope.$apply(function () {
            dataAdminFeedback = json.result;
//            dataAdminFeedback.splice(0,1);
//            if(DEBUG) alert(JSON.stringify(dataAdminFeedback));
            $scope.dataAdminFeedback = dataAdminFeedback;
            pageAdminFeedback = maxPage+1;
            isLoadMore = true;
        });
    }).fail(function (er) {
        $ionicPopup.show({
            title: 'Thông Báo',
            template: "Không thể kết nối đến máy chủ" + JSON.stringify(er),
            buttons: [{text: 'Ok'}]
        });
    });

    $scope.refresh = function () {
        $.post(PARSE + "onLoadReplyFeedback", {userId: userId, session: session, begin: 0, end: maxPage}).done(function (json) {
            $scope.$apply(function () {
                dataAdminFeedback = json.result;
                $scope.dataAdminFeedback = dataAdminFeedback;
                $scope.$broadcast('scroll.refreshComplete');
                pageAdminFeedback = maxPage;
                isLoadMore = true;
            });
        }).fail(function (er) {
            $ionicPopup.show({
                title: 'Thông Báo',
                template: "Không thể kết nối đến máy chủ" + JSON.stringify(er),
                buttons: [{text: 'Ok'}]
            });
        });
    }

    $scope.isLoadMore = function () 
    {
        return isLoadMore;
    }
    $scope.loadMore = function () 
    {
        $.post(PARSE + "onLoadReplyFeedback", {userId: userId, session: session, begin: pageAdminFeedback, end: pageAdminFeedback + maxPage}).done(function (json) {
            $scope.$apply(function () {
                if (json.length > 0 && json.result.length) {
                    dataAdminFeedback = dataAdminFeedback.concat(json.result);
                    $scope.dataAdminFeedback = dataAdminFeedback;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    pageAdminFeedback += maxPage+1;
                } else {
                    isLoadMore = false;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            });
        }).fail(function (er) {
            $ionicPopup.show({
                title: 'Thông Báo',
                template: "Không thể kết nối đến máy chủ" + JSON.stringify(er),
                buttons: [{text: 'Ok'}]
            });
        });
    }

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
                $scope.statusFilter=1;
                break;
            case 2:
                $scope.statusFilter=2;
                break;
            case 3:
                $scope.statusFilter=3;
                break;
            default:
                break;
        }
    };
    $scope.username = userName;
    /// chuyển trang admin
    $scope.viewAdminFeedBack = function (index) {
        var selectedItem = dataAdminFeedback[index];
        dataAdminFeedback.selectedItemAdmin = selectedItem;
        dataAdminFeedback.selectedIndex = index;
        $state.go('admin_feedback_reply', {title: selectedItem.title});
        if (dataAdminFeedback[index].status == 1) {
            $state.go('admin_feedback_forward', {title: selectedItem.title});
        } else if (dataAdminFeedback[index].status == 2) {
            $state.go('admin_feedback_reply', {title: selectedItem.title});
        }
    };
    $scope.viewFeedBack = function (index) {
        var selectedItem = dataAdminFeedback[index]; // chú ý 2 dữ liệu khác nhau!
        dataAdminFeedback.selectedItem = selectedItem;
        $state.go('admin_feedback_comment', {});
    };
}
);
module.controller('AdminFeedBackReplyCtr', function ($scope, $state, $ionicPopover, $ionicPopup, goBackViewWithName)
{
    $scope.detailAdminFeedback = dataAdminFeedback.selectedItemAdmin;
    $ionicPopover.fromTemplateUrl('templates/admin_img_popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
//    $scope.detailAdminFeedback = dataAdminFeedback.selectedItemAdmin;
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

    $scope.updateEditor = function (elementId, minHeight)
    {
        resizeTextArea(elementId, minHeight);
    };

    $scope.forwardReply = function () {
        alert("forwardReply");
        $state.go('feedback_department', {});
    };
    $scope.sentReply = function () {
        var time = new Date();
        var timeparse = Date.parse(time);
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
            dataAdminFeedback[dataAdminFeedback.selectedIndex].status = 1;
            refresh_feedback(dataAdminFeedback, CHUATRALOI);
            goBackViewWithName('admin_feedback');
        }).fail(function (err) {
            $ionicPopup.show({
                title: 'Thông Báo',
                template: "postFeedback Error " + JSON.stringify(err),
                buttons: [{text: 'Ok'}]
            });
        });
    };
});
module.controller('AdminFeedBackDepartmentCtr', function ($scope, $location, $state, $timeout) {

});
module.controller('AdminFeedBackForwardCtr', function ($scope, $state, $ionicPopover) {
    $scope.username = userName;
    $scope.detailAdminFeedback = dataAdminFeedback.selectedItemAdmin;
    $scope.imgForwardReplys = dataAdminFeedback.selectedItemAdmin.link;
    $scope.comments = dataAdminFeedback.selectedItemAdmin.comment;
    
    $ionicPopover.fromTemplateUrl('templates/admin_img_popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
    
    $scope.zoomImg = function ($event, src) {
        $scope.imgPopover = src;
        $scope.popover.show($event);
    };
    
    $scope.reply = function () {
        $state.go('admin_feedback_reply', {});
    };
});
module.controller('AdminFeedBackComment', function ($scope, $state, $ionicPopup,$ionicPopover) {
    $scope.item = dataAdminFeedback.selectedItem;
    $scope.comments = dataAdminFeedback.selectedItem.comment;
    $scope.imgAdminReplys = dataAdminFeedback.selectedItem.link;
    
    $ionicPopover.fromTemplateUrl('templates/admin_img_popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });
    $scope.zoommyImg = function ($event, src) {
        $scope.imgPopover = src;
        $scope.popover.show($event);
    };

    $scope.updateEditor = function (elementId, minHeight)
    {
        resizeTextArea(elementId, minHeight);
    };
    
    $scope.finish_AdminReply = function () {
        var txtOpinionReply = document.getElementById('txtOpinionReply').value;
        var time = new Date();
        var timeparse = Date.parse(time);
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
                                    alert(JSON.stringify(json) + " json ");
                                    var comment_new = {
                                        commentId: json.result.commentId,
                                        content: txtOpinionReply,
                                        fullname : fullName,
                                        time: time.toLocaleDateString()};
                                    dataAdminFeedback.selectedItem.comment.push(comment_new);
                                    dataAdminFeedback.selectedItem.status = 2;
                                    $state.go('admin_feedback_comment', {}, {reload: true});
                                });
                            }).fail(function (err) {
                                $ionicPopup.show({
                                    title: 'Thông Báo',
                                    template: "postFeedback Error " + JSON.stringify(err),
                                    buttons: [{text: 'Ok'}]
                                });
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