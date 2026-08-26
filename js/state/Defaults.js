/**
 * TEXTORO - Defaults Module
 * القيم الافتراضية للتطبيق
 * @version 3.3.0
 */

TEXTORO.Defaults = {
    /** إعدادات Typewriter الافتراضية */
    typewriter: {
        twProgress: 0,
        twAuto: true,
        twReverse: false,
        wordMode: false,
        randomSpeed: 0,
        showCursor: true,
        cursorBefore: false,
        cursorColor: [1, 1, 1],
        cursorSpacing: 0,
        blinkSpeed: 2,
        blinkInHold: true,
        boxRTL: false,
        textColor: [1, 1, 1]
    },
    
    /** إعدادات Box الافتراضية */
    box: {
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 20,
        paddingBottom: 20,
        cornerRadius: 15,
        cornerTL: 15,
        cornerTR: 15,
        cornerBL: 15,
        cornerBR: 15,
        strokeWidth: 2,
        strokeOpacity: 100,
        strokeColor: [1, 1, 1],
        strokeDash: 0,
        strokeGap: 0,
        fillOpacity: 100,
        fillColor: [0.2, 0.4, 0.9],
        lockBoxSize: true
    },
    
    /** إعدادات Motion الافتراضية */
    motion: {
        animatePosition: false,
        animateScale: false,
        animateRotation: false,
        animateOpacity: true,
        positionX: 0,
        positionY: 50,
        scaleFrom: 80,
        rotationFrom: 0,
        opacityFrom: 0,
        inDuration: 0.5,
        outDuration: 0.5,
        easeIn: 'easeOut',
        easeOut: 'easeIn'
    },
    
    /** إعدادات Markers الافتراضية */
    markers: {
        offset: '1:00',      // 1 ثانية
        stagger: '0:05',     // 5 فريمات
        alignTime: '5:00',   // 5 ثواني
        staggerOrder: 'asc'
    },
    
    /** فلاتر Markers الافتراضية */
    markersFilters: {
        IN_START: true,
        IN_END: true,
        OUT_START: true,
        OUT_END: true,
        BLINK_START: true,
        BLINK_END: true
    }
};

// Alias للتوافق مع الكود القديم
var DEFAULTS = TEXTORO.Defaults;
