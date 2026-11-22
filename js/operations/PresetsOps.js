/**
 * TEXTORO - Presets Operations Module
 * عمليات Presets
 * @version 3.3.0
 */

TEXTORO.Ops = TEXTORO.Ops || {};

TEXTORO.Ops.Presets = (function() {
    'use strict';
    
    /**
     * تطبيق Preset من Hub
     */
    function applyFromHub(preset) {
        if (!preset) {
            TEXTORO.UI.StatusBar.error('Error: No preset selected');
            return;
        }
        
        var category = preset.category;
        if (!category) {
            TEXTORO.UI.StatusBar.error('Error: Preset has no category');
            return;
        }
        
        var opts = {};
        if (preset.fileName) {
            opts.fileName = preset.fileName;
        } else if (preset.id) {
            opts.id = preset.id;
        } else {
            TEXTORO.UI.StatusBar.error('Error: Preset has no identifier');
            return;
        }
        opts.category = category;
        
        var scriptName = '';
        var normCat = (category === 'toro') ? 'templates' : ((category === 'mix') ? 'compound' : ((category === 'motion-full') ? 'motion' : category));
        switch (normCat) {
            case 'type':
            case 'box':
            case 'compound':
            case 'templates':
                scriptName = 'applyPreset';
                break;
            case 'motion':
                scriptName = (preset.values && (preset.values.in || preset.values.out || preset.arena)) ? 'applyMotionPreset' : 'applyPreset';
                break;
            default:
                scriptName = 'applyPreset';
        }
        
        TEXTORO.UI.StatusBar.set('Applying ' + (preset.name || 'preset') + '...', '');
        
        TEXTORO.log('applyPresetFromHub: ' + scriptName + ' with opts: ' + JSON.stringify(opts));
        
        TEXTORO.HostBridge.run(scriptName, opts, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Applied: ' + (preset.name || 'preset'));
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed to apply'));
            }
        });
    }
    
    /**
     * تأكيد وحذف Preset
     */
    function confirmDelete(preset) {
        // DATA-01: الحذف بالـ id فقط (§4.2)
        if (!preset.id || preset.builtin) {
            TEXTORO.UI.StatusBar.error(preset.builtin ? 'Cannot delete built-in preset' : 'Invalid preset id');
            return;
        }
        TEXTORO.UI.Modals.showConfirm({
            title: 'Delete Preset',
            message: 'Delete "' + preset.name + '"?',
            onConfirm: function() {
                TEXTORO.HostBridge.run('deletePreset', { 
                    category: preset.category, 
                    id: preset.id 
                }, function(res) {
                    if (res.success) {
                        TEXTORO.UI.StatusBar.success('Deleted: ' + preset.name);
                        if (TEXTORO.Panels.Presets && TEXTORO.Panels.Presets.load) {
                            TEXTORO.Panels.Presets.load(true);
                        }
                    } else {
                        TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed to delete'));
                    }
                });
            }
        });
    }
    
    /**
     * حفظ Preset من الطبقة بنظام المعاينة الذكي
     */
    function saveFromLayer(preferredCategory) {
        TEXTORO.log('savePresetFromLayer: preferredCategory=' + preferredCategory);
        TEXTORO.UI.StatusBar.set('Inspecting selected layer...', '');

        TEXTORO.HostBridge.run('inspectLayerForPreset', null, function(res) {
            if (!res.success) {
                TEXTORO.UI.StatusBar.warning(res.error || 'Please select a text layer with Type, Box, or Motion effects');
                return;
            }

            var inspectData = res.data;
            if (!inspectData) {
                TEXTORO.UI.StatusBar.error('Error: No layer inspection data returned');
                return;
            }

            TEXTORO.UI.StatusBar.set('', '');

            // Open the smart studio modal with auto-detected modules
            TEXTORO.UI.Modals.showPresetSave(inspectData, function(savePayload) {
                if (!savePayload) return;

                TEXTORO.UI.StatusBar.set('Saving preset "' + savePayload.name + '"...', '');

                TEXTORO.HostBridge.run('savePreset', savePayload, function(saveRes) {
                    if (saveRes.success) {
                        TEXTORO.UI.StatusBar.success('Preset saved: ' + savePayload.name);
                        if (TEXTORO.Panels.Presets && TEXTORO.Panels.Presets.load) {
                            TEXTORO.Panels.Presets.load(true);
                        }
                    } else {
                        TEXTORO.UI.StatusBar.error('Error: ' + (saveRes.error || 'Failed to save preset'));
                    }
                });
            });
        });
    }
    
    // Public API
    return {
        applyFromHub: applyFromHub,
        confirmDelete: confirmDelete,
        saveFromLayer: saveFromLayer
    };
})();

// Aliases للتوافق
function applyPresetFromHub(preset) { TEXTORO.Ops.Presets.applyFromHub(preset); }
function confirmDeletePreset(preset) { TEXTORO.Ops.Presets.confirmDelete(preset); }
function savePresetFromLayer(category) { TEXTORO.Ops.Presets.saveFromLayer(category); }
