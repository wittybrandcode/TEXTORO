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
        switch (category) {
            case 'type':
            case 'box':
            case 'mix':
            case 'toro':
                scriptName = 'applyPreset';
                break;
            case 'motion':
                scriptName = 'applyMotionPreset';
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
            title: '🗑️ Delete Preset',
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
     * حفظ Preset من الطبقة
     */
    function saveFromLayer(category) {
        TEXTORO.log('savePresetFromLayer: ' + category);
        
        // TORO
        if (category === 'toro') {
            TEXTORO.HostBridge.run('getToroValuesForPreset', null, function(res) {
                if (!res.success) {
                    TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Cannot get TORO values'));
                    return;
                }
                
                var valuesToSave = res.data.values;
                
                TEXTORO.UI.Modals.showInput({
                    title: '🐂 Save TORO Template',
                    label: 'Name:',
                    value: 'My TORO',
                    showIcon: true,
                    icon: '🐂',
                    onOK: function(name, icon) {
                        if (!name) return;
                        
                        var saveData = {
                            category: 'toro',
                            name: name,
                            icon: icon || '🐂',
                            values: valuesToSave
                        };
                        
                        TEXTORO.HostBridge.run('savePreset', saveData, function(saveRes) {
                            if (saveRes.success) {
                                TEXTORO.UI.StatusBar.success('🐂 TORO saved!');
                                if (TEXTORO.Panels.Presets && TEXTORO.Panels.Presets.load) {
                                    TEXTORO.Panels.Presets.load(true);
                                }
                            } else {
                                TEXTORO.UI.StatusBar.error('Error: ' + saveRes.error);
                            }
                        });
                    }
                });
            });
            return;
        }
        
        // Motion
        if (category === 'motion') {
            TEXTORO.HostBridge.run('getMotionValuesForPreset', null, function(res) {
                if (!res.success) {
                    TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'No Motion on layer'));
                    return;
                }
                
                var valuesToSave = res.data.values;
                
                TEXTORO.UI.Modals.showInput({
                    title: '💾 Save Motion Preset',
                    label: 'Name:',
                    value: 'Motion Preset',
                    showIcon: true,
                    icon: '🎬',
                    onOK: function(name, icon) {
                        if (!name) return;
                        
                        var saveData = {
                            category: 'motion',
                            name: name,
                            icon: icon || '🎬',
                            values: valuesToSave
                        };
                        
                        TEXTORO.HostBridge.run('savePreset', saveData, function(saveRes) {
                            if (saveRes.success) {
                                TEXTORO.UI.StatusBar.success('Motion preset saved!');
                                if (TEXTORO.Panels.Presets && TEXTORO.Panels.Presets.load) {
                                    TEXTORO.Panels.Presets.load(true);
                                }
                            } else {
                                TEXTORO.UI.StatusBar.error('Error: ' + saveRes.error);
                            }
                        });
                    }
                });
            });
            return;
        }
        
        // Type, Box, Mix
        TEXTORO.HostBridge.run('getLayerValuesForPreset', { category: category }, function(res) {
            TEXTORO.log('getLayerValuesForPreset result: ' + JSON.stringify(res));
            
            if (!res.success) {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
                return;
            }
            
            if (!res.data || !res.data.values) {
                TEXTORO.UI.StatusBar.error('Error: No values returned');
                return;
            }
            
            var valuesToSave = res.data.values;
            
            TEXTORO.UI.Modals.showInput({
                title: '💾 Save Preset',
                label: 'Name:',
                value: category.charAt(0).toUpperCase() + category.slice(1) + ' Preset',
                showIcon: true,
                icon: '📄',
                onOK: function(name, icon) {
                    if (!name) return;
                    
                    var saveData = {
                        category: category,
                        name: name,
                        icon: icon || '📄',
                        values: valuesToSave
                    };
                    
                    TEXTORO.HostBridge.run('savePreset', saveData, function(saveRes) {
                        if (saveRes.success) {
                            TEXTORO.UI.StatusBar.success('Preset saved!');
                            if (TEXTORO.Panels.Presets && TEXTORO.Panels.Presets.load) {
                                TEXTORO.Panels.Presets.load(true);
                            }
                        } else {
                            TEXTORO.UI.StatusBar.error('Error: ' + saveRes.error);
                        }
                    });
                }
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
