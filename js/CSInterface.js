/**
 * CSInterface - Adobe CEP Interface Library
 */
var CSInterface = function() {};
CSInterface.prototype.hostEnvironment = null;

CSInterface.prototype.getHostEnvironment = function() {
    if (!this.hostEnvironment) {
        this.hostEnvironment = JSON.parse(window.__adobe_cep__.getHostEnvironment());
    }
    return this.hostEnvironment;
};

CSInterface.prototype.closeExtension = function() { window.__adobe_cep__.closeExtension(); };
CSInterface.prototype.getSystemPath = function(pathType) { return window.__adobe_cep__.getSystemPath(pathType); };

CSInterface.prototype.evalScript = function(script, callback) {
    if (callback === null || callback === undefined) { callback = function(result) {}; }
    window.__adobe_cep__.evalScript(script, callback);
};

CSInterface.prototype.getApplicationID = function() { return this.getHostEnvironment().appId; };
CSInterface.prototype.getExtensionID = function() { return window.__adobe_cep__.getExtensionId(); };
CSInterface.prototype.addEventListener = function(type, listener, obj) { window.__adobe_cep__.addEventListener(type, listener, obj); };
CSInterface.prototype.removeEventListener = function(type, listener, obj) { window.__adobe_cep__.removeEventListener(type, listener, obj); };
CSInterface.prototype.requestOpenExtension = function(extensionId, params) { window.__adobe_cep__.requestOpenExtension(extensionId, params); };

CSInterface.prototype.dispatchEvent = function(event) {
    if (typeof event.data === "object") { event.data = JSON.stringify(event.data); }
    window.__adobe_cep__.dispatchEvent(event);
};

CSInterface.prototype.getExtensions = function(extensionIds) {
    var extensionIdsStr = JSON.stringify(extensionIds);
    return JSON.parse(window.__adobe_cep__.getExtensions(extensionIdsStr));
};

CSInterface.prototype.getNetworkPreferences = function() { return JSON.parse(window.__adobe_cep__.getNetworkPreferences()); };
CSInterface.prototype.initResourceBundle = function() { return JSON.parse(window.__adobe_cep__.initResourceBundle()); };
CSInterface.prototype.dumpInstallationInfo = function() { return window.__adobe_cep__.dumpInstallationInfo(); };
CSInterface.prototype.getOSInformation = function() { return this.getHostEnvironment().appUILocale; };
CSInterface.prototype.openURLInDefaultBrowser = function(url) { cep.util.openURLInDefaultBrowser(url); };
CSInterface.prototype.getScaleFactor = function() { return window.__adobe_cep__.getScaleFactor(); };
CSInterface.prototype.setScaleFactorChangedHandler = function(handler) { window.__adobe_cep__.setScaleFactorChangedHandler(handler); };
CSInterface.prototype.getCurrentApiVersion = function() { return JSON.parse(window.__adobe_cep__.getCurrentApiVersion()); };
CSInterface.prototype.setPanelFlyoutMenu = function(menu) { window.__adobe_cep__.invokeSync("setPanelFlyoutMenu", menu); };
CSInterface.prototype.setContextMenu = function(menu, callback) { window.__adobe_cep__.invokeAsync("setContextMenu", menu, callback); };
CSInterface.prototype.setContextMenuByJSON = function(menu, callback) { window.__adobe_cep__.invokeAsync("setContextMenuByJSON", menu, callback); };
CSInterface.prototype.isWindowVisible = function() { return window.__adobe_cep__.invokeSync("isWindowVisible", ""); };
CSInterface.prototype.resizeContent = function(width, height) { window.__adobe_cep__.resizeContent(width, height); };
CSInterface.prototype.setWindowTitle = function(title) { window.__adobe_cep__.invokeSync("setWindowTitle", title); };
CSInterface.prototype.getWindowTitle = function() { return window.__adobe_cep__.invokeSync("getWindowTitle", ""); };

var SystemPath = { USER_DATA: "userData", COMMON_FILES: "commonFiles", MY_DOCUMENTS: "myDocuments", APPLICATION: "application", EXTENSION: "extension", HOST_APPLICATION: "hostApplication" };
function UIColor(red, green, blue, alpha) { this.red = red; this.green = green; this.blue = blue; this.alpha = alpha; }
function CSEvent(type, scope, appId, extensionId) { this.type = type; this.scope = scope; this.appId = appId; this.extensionId = extensionId; this.data = ""; }
