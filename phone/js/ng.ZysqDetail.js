angular.module("myApp", ["ngq"]).service("Data", function() {
  return {
    itemList: [],
    itemListEmpty: !1,
    itemListErr: !1,
    itemListLoaded: !1,
    YyList:[],
    pharmacyId:"",
    pharmacy:"",
    apply:null,
    patient: null,
    shopId: "",
    shopName: "",
    id:"",
  }
}).service("subscribe", ["$timeout", "Data", "getZyList", "getYyList","applyZy", function(t, e, i, a, z) {
  return function() {
    appcan.window.subscribe("EDZY/ZyList.refresh", function() {
      i()
    }),
    appcan.window.subscribe("EDZY/YyList.refresh", function() {
      a()
    }),
    appcan.window.subscribe("EDZY/ShopSelect.shopSelected", function() {
      var o = localStorage.getItem("EDZY/ShopSelect.shop"),
      d = angular.fromJson(o);console.log("shop----"+JSON.stringify(d));
      t(function() {
        e.pharmacyId = d.id, e.pharmacy = d.name
      })
    }),
    appcan.window.subscribe("EDZY/ZysqDetail.apply", function() {
      z()
    })
  }
}]).service("getPatientDetail", ["$timeout", "Data", "$filter", "getFlow", "imgSpliter", function(e, t, o, i, n) {
    //获取患者详情
  return function() {
    var o = localStorage.getItem("EDZY/ZysqDetail.patientId");
    console.log("patientId: %s", o);
    var i = {};
    console.log(i), appcan.window.openToast(CR.TOAST_WAITING), appcan.request.ajax({
      type: "GET",
      url: SimcereConfig.server.edzy + "patient/" + o,
      data: i,
      contentType: "application/json",
      dataType: "json",
      timeout: REQUEST_TIMEOUT,
      success: function(o, i, a, r, s) {
        if (appcan.window.closeToast(), console.log(o), "0" != o.status) appcan.window.openToast(o.msg, SimcereConfig.ui.toastDuration);
        else {
          var c = o.data;
          c.idcardFilesView = n(c.idcardFiles), c.hkFilesView = n(c.hkFiles), c.ssqxView = [c.province || "", c.city || "", c.area || "", c.addr || ""].join(""), e(function() {
            t.patient = o.data;
            t.patient.miArea = t.patient.miProvince + t.patient.miCity;
            console.log("data-----"+JSON.stringify(o.data));
          });
          var l = 'qlib.setHeaderState("' + o.data.flowType + '", "' + o.data.state + '")';
          console.log(l), qlib.evalScriptInWindow("", l), localStorage.setItem("EDZY/Flow.id", o.data.flowId), console.log("FlowId: %s", o.data.flowId)
        }
      },
      error: function(o, i, n, a) {
        // appcan.window.openToast("网络连接不可用", 2e3), console.error(i), e(function() {
          // //t.itemListErr = !t.itemList.length
        // })
      }
    })
  }
}]).service("getZyList", ["$timeout", "Data", function(t, e) {
    //获取赠药周期列表
  return function() {
    if (!e.loading) {
        e.loading = !0;
        var i = localStorage.getItem("EDZY/ZysqDetail.patientId");    //EDZY/PatientDetail.patientId
        console.log("Zy patientId: %s", i);
        var n = {
          rId: qlib.getUser().loginId,
          patientId: i
        };
        console.log(n), appcan.window.openToast(CR.TOAST_WAITING), appcan.request.ajax({
          type: "GET",
          url: SimcereConfig.server.edzy + "givencyc",
          data: n,
          contentType: "application/json",
          dataType: "json",
          timeout: REQUEST_TIMEOUT,
          success: function(i, n, s, r, c) {
            e.loading = !1, appcan.window.closeToast(), console.log(i), "2" == i.status && (i.status = "0", i.data = []), "0" != i.status ? (appcan.window.openToast(i.msg, SimcereConfig.ui.toastDuration), console.error("res error"), t(function() {
                e.itemListErr = !e.itemList.length
              })) : t(function() {
                e.itemList = e.itemList.concat(i.data), e.itemListEmpty = !e.itemList.length;
                console.log("e.itemListEmpty----"+e.itemListEmpty);
              })
          },
          error: function(e, o, t, i) {
            appcan.window.openToast("网络连接不可用", 2e3), console.error(o)
          }
        })
    }
  }
}]).service("getYyList", ["$timeout", "Data", function(t, e) {
    //获取诊疗信息列表
  return function() {
    if (!e.Yyloading) {
        e.Yyloading = !0;
        var i = localStorage.getItem("EDZY/ZysqDetail.patientId");    //EDZY/PatientDetail.patientId
        console.log("Zy patientId: %s", i);
        var n = {
          rId: qlib.getUser().loginId,
          patientId: i,
          version: '1',
        };
        console.log(n), appcan.window.openToast(CR.TOAST_WAITING), appcan.request.ajax({
          type: "GET",
          url: SimcereConfig.server.edzy + "case",
          data: n,
          contentType: "application/json",
          dataType: "json",
          timeout: REQUEST_TIMEOUT,
          success: function(i, n, s, r, c) {
            e.Yyloading = !1, appcan.window.closeToast(), console.log(i), "2" == i.status && (i.status = "0", i.data = []), "0" != i.status ? (appcan.window.openToast(i.msg, SimcereConfig.ui.toastDuration), console.error("res error"), t(function() {
                e.itemListErr = !e.itemList.length
              })) : t(function() {
                e.YyList = e.YyList.concat(i.data), e.itemListEmpty = !e.YyList.length;
              })
          },
          error: function(e, o, t, i) {
            appcan.window.openToast("网络连接不可用", 2e3), console.error(o)
          }
        })
    }
  }
}]).service("getCycleList", ["$timeout", "Data", function(t, e) {
    return function(o) {
        o.detailActive = !o.detailActive;
        if(!o.onload){
            //根据诊疗信息Id查询用药周期
            var n = {
              caseId: o.id,
            };
            console.log(n), appcan.window.openToast(CR.TOAST_WAITING), appcan.request.ajax({
              type: "GET",
              url: SimcereConfig.server.edzy + "cycle",
              data: n,
              contentType: "application/json",
              dataType: "json",
              timeout: REQUEST_TIMEOUT,
              success: function(i, n, s, r, c) {
                e.loading = !1, appcan.window.closeToast(), console.log(i), "0" != i.status ? (appcan.window.openToast(i.msg, SimcereConfig.ui.toastDuration), console.error("res error")) : t(function() {
                    o.cycleList = i.data, o.onload = true
                  })
              },
              error: function(e, o, t, i) {
                appcan.window.openToast("网络连接不可用", 2e3), console.error(o)
              }
            })
        }
    }
}]).service("applyZy", ["$timeout", "Data", function(e, t) { //查看诊疗信息
  return function() {
    var pId = localStorage.getItem("EDZY/ZysqDetail.patientId");
    var pName = localStorage.getItem("EDZY/ZysqDetail.patientName");
    var param = {
      rId: qlib.getUser().loginId,
      patientId: pId,
      pharmacyId: t.pharmacyId,
      pharmacy:t.pharmacy,
      username:pName,
    };
    console.log(param);
    return !param.pharmacyId ? void appcan.window.alert("提示", "请选择药店", ["知道了"]) : (appcan.window.openToast(CR.TOAST_WAITING), void appcan.request.ajax({
      type: "POST",
      url: SimcereConfig.server.edzy + "apply",
      data: param,
      contentType: "application/json",
      dataType: "json",
      timeout: REQUEST_TIMEOUT,
      success: function(i, n, s, r, c) {
        e.loading = !1, appcan.window.closeToast(), console.log(i), "0" != i.status ? (appcan.window.openToast(i.msg, SimcereConfig.ui.toastDuration), console.error("res error")) : (appcan.window.publish("EDZY/ZysqList.refresh", ""), appcan.window.openToast(i.msg || "操作失败", SimcereConfig.ui.toastDurationCb), setTimeout(function() {
            qlib.closeCurrentWindow(-1)
          }, SimcereConfig.ui.toastDurationCb))
      },
      error: function(e, o, t, i) {
        appcan.window.openToast("网络连接不可用", 2e3), console.error(o)
      }
    }))
  }
}]).service("openCaseDetail", ["$timeout", "Data", function(e, t) { //查看诊疗信息
  return function(o) {
    localStorage.setItem("EDZY/YyCaseDetail.CaseId", o.id), void appcan.window.open("EDZY_YyCaseDetail", "YyCaseDetail.html", 10)
  }
}]).service("openCycleDetail", ["$timeout", "Data", function(e, t) {    //查看用药周期详情
  return function(o) {
    localStorage.setItem("EDZY/YyCycleDetail.cycleId", o.id), void appcan.window.open("EDZY_YyCycleDetail", "YyCycleDetail.html", 10)
  }
}]).service("openZyDetail", ["$timeout", "Data", function(t, e) {
  return function(t) {var n = localStorage.getItem("EDZY/ZyzqDetail.ZyzqId");
    return console.log("ZyzqId: %s", t.id), localStorage.setItem("EDZY/ZyzqDetail.ZyzqId", t.id), void appcan.window.open("EDZY_ZyzqDetail", "ZyzqDetail.html", 10)
  }
}]).controller("ItemListController", ["$scope", "$timeout", "Data","getZyList","openZyDetail", function(e, o, t, i, a) {
    e.openZyDetail = a, i();
}]).controller("YyListController",["$scope", "$timeout", "Data","getYyList","getCycleList","openCaseDetail","openCycleDetail", function(e, o, t, i, a, n, c) {
    e.getCycleList = a,e.openCaseDetail = n,e.openCycleDetail = c, i();
}]).controller("GlbController", ["$scope", "$timeout", "Data","getPatientDetail", "subscribe", "openFlow", "ngqViewImages","applyZy", function(e, o, t, i, c, a, n, s) {
  e.Data = t, e.ngqViewImages = n, e.openFlow = a, e.openShopSelect = function(){
      qlib.openShopSelect()
  }, i(), c();
}]);