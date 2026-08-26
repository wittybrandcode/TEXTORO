/**
 * TEXTORO - Host Bridge Module
 * Bridge between CEP panel and ExtendScript host.
 * @version 1.0.0
 */

TEXTORO.HostBridge = (function() {
    'use strict';

    /** @type {CSInterface} */
    var cs = null;
    var bridgeBuild = '2026-03-06.2';
    var bootstrapReady = false;

    /** request counter for debug traces */
    var requestCount = 0;

    var TAG_OK = '__TX_OK__';
    var TAG_ERR = '__TX_ERR__';
    var TAG_BOOT_OK = '__TX_BOOT_OK__';
    var TAG_BOOT_ERR = '__TX_BOOT_ERR__';

    function esc(str) {
        return String(str)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n');
    }

    function parseInvokeResult(raw) {
        if (raw === null || raw === undefined || raw === '' || raw === 'undefined' || raw === 'null') {
            return {
                success: false,
                error: 'Empty response from host (host JSX unavailable or AE scripting access disabled)'
            };
        }

        var text = String(raw);

        if (text.indexOf(TAG_OK) === 0) {
            var payload = text.substring(TAG_OK.length);
            try {
                return JSON.parse(payload);
            } catch (e) {
                return {
                    success: false,
                    error: 'Parse error: ' + e.message,
                    rawResult: payload
                };
            }
        }

        if (text.indexOf(TAG_ERR) === 0) {
            return {
                success: false,
                error: text.substring(TAG_ERR.length)
            };
        }

        // Backward compatibility if host returned plain JSON directly.
        try {
            return JSON.parse(text);
        } catch (e2) {
            return {
                success: false,
                error: 'Parse error: ' + e2.message,
                rawResult: text
            };
        }
    }

    function parseBootstrapResult(raw) {
        if (raw === null || raw === undefined || raw === '' || raw === 'undefined' || raw === 'null') {
            return {
                success: false,
                error: 'Empty response from host (host JSX unavailable or AE scripting access disabled)'
            };
        }

        var text = String(raw);

        if (text.indexOf(TAG_BOOT_OK) === 0) {
            return { success: true, message: text.substring(TAG_BOOT_OK.length) };
        }

        if (text.indexOf(TAG_BOOT_ERR) === 0) {
            return { success: false, error: text.substring(TAG_BOOT_ERR.length) };
        }

        // Backward compatibility if bootstrap returned JSON directly.
        try {
            var parsed = JSON.parse(text);
            if (parsed && typeof parsed.success === 'boolean') {
                return parsed;
            }
        } catch (e) {}

        return {
            success: false,
            error: 'Unexpected bootstrap response',
            rawResult: text
        };
    }

    function buildInvokeScript(funcName, argsStr) {
        var fn = esc(funcName);
        var payload = esc(argsStr);

        return "(function(){try{" +
            "var __fn='" + fn + "';" +
            "var __payload='" + payload + "';" +
            "var __res;" +
            "var __callErr='';" +
            "if(typeof $!=='undefined'&&$.global&&typeof $.global[__fn]==='function'){" +
            "__res=$.global[__fn](__payload);" +
            "}else if(typeof this[__fn]==='function'){" +
            "__res=this[__fn](__payload);" +
            "}else{" +
            "try{__res=eval(__fn + \"('\" + __payload + \"')\");}catch(__e1){__callErr=__e1.toString();}" +
            "}" +
            "if(__callErr){" +
            "var __msg=String(__callErr);" +
            "if(__msg.indexOf('is undefined')!==-1||__msg.indexOf('undefined is not')!==-1||__msg.indexOf('not a function')!==-1){" +
            "return '" + TAG_ERR + "' + 'Host function not found: ' + __fn;" +
            "}" +
            "return '" + TAG_ERR + "' + 'Host exception: ' + __msg;" +
            "}" +
            "if(__res===undefined||__res===null||__res===''){" +
            "return '" + TAG_ERR + "' + 'Host returned empty: ' + __fn;" +
            "}" +
            "return '" + TAG_OK + "' + String(__res);" +
            "}catch(e){" +
            "return '" + TAG_ERR + "' + 'Host exception: ' + e.toString();" +
            "}}())";
    }

    function buildBootstrapScript() {
        var extPath = '';
        try {
            extPath = cs.getSystemPath(SystemPath.EXTENSION) || '';
        } catch (e) {
            extPath = '';
        }

        var normalized = String(extPath).replace(/\\/g, '/').replace(/\/+$/, '');
        if (!normalized) {
            return "'" + TAG_BOOT_ERR + "Host bootstrap path unavailable'";
        }

        var hostIndexPath = normalized + '/host/index.jsx';
        var hostIndexEsc = esc(hostIndexPath);

        return "(function(){try{" +
            "var __f=new File('" + hostIndexEsc + "');" +
            "if(!__f.exists){" +
            "return '" + TAG_BOOT_ERR + "Host bootstrap file missing: " + hostIndexEsc + "';" +
            "}" +
            "$.evalFile(__f);" +
            "return '" + TAG_BOOT_OK + "Host bootstrap loaded';" +
            "}catch(e){" +
            "return '" + TAG_BOOT_ERR + "' + 'Host bootstrap error: ' + e.toString();" +
            "}}())";
    }

    function shouldBootstrap(res) {
        if (!res || res.success) return false;

        var msg = String(res.error || '');
        if (msg.indexOf('Empty response from host') === 0) return true;
        if (msg.indexOf('Host function not found:') === 0) return true;
        if (msg.indexOf('Host returned empty:') === 0) return true;

        if (msg.indexOf('Parse error:') === 0 && res.rawResult) {
            return String(res.rawResult).indexOf('EvalScript error') !== -1;
        }

        return false;
    }

    // F-08: حماية evalScript من الاستثناءات المتزامنة (مثلاً فتح اللوحة خارج AE).
    // يغذي الخطأ بنفس صيغة sentinels ليُفسَّر كفشل طبيعي في parseInvokeResult.
    function safeRun(script, onRaw) {
        try {
            cs.evalScript(script, onRaw);
        } catch (e) {
            var msg = '__TX_ERR__' + String((e && e.message) || e) + '__TX_ERR__';
            onRaw(msg);
        }
    }

    // F-08: طابور bootstrap - كل النداءات المتزامنة تنتظر عملية تحميل واحدة
    var bootQueue = [];
    var bootInFlight = false;

    function bootstrapHost(callback) {
        if (!cs) init();
        if (!cs) {
            if (callback) callback({ success: false, error: 'CSInterface not available' });
            return;
        }

        // دمج النداءات المتزامنة على عملية bootstrap واحدة بدل إطلاقها بالتوازي
        if (bootInFlight) {
            if (callback) bootQueue.push(callback);
            return;
        }
        bootInFlight = true;

        var bootScript = buildBootstrapScript();
        safeRun(bootScript, function(bootRaw) {
            var bootRes = parseBootstrapResult(bootRaw);
            if (bootRes.success) {
                bootstrapReady = true;
            }

            // تنفيذ المنتظرين بنفس النتيجة ثم السماح بإعادة المحاولة لاحقًا عند الفشل
            var queue = bootQueue.splice(0, bootQueue.length);
            bootInFlight = false;
            if (callback) {
                try { callback(bootRes); } catch (_e) {}
            }
            for (var i = 0; i < queue.length; i++) {
                try { queue[i](bootRes); } catch (_e) {}
            }
        });
    }

    function init() {
        if (!cs) {
            try {
                cs = new CSInterface();
                TEXTORO.log('HostBridge initialized');
                if (TEXTORO.Config.DEBUG) {
                    TEXTORO.log('HostBridge build: ' + bridgeBuild);
                }
            } catch (e) {
                TEXTORO.error('Failed to initialize CSInterface: ' + e.message);
            }
        }
        return cs;
    }

    function run(funcName, args, callback) {
        if (!cs) init();
        if (!cs) {
            if (callback) callback({ success: false, error: 'CSInterface not available' });
            return;
        }

        requestCount++;
        var requestId = requestCount;

        var argsStr = 'null';
        try {
            argsStr = args ? JSON.stringify(args) : 'null';
        } catch (e) {
            if (callback) callback({ success: false, error: 'Args JSON stringify failed: ' + e.message });
            return;
        }

        if (TEXTORO.Config.DEBUG) {
            TEXTORO.log('HostBridge[' + requestId + '] -> ' + funcName);
        }

        function finish(res) {
            if (TEXTORO.Config.DEBUG) {
                var status = res && res.success ? 'OK' : 'ERR';
                TEXTORO.log('HostBridge[' + requestId + '] ' + status + ' ' + funcName);
            }

            if (callback) {
                try {
                    callback(res);
                } catch (e) {
                    TEXTORO.error('Callback error in ' + funcName + ': ' + e.message);
                }
            }
        }

        function invoke(allowBootstrap, preBootstrap) {
            var script = buildInvokeScript(funcName, argsStr);
            safeRun(script, function(rawResult) {
                var res = parseInvokeResult(rawResult);

                if (!res.success && preBootstrap && !preBootstrap.success) {
                    res.bootstrapError = preBootstrap.error || 'Host bootstrap failed';
                    if (preBootstrap.rawResult) res.bootstrapRaw = preBootstrap.rawResult;
                }

                if (!res.success && allowBootstrap && shouldBootstrap(res)) {
                    var retryBootScript = buildBootstrapScript();
                    safeRun(retryBootScript, function(bootRaw) {
                        var bootRes = parseBootstrapResult(bootRaw);
                        if (!bootRes.success) {
                            res.bootstrapError = bootRes.error || 'Host bootstrap failed';
                            if (bootRes.rawResult) res.bootstrapRaw = bootRes.rawResult;
                            finish(res);
                            return;
                        }

                        // Retry once after bootstrap.
                        invoke(false);
                    });
                    return;
                }

                finish(res);
            });
        }

        if (!bootstrapReady) {
            bootstrapHost(function(preBootRes) {
                if (preBootRes && preBootRes.success) {
                    invoke(false, preBootRes);
                } else {
                    invoke(true, preBootRes);
                }
            });
            return;
        }

        invoke(true, null);
    }

    function runAsync(funcName, args) {
        return new Promise(function(resolve, reject) {
            run(funcName, args, function(res) {
                if (res.success) {
                    resolve(res);
                } else {
                    reject(new Error(res.error || 'Unknown error'));
                }
            });
        });
    }

    function getCS() {
        if (!cs) init();
        return cs;
    }

    function getSystemInfo() {
        if (!cs) init();
        if (!cs) return null;

        var env = null;
        try {
            env = cs.getHostEnvironment ? cs.getHostEnvironment() : cs.hostEnvironment;
        } catch (e) {
            env = cs.hostEnvironment;
        }

        if (!env) return null;

        return {
            appName: env.appName,
            appVersion: env.appVersion,
            appLocale: env.appLocale,
            osVersion: cs.getOSInformation()
        };
    }

    return {
        init: init,
        run: run,
        runAsync: runAsync,
        getCS: getCS,
        getSystemInfo: getSystemInfo
    };
})();

// Legacy aliases moved to js/legacy/aliases.js
