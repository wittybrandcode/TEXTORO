/**
 * TEXTORO - Secondary SubBar Controller
 * شريط التحكم الثانوي الثابت للتبويبات
 * @version 1.1.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.SubBar = (function() {
    'use strict';

    function init() {
        bindTypewriterSubbar();
        bindBoxSubbar();
        bindSogaSubbar();
        bindMarkersSubbar();
        bindMotionSubbar();
        bindSettingsSubbar();
        syncAll();

        TEXTORO.log('SubBar initialized');
    }

    /**
     * 1. Typewriter Subbar
     */
    function bindTypewriterSubbar() {
        var btnLtr = document.getElementById('subTypeLtr');
        var btnRtl = document.getElementById('subTypeRtl');
        var origLtr = document.getElementById('btnLTR');
        var origRtl = document.getElementById('btnRTL');

        if (btnLtr && origLtr) {
            btnLtr.addEventListener('click', function() {
                origLtr.click();
                syncTypewriter();
            });
        }
        if (btnRtl && origRtl) {
            btnRtl.addEventListener('click', function() {
                origRtl.click();
                syncTypewriter();
            });
        }

        // Toggle Word Mode
        bindToggle('subTypeWordMode', 'chkWordMode', function() {
            if (TEXTORO.Panels.Typewriter && TEXTORO.Panels.Typewriter.update) {
                TEXTORO.Panels.Typewriter.update();
            }
        });

        // Toggle Cursor
        bindToggle('subTypeCursor', 'chkCursor', function() {
            if (TEXTORO.Panels.Typewriter && TEXTORO.Panels.Typewriter.update) {
                TEXTORO.Panels.Typewriter.update();
            }
        });

        // Toggle Reverse
        bindToggle('subTypeReverse', 'chkReverse', function() {
            if (TEXTORO.Panels.Typewriter && TEXTORO.Panels.Typewriter.update) {
                TEXTORO.Panels.Typewriter.update();
            }
        });

        // Toggle No OUT
        bindToggle('subTypeNoOut', 'chkNoOut', function() {
            if (TEXTORO.Panels.Typewriter && TEXTORO.Panels.Typewriter.update) {
                TEXTORO.Panels.Typewriter.update();
            }
        });

        // Toggle Blink In Hold
        bindToggle('subTypeBlinkInHold', 'chkBlinkInHold', function() {
            if (TEXTORO.Panels.Typewriter && TEXTORO.Panels.Typewriter.update) {
                TEXTORO.Panels.Typewriter.update();
            }
        });

        // Quick Actions
        var btnGet = document.getElementById('subTypeGetText');
        var origGet = document.getElementById('btnGetText');
        if (btnGet && origGet) {
            btnGet.addEventListener('click', function() { origGet.click(); });
        }

        var btnUpd = document.getElementById('subTypeUpdateText');
        var origUpd = document.getElementById('btnUpdateText');
        if (btnUpd && origUpd) {
            btnUpd.addEventListener('click', function() { origUpd.click(); });
        }
    }

    function syncTypewriter() {
        var origLtr = document.getElementById('btnLTR');
        var btnLtr = document.getElementById('subTypeLtr');
        var btnRtl = document.getElementById('subTypeRtl');
        var isLtr = origLtr ? origLtr.classList.contains('active') : true;

        if (btnLtr) btnLtr.classList.toggle('active', isLtr);
        if (btnRtl) btnRtl.classList.toggle('active', !isLtr);

        syncBtnState('subTypeWordMode', 'chkWordMode');
        syncBtnState('subTypeCursor', 'chkCursor');
        syncBtnState('subTypeReverse', 'chkReverse');
        syncBtnState('subTypeNoOut', 'chkNoOut');
        syncBtnState('subTypeBlinkInHold', 'chkBlinkInHold');
    }

    /**
     * 2. Box Subbar
     */
    function bindBoxSubbar() {
        bindToggle('subBoxAutoResize', 'chkAutoResize', function() {
            if (TEXTORO.Panels.Box && TEXTORO.Panels.Box.update) TEXTORO.Panels.Box.update();
        });

        bindToggle('subBoxHideEmpty', 'chkHideEmpty', function() {
            if (TEXTORO.Panels.Box && TEXTORO.Panels.Box.update) TEXTORO.Panels.Box.update();
        });

        bindToggle('subBoxParentToText', 'chkParentToText', function() {
            if (TEXTORO.Panels.Box && TEXTORO.Panels.Box.update) TEXTORO.Panels.Box.update();
        });

        bindToggle('subBox4Corners', 'chk4Corners', function() {
            var row = document.getElementById('fourCornersRow');
            var single = document.getElementById('singleCornerRow');
            var chk = document.getElementById('chk4Corners');
            if (row && chk) row.style.display = chk.checked ? '' : 'none';
            if (single && chk) single.style.display = chk.checked ? 'none' : '';
            if (TEXTORO.Panels.Box && TEXTORO.Panels.Box.update) TEXTORO.Panels.Box.update();
        });

        bindToggle('subBoxLockSize', 'chkLockSize', function() {
            if (TEXTORO.Panels.Box && TEXTORO.Panels.Box.update) TEXTORO.Panels.Box.update();
        });

        // Toggle Fill Visibility
        var btnFill = document.getElementById('subBoxToggleFill');
        var fillOp = document.getElementById('numFillOp');
        if (btnFill && fillOp) {
            btnFill.addEventListener('click', function() {
                var cur = parseFloat(fillOp.value) || 0;
                if (cur > 0) {
                    btnFill._lastOp = cur;
                    fillOp.value = 0;
                    btnFill.classList.remove('active');
                } else {
                    fillOp.value = btnFill._lastOp || 100;
                    btnFill.classList.add('active');
                }
                fillOp.dispatchEvent(new Event('change'));
                if (TEXTORO.Panels.Box && TEXTORO.Panels.Box.update) TEXTORO.Panels.Box.update();
            });
        }

        // Toggle Stroke Visibility
        var btnStroke = document.getElementById('subBoxToggleStroke');
        var strokeWidth = document.getElementById('numStrokeW');
        if (btnStroke && strokeWidth) {
            btnStroke.addEventListener('click', function() {
                var cur = parseFloat(strokeWidth.value) || 0;
                if (cur > 0) {
                    btnStroke._lastWidth = cur;
                    strokeWidth.value = 0;
                    btnStroke.classList.remove('active');
                } else {
                    strokeWidth.value = btnStroke._lastWidth || 2;
                    btnStroke.classList.add('active');
                }
                strokeWidth.dispatchEvent(new Event('change'));
                if (TEXTORO.Panels.Box && TEXTORO.Panels.Box.update) TEXTORO.Panels.Box.update();
            });
        }
    }

    function syncBox() {
        syncBtnState('subBoxAutoResize', 'chkAutoResize');
        syncBtnState('subBoxHideEmpty', 'chkHideEmpty');
        syncBtnState('subBoxParentToText', 'chkParentToText');
        syncBtnState('subBox4Corners', 'chk4Corners');
        syncBtnState('subBoxLockSize', 'chkLockSize');

        var fillOp = document.getElementById('numFillOp');
        var btnFill = document.getElementById('subBoxToggleFill');
        if (btnFill && fillOp) {
            btnFill.classList.toggle('active', (parseFloat(fillOp.value) || 0) > 0);
        }

        var strokeWidth = document.getElementById('numStrokeW');
        var btnStroke = document.getElementById('subBoxToggleStroke');
        if (btnStroke && strokeWidth) {
            btnStroke.classList.toggle('active', (parseFloat(strokeWidth.value) || 0) > 0);
        }
    }

    /**
     * 3. Control / SOGA Subbar
     */
    function bindSogaSubbar() {
        var btnRef = document.getElementById('subSogaRefresh');
        var origRef = document.getElementById('btnSogaRefresh') || document.getElementById('sogaRefreshBtn');
        if (btnRef && origRef) {
            btnRef.addEventListener('click', function() { origRef.click(); });
        }

        function scrollToEl(targetId) {
            var target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        var btnType = document.getElementById('subSogaScrollType');
        if (btnType) {
            btnType.addEventListener('click', function() { scrollToEl('sogaTypewriter'); });
        }

        var btnBox = document.getElementById('subSogaScrollBox');
        if (btnBox) {
            btnBox.addEventListener('click', function() { scrollToEl('sogaBox'); });
        }

        var btnMot = document.getElementById('subSogaScrollMotion');
        if (btnMot) {
            btnMot.addEventListener('click', function() { scrollToEl('sogaMotion'); });
        }

        bindToggle('subSogaTwAuto', 'sogaTwAuto');
        bindToggle('subSogaBoxRtl', 'sogaBoxRTL');

        var btnExpand = document.getElementById('subSogaExpandAll');
        if (btnExpand) {
            btnExpand.addEventListener('click', function() {
                var contents = document.querySelectorAll('#panel-inspector .collapsible-content, #panel-soga .collapsible-content');
                var anyHidden = Array.from(contents).some(function(c) { return c.style.display === 'none'; });
                contents.forEach(function(c) {
                    c.style.display = anyHidden ? 'block' : 'none';
                });
                btnExpand.classList.toggle('active', anyHidden);
            });
        }
    }

    function syncSoga() {
        syncBtnState('subSogaTwAuto', 'sogaTwAuto');
        syncBtnState('subSogaBoxRtl', 'sogaBoxRTL');
    }

    /**
     * 4. Markers Subbar
     */
    function bindMarkersSubbar() {
        function bindMarkerFilter(btnId, chk1Id, chk2Id) {
            var btn = document.getElementById(btnId);
            var chk1 = document.getElementById(chk1Id);
            var chk2 = document.getElementById(chk2Id);
            if (!btn || !chk1 || !chk2) return;

            btn.addEventListener('click', function() {
                var nextState = !(chk1.checked && chk2.checked);
                chk1.checked = nextState;
                chk2.checked = nextState;
                btn.classList.toggle('active', nextState);
                if (TEXTORO.Panels.Markers && TEXTORO.Panels.Markers.renderTable) {
                    TEXTORO.Panels.Markers.renderTable();
                }
            });
        }

        bindMarkerFilter('subMarkersFilterIn', 'filterInStart', 'filterInEnd');
        bindMarkerFilter('subMarkersFilterOut', 'filterOutStart', 'filterOutEnd');
        bindMarkerFilter('subMarkersFilterBlink', 'filterBlinkStart', 'filterBlinkEnd');

        var btnSelLayer = document.getElementById('subMarkersSelectLayer');
        var origSelLayer = document.getElementById('btnSelectLayer');
        if (btnSelLayer && origSelLayer) {
            btnSelLayer.addEventListener('click', function() { origSelLayer.click(); });
        }

        var btnSelInv = document.getElementById('subMarkersSelectInvert');
        var origSelInv = document.getElementById('btnSelectInvert');
        if (btnSelInv && origSelInv) {
            btnSelInv.addEventListener('click', function() { origSelInv.click(); });
        }

        var btnSelNone = document.getElementById('subMarkersSelectNone');
        var origSelNone = document.getElementById('btnSelectNone');
        if (btnSelNone && origSelNone) {
            btnSelNone.addEventListener('click', function() { origSelNone.click(); });
        }

        var btnRef = document.getElementById('subMarkersRefresh');
        if (btnRef) {
            btnRef.addEventListener('click', function() {
                if (TEXTORO.Panels.Markers && TEXTORO.Panels.Markers.load) {
                    TEXTORO.Panels.Markers.load();
                }
            });
        }
    }

    function syncMarkers() {
        var in1 = document.getElementById('filterInStart');
        var in2 = document.getElementById('filterInEnd');
        var btnIn = document.getElementById('subMarkersFilterIn');
        if (btnIn && in1 && in2) btnIn.classList.toggle('active', in1.checked || in2.checked);

        var out1 = document.getElementById('filterOutStart');
        var out2 = document.getElementById('filterOutEnd');
        var btnOut = document.getElementById('subMarkersFilterOut');
        if (btnOut && out1 && out2) btnOut.classList.toggle('active', out1.checked || out2.checked);

        var blk1 = document.getElementById('filterBlinkStart');
        var blk2 = document.getElementById('filterBlinkEnd');
        var btnBlk = document.getElementById('subMarkersFilterBlink');
        if (btnBlk && blk1 && blk2) btnBlk.classList.toggle('active', blk1.checked || blk2.checked);
    }

    /**
     * 5. Motion Subbar
     */
    function bindMotionSubbar() {
        var btnModeIn = document.getElementById('subMotionModeIn');
        var btnModeOut = document.getElementById('subMotionModeOut');
        var origModeIn = document.getElementById('motionArenaInBtn');
        var origModeOut = document.getElementById('motionArenaOutBtn');

        if (btnModeIn && origModeIn) {
            btnModeIn.addEventListener('click', function() {
                origModeIn.click();
                syncMotion();
            });
        }
        if (btnModeOut && origModeOut) {
            btnModeOut.addEventListener('click', function() {
                origModeOut.click();
                syncMotion();
            });
        }

        bindToggle('subMotionSyncTw', 'motionSyncEnable');
        bindToggle('subMotionOutEnable', 'motionOutEnable');
        bindToggle('subMotionTogglePos', 'motionPosEnable');
        bindToggle('subMotionToggleScale', 'motionScaleEnable');
        bindToggle('subMotionToggleRot', 'motionRotEnable');
        bindToggle('subMotionToggleOpacity', 'motionOpacityEnable');

        var btnSim = document.getElementById('subMotionSimPhysics');
        var origSim = document.getElementById('btnPhysicsTestSim');
        if (btnSim && origSim) {
            btnSim.addEventListener('click', function() { origSim.click(); });
        }
    }

    function syncMotion() {
        var origIn = document.getElementById('motionArenaInBtn');
        var origOut = document.getElementById('motionArenaOutBtn');
        var btnIn = document.getElementById('subMotionModeIn');
        var btnOut = document.getElementById('subMotionModeOut');

        if (btnIn && origIn) btnIn.classList.toggle('active', origIn.classList.contains('active'));
        if (btnOut && origOut) btnOut.classList.toggle('active', origOut.classList.contains('active'));

        syncBtnState('subMotionSyncTw', 'motionSyncEnable');
        syncBtnState('subMotionOutEnable', 'motionOutEnable');
        syncBtnState('subMotionTogglePos', 'motionPosEnable');
        syncBtnState('subMotionToggleScale', 'motionScaleEnable');
        syncBtnState('subMotionToggleRot', 'motionRotEnable');
        syncBtnState('subMotionToggleOpacity', 'motionOpacityEnable');
    }

    /**
     * 6. Settings Subbar
     */
    function bindSettingsSubbar() {
        var btnFold = document.getElementById('subSettingsOpenFolder');
        var origFold = document.getElementById('openPresetsFolderBtn');
        if (btnFold && origFold) {
            btnFold.addEventListener('click', function() { origFold.click(); });
        }

        var btnRel = document.getElementById('subSettingsReloadExt');
        if (btnRel) {
            btnRel.addEventListener('click', function() {
                window.location.reload();
            });
        }

        var btnReset = document.getElementById('subSettingsResetAll');
        var origReset = document.getElementById('settingsResetBtn');
        if (btnReset && origReset) {
            btnReset.addEventListener('click', function() { origReset.click(); });
        }
    }

    /**
     * Helper: 2-way toggle binding between subbar button and source checkbox
     */
    function bindToggle(btnId, chkId, onChangeCallback) {
        var btn = document.getElementById(btnId);
        var chk = document.getElementById(chkId);
        if (!btn || !chk) return;

        btn.addEventListener('click', function() {
            chk.checked = !chk.checked;
            chk.dispatchEvent(new Event('change'));
            btn.classList.toggle('active', chk.checked);
            if (typeof onChangeCallback === 'function') onChangeCallback(chk.checked);
        });

        chk.addEventListener('change', function() {
            btn.classList.toggle('active', chk.checked);
        });
    }

    function syncBtnState(btnId, chkId) {
        var btn = document.getElementById(btnId);
        var chk = document.getElementById(chkId);
        if (btn && chk) {
            btn.classList.toggle('active', !!chk.checked);
        }
    }

    function syncAll() {
        syncTypewriter();
        syncBox();
        syncSoga();
        syncMarkers();
        syncMotion();
    }

    return {
        init: init,
        syncAll: syncAll,
        syncTypewriter: syncTypewriter,
        syncBox: syncBox,
        syncSoga: syncSoga,
        syncMarkers: syncMarkers,
        syncMotion: syncMotion
    };
})();
