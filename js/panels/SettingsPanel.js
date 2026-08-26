/**
 * TEXTORO - Settings Panel Module
 * Settings panel behavior and host bridge wiring.
 * @version 3.3.1
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.Settings = (function() {
    'use strict';

    function formatHostError(res, fallback) {
        var details = fallback || 'Unknown host error';
        if (res && res.error) details = res.error;
        if (res && res.bootstrapError) details += ' | bootstrap=' + res.bootstrapError;
        if (res && res.rawResult) details += ' | raw=' + String(res.rawResult);
        return details;
    }

    /**
     * Initialize panel events.
     */
    function init() {
        var btnBrowse = document.getElementById('btnBrowsePresets');
        var txtPath = document.getElementById('txtPresetsPath');
        if (btnBrowse) btnBrowse.addEventListener('click', browsePresetsFolder);
        if (txtPath) txtPath.addEventListener('click', browsePresetsFolder);

        var btnClearCache = document.getElementById('btnClearCache');
        if (btnClearCache) {
            btnClearCache.addEventListener('click', function() {
                TEXTORO.HostBridge.run('clearExpressionCache', null, function(res) {
                    if (res && res.success) {
                        TEXTORO.UI.StatusBar.success('Cache cleared!');
                    } else {
                        TEXTORO.UI.StatusBar.error('Failed to clear cache: ' + formatHostError(res));
                    }
                });
            });
        }

        var btnReload = document.getElementById('btnReloadPanel');
        if (btnReload) {
            btnReload.addEventListener('click', function() {
                location.reload();
            });
        }

        initExpressionVersions();
        TEXTORO.log('SettingsPanel initialized');
    }

    /**
     * Initialize expression version selectors.
     */
    function initExpressionVersions() {
        var categories = ['typewriter', 'cursor', 'box'];

        categories.forEach(function(category) {
            var selectId = 'selExpr' + category.charAt(0).toUpperCase() + category.slice(1);
            var select = document.getElementById(selectId);

            if (select) {
                loadExpressionVersions(category, select);

                select.addEventListener('change', function() {
                    saveExpressionVersion(category, this.value);
                });
            }
        });
    }

    /**
     * Map UI category to host expression name.
     */
    function getExpressionName(category) {
        if (category === 'cursor') return 'blink';
        if (category === 'box') return 'path4corners';
        return 'sourceText';
    }

    /**
     * Load available expression versions from host.
     */
    function loadExpressionVersions(category, selectElement) {
        var params = {
            category: category,
            name: getExpressionName(category)
        };

        TEXTORO.HostBridge.run('getAvailableVersionsJS', params, function(res) {
            if (res.success && res.data && res.data.versions && res.data.versions.length > 0) {
                var versions = res.data.versions;
                var current = res.data.current || 'v1.0';
                selectElement.innerHTML = '';

                versions.forEach(function(version) {
                    var option = document.createElement('option');
                    option.value = version;
                    option.textContent = version + (version === current ? ' (active)' : '');
                    if (version === current) option.selected = true;
                    selectElement.appendChild(option);
                });
            } else if (!res.success) {
                TEXTORO.UI.StatusBar.error('Failed to load versions: ' + formatHostError(res));
            }
        });
    }

    /**
     * Save selected expression version.
     */
    function saveExpressionVersion(category, version) {
        var params = {
            category: category,
            name: getExpressionName(category),
            version: version
        };

        TEXTORO.HostBridge.run('setActiveVersionJS', params, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Expression version updated. Reload panel to apply.');
            } else {
                TEXTORO.UI.StatusBar.error('Failed to update version: ' + formatHostError(res));
            }
        });
    }

    /**
     * Refresh panel values.
     */
    function refresh() {
        loadCurrentPresetsPath();
    }

    /**
     * Load current presets folder path setting.
     */
    function loadCurrentPresetsPath() {
        TEXTORO.HostBridge.run('getPresetsPathSetting', null, function(res) {
            if (res.success && res.data) {
                var pathInput = document.getElementById('txtPresetsPath');
                var pathStatus = document.getElementById('pathStatus');

                if (pathInput) pathInput.value = res.data.path || '';

                if (pathStatus) {
                    if (res.data.path && res.data.exists && res.data.writable) {
                        pathStatus.textContent = 'Folder is ready';
                        pathStatus.className = 'path-status valid';
                    } else if (res.data.path && res.data.exists) {
                        pathStatus.textContent = 'Folder exists but may not be writable';
                        pathStatus.className = 'path-status invalid';
                    } else if (res.data.path) {
                        pathStatus.textContent = 'Folder does not exist (will be created)';
                        pathStatus.className = 'path-status';
                    } else {
                        pathStatus.textContent = 'No folder selected - click Browse';
                        pathStatus.className = 'path-status invalid';
                    }
                }
                return;
            }

            var loadPathError = formatHostError(res, 'Failed to read presets folder setting');
            TEXTORO.UI.StatusBar.error(loadPathError);

            var status = document.getElementById('pathStatus');
            if (status) {
                status.textContent = 'Failed to read presets folder setting';
                status.className = 'path-status invalid';
            }
        });
    }

    /**
     * Open folder chooser for custom presets location.
     */
    function browsePresetsFolder() {
        TEXTORO.HostBridge.run('browseForPresetsFolder', null, function(res) {
            if (res.success && res.data && res.data.path) {
                var pathInput = document.getElementById('txtPresetsPath');
                var pathStatus = document.getElementById('pathStatus');

                if (pathInput) pathInput.value = res.data.path;

                if (pathStatus) {
                    if (res.data.writable) {
                        pathStatus.textContent = 'Folder selected and writable';
                        pathStatus.className = 'path-status valid';
                    } else {
                        pathStatus.textContent = 'Folder may not be writable';
                        pathStatus.className = 'path-status invalid';
                    }
                }
                return;
            }

            if (res && res.success && res.data && res.data.cancelled) {
                TEXTORO.UI.StatusBar.set('Folder selection cancelled', 'warning');
                return;
            }

            TEXTORO.UI.StatusBar.error(formatHostError(res, 'Failed to browse presets folder'));
        });
    }

    /**
     * Load stored settings.
     */
    function loadSettings() {
        loadCurrentPresetsPath();
    }

    return {
        init: init,
        refresh: refresh,
        loadSettings: loadSettings,
        loadCurrentPresetsPath: loadCurrentPresetsPath,
        browsePresetsFolder: browsePresetsFolder
    };
})();

// Backward-compatible aliases
function initSettingsPanel() { TEXTORO.Panels.Settings.init(); }
function refreshSettingsPanel() { TEXTORO.Panels.Settings.refresh(); }
function loadCurrentPresetsPath() { TEXTORO.Panels.Settings.loadCurrentPresetsPath(); }
function browsePresetsFolder() { TEXTORO.Panels.Settings.browsePresetsFolder(); }
