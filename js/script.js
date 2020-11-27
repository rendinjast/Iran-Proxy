// @ERFAN KHADIVAR

var count = 0;
var oProxy = {};
var config = {};
var activeProxy;
var freeProxies = {};

function closePop() {
  window.close();
}

function refresh() {
  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.reload(tab.id);
  });
}

function direct() {
  $("#activeFreeProxy").css("display", "none");

  var config = {
    mode: "direct",
  };
  chrome.proxy.settings.set({ value: config, scope: "regular" }, function () {
    oProxy.proxyProfile.active = "direct";
    chrome.storage.sync.set(oProxy, function () {});
    chrome.browserAction.getBadgeText({}, function (g) {
      chrome.browserAction.setBadgeText({ text: "" });
    });
    chrome.storage.sync.get(null, function (items) {
      if (items.reloadStatus != false) {
        refresh();
      }
      chrome.storage.sync.remove("freeProxyConfig");
      closePop();
    });
  });
}



function switchProxy() {
  document.querySelector("#website").addEventListener("click", function () {
    chrome.tabs.create({
      url: "https://google.com/",
      active: true,
    });
  });
  document.querySelector("#noProxy").addEventListener("click", direct);
}

function setFreeProxy(ip, port, type) {
  oProxy.proxyProfile.active = "free";
  chrome.storage.sync.set(oProxy);
  var freeProxyConfig = {},
    fpc = {};
  freeProxyConfig["ip"] = ip;
  freeProxyConfig["port"] = port;
  freeProxyConfig["country"] = country;
  fpc["freeProxyConfig"] = freeProxyConfig;
  console.log(fpc);
  chrome.storage.sync.set(fpc);

  var proxyConfig = {
    value: {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: type,
          host: ip,
          port: +port,
        },
      },
    },
    scope: "regular",
  };
  chrome.proxy.settings.set(proxyConfig, function () {
    chrome.browserAction.getBadgeText({}, function (g) {
      chrome.browserAction.setBadgeText({ text: "P" });
      chrome.browserAction.setBadgeBackgroundColor({ color: "#ebb309" });
    });
  });
}

function showProxies(country, proxyList) {
  console.log("proxyList: ", proxyList);
  if (!proxyList) return;
  $(proxyList).each(function (i, proxy) {
    $("#freeProxies").append(
      `<tr class="item proxylist"><td>${proxy.ip}</td><td>${proxy.port}</td><td>${proxy.type}</td></tr>`
    );
  });
  $(".proxylist").on("click", function () {
    const ip = $(this).find("td:eq(0)").text();
    const port = $(this).find("td:eq(1)").text();
    const type = $(this).find("td:eq(2)").text().toLowerCase();
    console.log(type);
    setFreeProxy(ip, port, type);
    refresh();
    closePop();
  });
}

function loadFreeProxies() {
  var freeProxiesOrdered = {};
  Object.keys(freeProxies)
    .sort()
    .forEach(function (key) {
      freeProxiesOrdered[key] = freeProxies[key];
    });
  country = "Iran";
  showProxies(country, freeProxiesOrdered[country]);
}

function getFreeProxies() {
  try {
    $.ajax({
      url: "https://www.proxyhub.me/en/ir-free-proxy-list.html",
      method: "GET",
      dataType: "html",
      cache: false,
      async: true,
      success: function (data) {
        var rows = $(data).find(".table tbody tr");
        if (!rows.length) {
          throw new Error();
        }
        $(rows).each(function () {
          var ip = $(this).find("td:eq(0)").text();
          var port = $(this).find("td:eq(1)").text();
          var type = $(this).find("td:eq(2)").text();
          if (freeProxies["Iran"]) {
            freeProxies["Iran"].push({ ip, port, type });
          } else {
            freeProxies["Iran"] = [{ ip, port, type }];
          }
        });
        console.log("freeProxies: ", freeProxies);
        loadFreeProxies();
      },
    });
  } catch (e) {
    return console.log(e);
  }
}

$(document).ready(function () {
  getFreeProxies();
  try {
    chrome.storage.sync.get(null, function (items) {
      if (!items.freeProxyConfig) {
        var freeProxyConfig;
        oProxy.freeProxyConfig = freeProxyConfig;
      } else if (items.freeProxyConfig.country) {
        $("#menu").css("display", "none");
        $("#isConnected").css("display", "flex");
        $("#isConnected").append(
          `<span>${
            items.freeProxyConfig.ip + ":" + items.freeProxyConfig.port
          }</span>`
        );
      }

      if (items.proxyProfile) {
        activeProxy = items.proxyProfile.active;
        console.log("activeProxy: ", activeProxy);
      } else {
        activeProxy = "direct";
      }
      for (key in items) {
        if (
          key.length > 2 &&
          key != "myUA" &&
          key != "setUA" &&
          key != "proxyProfile" &&
          key != "freeProxyConfig" &&
          key != "auth" &&
          key != "timer" &&
          key != "notifyStatus" &&
          key != "reloadStatus" &&
          key != "rules" &&
          key != "mode" &&
          key != "activeProxy" &&
          key != "privacyPolicy" &&
          key != "bl" &&
          key != "installedNotification" &&
          key != "updatedNotification"
        ) {
          n.i = key;
          console.log(items[n.i].a);
          var s0 = items[n.i].a;
          var s1 = items[n.i].c;
          var s2 = items[n.i].d;
          myDiv(s0, s1, s2, count);
          count++;
        }
      }
      console.log("Manual Proxy Profile: ", count);
      chrome.storage.sync.remove("activeProxy");
      var proxyProfile = {};
      proxyProfile.total = count;
      if (activeProxy !== "direct") {
        proxyProfile.active = items.proxyProfile.active;
      } else {
        proxyProfile.active = "direct";
      }
      oProxy.proxyProfile = proxyProfile;
      chrome.storage.sync.set(oProxy, function () {});
    });
  } catch (err) {
    console.log("Load Manual Proxy Profiles (popup): ", err);
  }

  switchProxy();

  chrome.storage.sync.set(oProxy, function () {});
});
