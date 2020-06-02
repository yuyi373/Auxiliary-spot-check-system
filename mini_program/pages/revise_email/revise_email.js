const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    email: '', //邮箱地址
    code: '', //验证码
    iscode: null, //用于存放验证码接口里获取到的code
    codename: '获取验证码'
  },
  //获取input输入框的值
  getEmailValue: function (e) {
    this.setData({
      email: e.detail.value
    })
  },
  getCodeValue: function (e) {
    this.setData({
      code: e.detail.value
    })
  },
  getVerificationCode: function () {
    var a = this.data.email;
    var _this = this;
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if (this.data.email == "") {
      wx.showToast({
        title: '邮箱地址不能为空',
        icon: 'none',
        duration: 2000
      })
      _this.setData({
        disabled: false
      })
      return false;
    } else if (!myreg.test(this.data.email)) {
      wx.showToast({
        title: '请输入正确的邮箱地址',
        icon: 'none',
        duration: 2000
      })
      _this.setData({
        disabled: false
      })
      return false;
    } else {
      wx.request({
        url: getApp().globalData.server + '/cqcq/public/index.php/index/change/sendMail',
        method: "POST",
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          id: getApp().globalData.user.id,
          email: this.data.email,
        },
        success: function (res) { 
          if (res.data.error_code != 0) {
            wx.showModal({
              title: '提示！',
              content: res.data.msg,
              showCancel: false,
              success:function(res) {
                _this.setData({
                  disabled: false
                })
              }
            })
          } else if (res.data.error_code == 0) {
            _this.setData({
              disabled: true
            })
            wx.showModal({
              title: '恭喜！',
              content: '发送成功！',
              showCancel: false,
              success: res1 => {
                console.log(res.data.data)
                var value = JSON.parse(res.data.data.captcha);
                _this.setData({
                  iscode: value,
                  disabled: true
                })
              },
            })
            var num = 61;
            var timer = setInterval(function () {
              num--;
              if (num <= 0) {
                clearInterval(timer);
                _this.setData({
                  codename: '重新发送',
                  disabled: false
                })
              } else {
                _this.setData({
                  codename: num + "s",
                  disabled: true
                })
              }
            }, 1000)
          }
        },
        fail: function (res) {
          wx.showModal({
            title: '哎呀！',
            content: '网络不在状态！',
            success: function (res) {
              if (res.confirm) {
                console.log("用户点击确认")
              } else if (res.cancel) {
                console.log("用户点击取消")
              }
            },
          })
          _this.setData({
            disabled: false
          })
        }
      })
    }


  },

  //提交表单信息
  save: function () {
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    var _this = this;
    if (this.data.email == "") {
      wx.showToast({
        title: '邮箱地址不能为空',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else if (!myreg.test(this.data.email)) {
      wx.showToast({
        title: '请输入正确的邮箱地址',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (this.data.code == "") {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    } else if (this.data.code != this.data.iscode) {
      wx.showToast({
        title: '验证码错误',
        icon: 'none',
        duration: 1000
      })
      return false;
    } else {
      wx.request({
        'url': getApp().globalData.server + '/cqcq/public/index.php/index/change/verifyModifyEmail',
        //发给服务器的数据
        data: {
          id: getApp().globalData.user.id,
          email: this.data.email,
          captcha: this.data.iscode,
        },
        method: "POST",
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success:function(res){
          if (res.data.error_code != 0) {
            wx.showModal({
              title: '提示！',
              content: res.data.msg,
              showCancel: false,
              success:function(res) {}
            })
          } else if (res.data.error_code == 0) {
            wx.showModal({
              title: '恭喜！',
              content: '修改成功！',
              showCancel: false,
              success:function(res) {},
              complete: function(res){
                getApp().globalData.user.email = _this.data.email;
                wx.navigateBack({
                  delta: 1
                  })
                /*if(getApp().globalData.user.user == 'student') {
                  wx.navigateTo({
                    url: '../student_mine/student_mine',
                  })
                }
              	else {
                  wx.navigateTo({
                    url: '../teacher_mine/teacher_mine',
                  })
                }*/
              },
              fail: function (e) {
                console.log(e);
                wx.showModal({
                  title: '提示',
                  content: '修改失败！',
                  showCancel: false
                })
              },
            })
          }
        },
        fail: function (res) {
          wx.showModal({
            title: '哎呀～',
            content: '网络不在状态呢！',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      })
    }
  },
})