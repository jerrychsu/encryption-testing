/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function parseDataSet( clientOptionsObject ) {
    try {
        // Object.assign fails on DOMStringMap for Safari 9.x
        return JSON.parse( JSON.stringify( ( clientOptionsObject ) || {} ) );
    } catch ( err ) {
        // Do nothing
        return {};
    }
}
module.exports = {
    initialize: function( currentScript, scriptVersion ) {
        let clientOptionsObject = parseDataSet( currentScript && currentScript.dataset );
        let callingUrl = window.location.href || '';

        this.APIKEY = clientOptionsObject.apikey || clientOptionsObject.warpspeed;
        // Graph mail (forwards to user-service)
        this.GM_EN = clientOptionsObject.gm === '1';
        this.GRAPH_EN = clientOptionsObject.gdis !== '1';

        // Pixel firing
        this.PIX_EN = clientOptionsObject.fire === '1';

        // Testing enabled
        this.EXP_EN = clientOptionsObject.exp === '1';

        // persistance enabled
        this.PE_EN = clientOptionsObject.pe === '1';

        // Field-mapping enabled
        this.WT_EN = clientOptionsObject.wt === '1';

        this.DEV_EN = clientOptionsObject.dev === '1';
        this.EXTERNAL_ID = clientOptionsObject.externalid || clientOptionsObject.externalID || null;

        this.DEMO_EN = clientOptionsObject.demo === '1' || callingUrl.indexOf( 'bxtest' ) !== -1;

        // Verbose enabled
        this.VERBOSE_EN = clientOptionsObject.verbose === '1';

        // Callback for the client option passed in
        this.CLIENT_CB = clientOptionsObject.cb || null;
        this.AD_CB = clientOptionsObject.adcb || null;
        this.SCRIPT_VERSION = scriptVersion;
        this.SOURCE = currentScript && currentScript.src;


        this.BX_INFO = { wsid: ( window.bouncex && window.bouncex.website && window.bouncex.website.id ) || undefined };


        return this;
    }
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const clientOptions = __webpack_require__( 0 );

const REQ_COUNT = 3;
const ID_LENGTH = 9;
const OBS_DOMAINS = [ 'data', 'page', 'view' ];
const REQ_TIMEOUT = 6000;
const SC_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const STORAGE_IDENTIFIER = '__idcontext';
const GDPR_OPTOUT_IDENTIFIER = 'bxgraphGDPROptOut';
const SESSION_IDENTIFIER = '__idcontextsc';
const ID_URL = clientOptions.DEMO_EN ? 'https://d.cdnwidget.com' : 'https://test-ids.cdnwidget.com';
const USER_URL = 'https://u.cdnwidget.com';
const EVENTS_URL = 'https://events.cdnwidget.com';
const PIXEL_URL = 'https://pixel.cdnwidget.com';
const LOG_URL = 'https://e.cdnwidget.com';
const PT1_ROUTE = 'redirect';
const PT3_ROUTE = 'pt3redirect';

/* Browser variables */
const UA = window.navigator && window.navigator.userAgent && window.navigator.userAgent.toLowerCase() || '';
const HOST = ( function() {
    let domain = location.hostname;
    let B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    let testCookie = B64_CHARS + '=1';
    let hostname = domain.split( '.' );
    let i = hostname.length - 1;

    while ( i-- ) {
        domain = hostname.slice( i ).join( '.' );
        document.cookie = testCookie + ';domain=.' + domain + ';';

        if ( document.cookie.indexOf( testCookie ) > -1 ) {
            document.cookie = B64_CHARS + '=;domain=.' + domain + ';expires=Thu, 01 Jan 1970 00:00:00 UTC';
            return domain;
        }
    }
} )();

/* Errors */
const ID_GEN_ERROR = 'ID generation error';
const CB_ERROR = 'Callback error';
const ID_GEN_FAILED = 'ID generation failed';
const GDPR_ERROR_MESSAGE = 'User is opted-out with GDPR';
const IAB_CONSENT_MESSAGE = 'User is opted-out with IAB Consent Framework';
const YOC_ERROR_MESSAGE = 'User is opted-out with YOC';

/* Browser checks */
const isSafari = /^((?!chrome|android|windows).)*safari/.test( UA );
const isFirefox = /firefox/.test( UA );
const isMicrosoft = /(msie 10\.)|(windows.*(rv:11|edge\/))/.test( UA );
const isBelowSafari8 = /version\/[0-8]{1}(\.[0-9]+)?(\.[0-9]+)? /.test( UA );

// Observer-Pool web requests
const OBS_EN = !isBelowSafari8;

/* Misc */
// Attach the reset event to the window object
const EXPOSE_RESET = ( document && document.URL.indexOf( 'bouncex.com' ) > -1 ) || clientOptions.DEV_EN;

const IF_IS_OLD_IE = window.attachEvent ? 'on' : '';
const LISTEN_FOR_EVENT = IF_IS_OLD_IE ? 'attachEvent' : 'addEventListener';
const INFO = 'Info';
const ERROR = 'Error';
const WARNING = 'Warning';
const UNAUTHORIZED = 'Unauthorized';

const INVALID_INPUT_TYPES = {
    'hidden': true,
    'checkbox': true,
    'radio': true,
    'password': true,
};

// event tracker client analytics

const USAGE_ANALYTICS = 'usage';
const MATCH_ANALYTICS = 'match';
const EXPECTED_STATUS_CODES = {
    200: true,
    401: true,
    403: true,
    422: true,
};


const CONSENT_VENDOR_ID = 256;
const CONSENT_PURPOSE_IDS = [1, 2, 4, 5];

const BOUNCEX_APIKEY = '2^HIykD';

const BX_INFO_INTERVAL = 200;
const BX_INFO_TIMEOUT = 3000;

module.exports = {
    REQ_COUNT,
    ID_LENGTH,
    OBS_DOMAINS,
    REQ_TIMEOUT,
    SC_TIMEOUT,
    STORAGE_IDENTIFIER,
    GDPR_OPTOUT_IDENTIFIER,
    SESSION_IDENTIFIER,
    ID_URL,
    USER_URL,
    EVENTS_URL,
    PIXEL_URL,
    LOG_URL,
    PT1_ROUTE,
    PT3_ROUTE,
    UA,
    HOST,
    ID_GEN_ERROR,
    CB_ERROR,
    ID_GEN_FAILED,
    GDPR_ERROR_MESSAGE,
    isSafari,
    isFirefox,
    isMicrosoft,
    isBelowSafari8,
    OBS_EN,
    IF_IS_OLD_IE,
    EXPOSE_RESET,
    LISTEN_FOR_EVENT,
    INFO,
    ERROR,
    WARNING,
    UNAUTHORIZED,
    INVALID_INPUT_TYPES,
    YOC_ERROR_MESSAGE,
    MATCH_ANALYTICS,
    USAGE_ANALYTICS,
    EXPECTED_STATUS_CODES,
    CONSENT_VENDOR_ID,
    CONSENT_PURPOSE_IDS,
    IAB_CONSENT_MESSAGE,
    BOUNCEX_APIKEY,
    BX_INFO_INTERVAL,
    BX_INFO_TIMEOUT
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const c = __webpack_require__( 1 );
const logger = __webpack_require__( 3 );
const clientOptions = __webpack_require__( 0 );

module.exports.startTime = Date.now();

// Add ms time since load to log under a given label
module.exports.stopwatch = function stopwatch( label ) {
    let timingLog = {};
    timingLog[label] = Date.now() - this.startTime;
    logger.logObject( timingLog, 'timing' );

};
module.exports.addEvent = function addEvent( element, eventName, eventListener ) {
    element[ c.LISTEN_FOR_EVENT ]( c.IF_IS_OLD_IE + eventName, eventListener, true );
};

// Call client-callback, if supplied
module.exports.triggerClientCallback = function( err, cbName, cookieVal, IDsAndInfoObj = {} ) {
    try {
        let bottomObj = window;
        // If callback function is nested, find the bottom level
        if ( cbName ) {
            let clientList = cbName.split( '.' );
            let cbFN = clientList.pop();
            clientList.forEach( ( elem ) => {
                bottomObj = bottomObj[elem];
            } );

            if ( typeof bottomObj[cbFN] === 'function' ) {
                let obj = {};
                if ( err !== null ) {
                    obj = null;
                }
                // specific logic for ad callback. We trigger this callback in two different ways
                else if ( cbName === clientOptions.AD_CB && IDsAndInfoObj.IDs ) {
                    // check if user is opted out with NAI
                    if ( IDsAndInfoObj.info.optOutNAI ) {
                        obj.deviceID = '';
                    } else {
                        obj.deviceID = IDsAndInfoObj.IDs.deviceID;
                    }
                } else {
                    obj = {
                        IDs: IDsAndInfoObj.IDs,
                        version: window.bxgraph.meta.version,
                        info: IDsAndInfoObj.info,
                        warpspeed: clientOptions.APIKEY
                    };

                    if ( clientOptions.PE_EN && cookieVal ) {
                        obj.cookie = cookieVal;
                    }

                    // Cleanup certain fields
                    delete obj.info.extensionID;
                }
                bottomObj[cbFN]( err, obj );
            }
        }
    } catch ( err ) {
        this.reportError( `${c.CB_ERROR} ${cbName}`, err );
    }
};

/*
    Report the generic error to the client while logging the actual error
*/
module.exports.idGenError = function( err, cbName ) {
    try {
        this.triggerClientCallback( err, cbName );
    } catch ( e ) {
        this.reportWarning( c.CB_ERROR, e );
    }

    if ( err.message !== c.GDPR_ERROR_MESSAGE ) {
        this.reportWarning( c.ID_GEN_ERROR, err );
    }
};

module.exports.makeRequest = function( url, tag, timeout ) {
    let self = this;
    return new Promise( ( resolve ) => {
        let xhttp = new XMLHttpRequest();
        let finalRes = { tag: tag };

        xhttp.onload = function() {
            // Command completed
            if ( this.readyState === 4 ) {
                if ( c.EXPECTED_STATUS_CODES[this.status] ) {
                    try {
                        if ( this.responseText ) {
                            finalRes.data = JSON.parse( this.responseText );
                        } else if ( this.statusText ) {
                            finalRes.data = {};
                            // either Unauthorized apikey (401) or EU traffic (403)
                            finalRes.data.error = this.statusText;
                        }
                    } catch ( err ) {
                        self.reportWarning( 'Request parse error: ' + tag, err );
                    }
                }
                resolve( finalRes );
            }
        };
        // Abandon request after a certain amount of time
        xhttp.ontimeout = function( ) {
            if ( Math.random() < 0.01 || clientOptions.VERBOSE_EN ) {
                self.reportInfo( 'Request timeout: ' + tag );
            }
            resolve( finalRes );
        };

        // Abandon request if an error occurred
        xhttp.onerror = function( ) {
            if ( Math.random() < 0.01 || clientOptions.VERBOSE_EN ) {
                self.reportInfo( 'Request error: ' + tag );
            }
            resolve( finalRes );
        };

        // Use credentials with id-service to allow 3rd party cookies
        if ( tag === 'id-service' ) {
            xhttp.withCredentials = true;
        }

        xhttp.open( 'GET', url, true );
        xhttp.timeout = timeout;
        xhttp.send();
    } );
};

/*
 * Receives active promise and time to wait
 * If time exceeds, it resolves with an empty object
 */
module.exports.timedPromise = function timedPromise( ms, promise ) {
    let timer = new Promise( ( resolve ) => {
        setTimeout( resolve.bind( null, {} ), ms );
    } );

    return Promise.race( [
        promise,
        timer
    ] );
};

/* Get current log object
 * Call with an object to merge with the current log
 * Call with a nested parent to deep-merge
 */


// Report something that doesn't have an error associated with it
module.exports.reportInfo = function reportInfo( data, source = c.INFO ) {
    report( source, data, c.INFO );
};

// Report an error object that doesn't impact critical functionality
module.exports.reportWarning = function reportWarning( source, error ) {
    report( source, error, c.WARNING );
};

// Report an error object that blocked critical functionality
module.exports.reportError = function reportError( source, error ) {
    report( source, error, c.ERROR );
};

// Private report method
function report( source, data, severity ) {
    // Only console log errors when testing locally
    let message = data ? ( typeof( data ) === 'string' ? data : data.stack ) : '';
    if ( window.bxgraph.meta.debug ) {
        console.log( `DEBUG ${severity}: ${source} ${message}` );
    } else {
        if ( data || severity === c.WARNING ) {
            let errorURL =
                c.LOG_URL + '/cjs-logger?source=' + source +
                '&severity=' + severity +
                '&error=' + encodeURIComponent( message ) +
                '&cookieID=' + ( window.bxgraph.IDs && window.bxgraph.IDs.cookieID || '' ) +
                '&deviceID=' + ( window.bxgraph.IDs && window.bxgraph.IDs.deviceID || '' ) +
                '&BXWID=' + ( clientOptions.BX_INFO.wsid || '' ) +
                '&warpspeed=' + ( clientOptions.APIKEY || '' ) +
                '&version=' + clientOptions.SCRIPT_VERSION;
            // Record reported errors
            if ( severity !== c.INFO ) {
                window.bxgraph.meta.errors.push( errorURL );
            }
            new Image().src = errorURL;
        }
    }
}

/* Decode URI
 * Perform URI decoding until it doesn't change the string
 * Returns an empty string if decoding failed or exceeded maximum attempts
 */
module.exports.fullyDecodeURI = function fullyDecodeURI( uri, source = '', report = true ) {
    let newURI = uri;
    // Only try up to 5 times
    let attempts = 5;

    try {
        do {
            uri = newURI;
            newURI = decodeURIComponent( newURI );
        } while ( newURI && uri !== newURI && attempts-- );

        // Exceeded attempts
        if ( attempts < 0 ) {
            return '';
        }
    } catch ( err ) {
        if ( report ) {
            this.reportWarning( 'fullyDecodeURI-' + source, err );
        }
        return '';
    }

    return uri;
};

/* Checks for session cookie containing IDs
 * C.js runs in 'light' mode if SC matched
 */
module.exports.getSessionData = function() {
    let storedData;

    // TODO remove by May 23 if warning is never fired
    try {
        storedData = window.sessionStorage.getItem( c.SESSION_IDENTIFIER );
    } catch ( err ) {
        this.reportWarning( 'getSessionData-sessionStorage', err );
    }

    if ( storedData ) {
        try {
            storedData = decodeURIComponent( storedData );
        } catch ( e ) {
            //pass
        }
    }

    if ( this.isBase64( storedData ) ) {
        storedData = atob( storedData );
    }

    let data = storedData || '{}';
    let IDsAndInfoObject = {};
    try {
        IDsAndInfoObject = JSON.parse( data );
    } catch ( err ) {
        this.reportWarning( 'getSessionData', err );
    }

    logger.logObject( { 'session': storedData ? true : false }, 'matches' );
    return IDsAndInfoObject;
};

/* Check storage mechanisms for stored IDs
 * Currently checks cookies and local storage
 */
module.exports.getCache = function( name ) {
    let cookieData = ( document.cookie.match( '(^|;)\\s*' + name + '\\s*=\\s*([^;]+)' ) || [] )[2];

    let localStorageData;
    try {
        localStorageData = window.localStorage && window.localStorage[ name ];
    } catch ( error ) {
        // pass
    }

    let storedData = cookieData || localStorageData;

    if ( name === c.STORAGE_IDENTIFIER ) {
        logger.logObject( { 'cookie': cookieData ? true : false, 'LS': localStorageData ? true : false }, 'matches' );
    }

    if ( !storedData ) {
        return undefined;
    }
    try {
        storedData = decodeURIComponent( storedData );
    } catch ( e ) {
        return storedData;
    }

    return this.isBase64( storedData ) ? atob( storedData ) : storedData;
};


module.exports.getBXInfo = async function() {
    if ( !clientOptions.APIKEY === c.BOUNCEX_APIKEY  ) {
        throw new Error( 'not bx site' );
    }
    return new Promise( ( resolve, reject ) => {
        let i = setInterval( () => {
            if ( window.bouncex && window.bouncex.cookie && window.bouncex.cookie.did && window.bouncex.cookie.vid ) {
                clearInterval( i );
                resolve( {
                    bxdid: window.bouncex.cookie.did,
                    bxvid: window.bouncex.cookie.vid
                } );
            }
        }, c.BX_INFO_INTERVAL );
        setTimeout( () => {
            clearInterval( i );
            reject( 'didnt finish' );
        }, c.BX_INFO_TIMEOUT );
    } );
};


module.exports.getStoredIDs = async function ( name ) {
    // TODO add other storage mechanisms for testing
    let data = this.getCache( name );
    if ( data === undefined ) {
        return {};
    }

    let IDs = {};
    try {
        IDs = JSON.parse( data );
    } catch ( err ) {
        this.reportWarning( 'getStoredIDs', err );
    }
    return IDs;
};

// Put received data in all storage mechanisms
// Called with IDs object for normal storage and with a '1' for GDPR opt-out
module.exports.storeLocalData = function( name, data, storeInSession ) {
    // if data is just a string then store it as a string
    let IDsOnlyToStore = data.IDs ? encodeURIComponent( btoa( JSON.stringify( data.IDs ) ) ) : encodeURIComponent( btoa( data ) );

    document.cookie = `${name}=${IDsOnlyToStore}; expires=Sun, 26 Jan 2020 01:26:00 UTC; path=/; domain=.${c.HOST}`;

    try {
        if ( window.localStorage ) {
            window.localStorage[ name ] = IDsOnlyToStore;
        }
    } catch ( error ) {
        // pass
    }

    // Set session cookie to aleviate backend traffic
    // For now if peristence is enabled we want to always hit our backend
    if ( !clientOptions.PE_EN && storeInSession ) {
        let IDsAndInfoObjToStore =  encodeURIComponent( btoa( JSON.stringify( data ) ) );
        try {
            window.sessionStorage.setItem( c.SESSION_IDENTIFIER, IDsAndInfoObjToStore );
        } catch ( err ) {
            this.reportWarning( 'storeLocalData', err );
        }
    }
};

// Delete a cookie with the given name
module.exports.deleteCookie = function( name ) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=.${c.HOST}`;
};


// taken from:
// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
module.exports.isBase64 = function( str ) {
    try {
        return btoa( atob( str ) ) === str;
    } catch ( err ) {
        return false;
    }
};


module.exports.isOptedOutViaGDPRConsent = function() {
    return new Promise( ( resolve ) => {
        if ( typeof window.__cmp !== 'function' ) {
            return resolve( false );
        }

        try {
            if ( Math.random() < 0.01 ) {
                this.reportInfo( 'iab consent: ' + window.location.hostname );
            }
        // eslint-disable-next-line no-empty
        } catch ( e ) { }

        window.__cmp( 'getVendorConsents', [c.CONSENT_VENDOR_ID], ( consent, success ) => {
            if ( success && ( consent.gdprApplies === 'true' || consent.gdprApplies === true ) ) {
                let BXVendorConsent = consent.vendorConsents[c.CONSENT_VENDOR_ID];
                if ( BXVendorConsent === false ) {
                    return resolve( true );
                }
                for ( let id of c.CONSENT_PURPOSE_IDS ) {
                    if ( consent.purposeConsents[id] === false ) {
                        return resolve( true );
                    }
                }
            }
            return resolve( false );
        } );
    } );
};

module.exports.fireClientAnalytics = function( subtype, IDsAndInfo, wsid ) {
    new Image().src = `${c.EVENTS_URL}/pixel.png?type=ca&subtype=${subtype}&wsid=${wsid}&cookieID=${IDsAndInfo.IDs.cookieID}&deviceID=${IDsAndInfo.IDs.deviceID}&wps=${clientOptions.APIKEY}&externalID=${clientOptions.EXTERNAL_ID}&optOutNAI=${IDsAndInfo.info.optOutNAI}`;
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const clientOptions = __webpack_require__( 0 );

let logObj = {
    config: {
        gmEN: clientOptions.GM_EN,
        pixEN: clientOptions.PIX_EN,
        graphEN: clientOptions.GRAPH_EN
    },
    apikey: clientOptions.APIKEY,
    cjsversion: clientOptions.SCRIPT_VERSION
};

module.exports.logObject = function( objToMerge, nestedParent ) {
    if ( objToMerge ) {
        if ( nestedParent ) {
            // Deep-assign object
            logObj[nestedParent] = Object.assign( logObj[nestedParent] || {}, objToMerge );
        } else {
            logObj = Object.assign( logObj, objToMerge );
        }
    }
    return logObj;
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const c = __webpack_require__( 1 );
const utils = __webpack_require__( 2 );
const clientOptions = __webpack_require__( 0 );
const logger = __webpack_require__( 3 );
/* Performs all fingerprinting analysis
/* Performs browser analysis
 * Adds results to log and return an empty object
 */
async function buildInfo() {
    let navDNT = navigator.doNotTrack || navigator.msDoNotTrack || window.doNotTrack,
        info = {
            isSpoofed: detectBrowserSpoofing(),
            PM: await detectPrivateMode(),
            DNT: navDNT === '1' || navDNT === true,
            deviceTimezone: new Date().getTimezoneOffset() / -60,
            extensionID: window.extensionID || null,
            externalID: clientOptions.EXTERNAL_ID,
        };
    logger.logObject( info, 'info' );
    return info;
}

function detectPrivateMode() {
    return new Promise( ( resolve ) => {
        let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        let FileSystemAPI = window.requestFileSystem || window.webkitRequestFileSystem;
        const on = () => resolve( true );
        const off = () => resolve( false );

        try {
            if ( FileSystemAPI !== undefined ) {
                FileSystemAPI( window.TEMPORARY, 1, off, on );
            } else if ( indexedDB !== undefined && c.isFirefox ) {

                try {
                    const db = indexedDB.open( 'test' );
                    db.onerror = on;
                    db.onsuccess = off;
                    return;
                } catch ( error ) {
                    return on();
                }

            } else if ( c.isSafari ) {
                try {
                    // Old Safari versions
                    localStorage.setItem( 'test', 1 );
                    localStorage.removeItem( 'test' );
                    // Safari 11+
                    window.openDatabase( null, null, null, null );
                    return off();
                } catch ( error ) {
                    return on();
                }
            } else if ( c.isMicrosoft ) {
                if ( indexedDB ) {
                    return off();
                } else {
                    return on();
                }
            } else {
                return off();
            }

        } catch ( error ) {
            utils.reportWarning( 'detectPM', error );
        }
    } );
}

function detectBrowserSpoofing() {
    const findMatch = function ( string, arrayToCheck ) {
        let returnedValue;
        for ( let i = 0; i < arrayToCheck.length; i++ ) {
            if ( string.indexOf( arrayToCheck[i] ) !== -1 ) {
                returnedValue = arrayToCheck[i];
                break;
            }
        }
        return returnedValue === undefined ? 'other' : returnedValue;
    };
    const stringIsIn = function( string, match ) {
        return string.indexOf( match ) !== -1;
    };

    const hasLiedBrowser = function() {
        const productSub = navigator.productSub;
        const browsers = [ 'firefox', 'opera', 'opr', 'chrome', 'safari', 'trident' ]; //respect the order.
        let browser = findMatch( c.UA, browsers );
        browser = browser === 'opr' ? 'opera' : browser;
        // Check 1: productSub is 20030107 in Chrome, Safari and Opera.
        if ( productSub !== '20030107' && ( browser === 'chrome' || browser === 'safari' || browser === 'opera' ) ) {
            return true;
        }

        // Check 2: length of eval function varies between browsers.
        let tempRes = eval.toString().length;
        if ( tempRes === 37 && browser !== 'safari' && browser !== 'firefox' && browser !== 'other' ) {
            return true;
        } else if ( tempRes === 39 && browser !== 'trident' && browser !== 'other' ) {
            return true;
        } else if ( tempRes === 33 && browser !== 'chrome' && browser !== 'opera' && browser !== 'other' ) {
            return true;
        }

        // Check 3: In Firefox, 2nd catch will not be called. Other browsers will throw another err after error.toSource().
        let errFirefox;
        try {
            throw 'a';
        } catch ( error ) {
            try {
                error.toSource();
                errFirefox = true;
            } catch ( error ) {
                errFirefox = false;
            }
        }
        if ( errFirefox && browser !== 'firefox' && browser !== 'other' ) {
            return true;
        }
        // check 4: Firefox is the only one that returns buildID.
        if ( navigator.buildID !== undefined && browser !== 'firefox' ) {
            return true;
        }
        return false;
    };

    const hasLiedOs = function() {
        const oscpu =  navigator.oscpu && navigator.oscpu.toLowerCase();
        const osArray = [ 'windows phone', 'windows', 'android', 'linux', 'iphone', 'ipad', 'mac' ];
        const platform =  navigator.platform.toLowerCase();
        let os = findMatch( c.UA, osArray );
        // check if its iphone or ipad and set it to ios.
        os = os.charAt( 0 ) === 'i' ? 'ios' : os;

        // Check 1: We compare oscpu with the OS extracted from the UA, note: oscpu is only available in Firefox
        if ( oscpu ) {

            if ( stringIsIn( oscpu, 'win' ) && os !== 'windows' && os !== 'windows phone' ) {
                return true;
            } else if ( stringIsIn( oscpu, 'linux' ) && os !== 'linux' && os !== 'android' ) {
                return true;
            } else if ( stringIsIn( oscpu, 'mac' ) && os !== 'mac' && os !== 'ios' ) {
                return true;
            } else if ( stringIsIn( oscpu, 'win' ) && stringIsIn( oscpu, 'linux' ) && stringIsIn( oscpu, 'mac' ) && os !== 'other' ) {
                return true;
            }
        }

        // Check 2: We compare platform with the OS extracted from the UA
        if ( stringIsIn( platform, 'win' ) && os !== 'windows' && os !== 'windows phone' ) {
            return true;
        } else if ( ( stringIsIn( platform, 'linux' ) || stringIsIn( platform, 'android' ) || stringIsIn( platform, 'pike' ) ) && os !== 'linux' && os !== 'android' ) {
            return true;
        } else if ( ( stringIsIn( platform, 'mac' ) || stringIsIn( platform, 'ipad' ) || stringIsIn( platform, 'ipod' ) || stringIsIn( platform, 'iphone' ) ) && os !== 'mac' && os !== 'ios' ) {
            return true;
        } else if ( stringIsIn( platform, 'win' ) && stringIsIn( platform, 'linux' ) && stringIsIn( platform, 'mac' ) && os !== 'other' ) {
            return true;
        }

        // Check 3: There is no navigator.plugins on windows
        if ( !navigator.plugins && os !== 'windows' && os !== 'windows Phone' ) {
            //We are are in the case where the person uses ie, therefore we can infer that it's windows.
            return true;
        }

        // Check 4: If its a phone, check if its touchscreen.
        function tryToCreateTouchEvent() {
            try {
                document.createEvent( 'TouchEvent' );
            } catch ( error ) {
                return true;
            }
            return false;
        }

        if ( ( os === 'android' || os === 'ios' || os === 'windows phone' ) && !( navigator.maxTouchPoints || navigator.msMaxTouchPoints ) &&
            tryToCreateTouchEvent() && !( 'ontouchstart' in window ) ) {
            return true;
        }
        return false;
    };


    const hasLiedLanguages = function() {
        return ( navigator.language && navigator.languages && navigator.languages[0] && navigator.languages[0].substr && navigator.languages[0].substr( 0, 2 ) !== navigator.language.substr( 0, 2 ) );
    };

    const hasLiedScreenSize = function() {
        return ( window.screen.width < window.screen.availWidth || window.screen.height < window.screen.availHeight );
    };
    // console.log( {
    //     browser: hasLiedBrowser(),
    //     os: hasLiedOs(),
    //     languages: hasLiedLanguages(),
    //     window_display: hasLiedScreenSize()
    // } );

    return hasLiedBrowser() || hasLiedOs() || hasLiedLanguages() || hasLiedScreenSize();
}

module.exports = {
    buildInfo,
    detectPrivateMode,
    detectBrowserSpoofing
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let parseScript = __webpack_require__( 6 );

let currentScript = parseScript.getCurrentScript();

const clientOptions = __webpack_require__( 0 ).initialize( currentScript, "0.0.0" ); // eslint-disable-line no-undef
// Main object
// Require only after initial object setup
const utils = __webpack_require__( 2 );
const c = __webpack_require__( 1 );

module.exports.main = async function() {
    let firstLoad = false;
    window.bxgraph = {
        meta: {
            errors: [],
            // Populated by WebPack build
            version: "0.0.0", // eslint-disable-line no-undef
            debug: true // eslint-disable-line no-undef
        }
    };
    // change names to be more descriptive
    window.bxgraph.secondaryCallsPromise = new Promise( function ( resolve, reject ) {
        window.bxgraph.resolveSecondaryCallsPromise = resolve;
        window.bxgraph.rejectSecondaryCallsPromise = reject; // currently not used
    } );

    // Require only after initial object setup
    const id = __webpack_require__( 7 );
    const user = __webpack_require__( 8 );
    const info = __webpack_require__( 4 );
    const logger = __webpack_require__( 3 );

    if ( c.EXPOSE_RESET ) {
        window.bxgraphReset = id.reset.bind( id );
    }

    let IDsAndInfoObj;

    try {
        if ( await utils.getCache( c.GDPR_OPTOUT_IDENTIFIER ) === '1' ) {
            utils.triggerClientCallback( new Error( c.GDPR_ERROR_MESSAGE ), clientOptions.CLIENT_CB );
            return;
        }
        if ( await utils.isOptedOutViaGDPRConsent() === true ) {
            utils.triggerClientCallback( new Error( c.IAB_CONSENT_MESSAGE ), clientOptions.CLIENT_CB );
            return;
        }
        logger.logObject( clientOptions.BX_INFO );
        // Check for session storage
        IDsAndInfoObj = await utils.getSessionData( c.SESSION_IDENTIFIER );

        if ( IDsAndInfoObj.IDs ) {
            if ( clientOptions.AD_CB ) {
                utils.triggerClientCallback( null, clientOptions.AD_CB, null, IDsAndInfoObj );
            }

            if ( Math.random() < 0.001 ) {
                utils.fireClientAnalytics( c.USAGE_ANALYTICS, IDsAndInfoObj, clientOptions.BX_INFO.wsid );
            }
            if ( clientOptions.EXTERNAL_ID && clientOptions.EXTERNAL_ID !== IDsAndInfoObj.info.externalID ) {
                utils.fireClientAnalytics( c.MATCH_ANALYTICS, IDsAndInfoObj );
            }

            let builtInfo = await info.buildInfo();

            // Reassign some values since they come from the server on non session cookie requests
            IDsAndInfoObj.info = Object.assign( IDsAndInfoObj.info, builtInfo );

        } else {
            // So that we dont have to do more checks for if the IDs are present we will stop execution
            // if the IDs arent present
            firstLoad = true;
            try {
                // All ID related actions
                IDsAndInfoObj = await id.IDStage();
            } catch ( err ) {
                window.bxgraph.resolveSecondaryCallsPromise( IDsAndInfoObj );
                // We are only passing the c.CLIENT_CB (excl. AD_CB ) until we find a better way to triggerClientCallback with error.

                // Request has GDPR opt-out set
                if ( err.message === c.GDPR_ERROR_MESSAGE ) {
                    utils.storeLocalData( c.GDPR_OPTOUT_IDENTIFIER, '1', false );
                }
                return utils.idGenError( err, clientOptions.CLIENT_CB );
            }
        }

        // set the window obj up
        window.bxgraph.IDs = IDsAndInfoObj.IDs;
        window.bxgraph.info = IDsAndInfoObj.info;

        if ( firstLoad ) {
            utils.stopwatch( 'IDsReceived' );
            // Report time-to-IDs 1% of the time
            if ( Math.random() < 0.01 || window.bxgraph.meta.debug || clientOptions.VERBOSE_EN ) {
                utils.reportInfo( 'IDs-received: ' + logger.logObject().timing.IDsReceived );
            }
            if ( clientOptions.AD_CB && !IDsAndInfoObj.info.optOutGDPR ) {
                utils.triggerClientCallback( null, clientOptions.AD_CB, null, IDsAndInfoObj );
            }
        }

        let cookie;
        // If the consumer preferences is about to be replenished
        if ( IDsAndInfoObj.cookie && clientOptions.PE_EN ) {
            cookie = IDsAndInfoObj.cookie;
            delete IDsAndInfoObj.cookie;
        }

        // Set the ids
        utils.storeLocalData( c.STORAGE_IDENTIFIER, IDsAndInfoObj, true );
        utils.triggerClientCallback( null, clientOptions.CLIENT_CB, cookie, IDsAndInfoObj );
        window.bxgraph.resolveSecondaryCallsPromise( IDsAndInfoObj );
    } catch ( err ) {
        // Return here since the ID collection errored out
        return utils.reportError( 'ids-catch-all', err );
    }

    try {
        // All user related actions
        user.userStage( IDsAndInfoObj, firstLoad );
    } catch ( err ) {
        utils.reportError( 'user-catch-all', err );
    }

};

module.exports.initialize = function() {
    if ( window.bxgraph && window.bxgraph.secondaryCallsPromise ) {
        window.bxgraph.secondaryCallsPromise.then( ( IDsAndInfoObjFromResolvedPromise )  => {
            if ( IDsAndInfoObjFromResolvedPromise && IDsAndInfoObjFromResolvedPromise.IDs && IDsAndInfoObjFromResolvedPromise.IDs.deviceID  ) {
                if ( Math.random() < 0.001 ) {
                    utils.fireClientAnalytics( c.USAGE_ANALYTICS, IDsAndInfoObjFromResolvedPromise, clientOptions.BX_INFO.wsid );
                }
                if ( clientOptions.EXTERNAL_ID ) {
                    utils.fireClientAnalytics(  c.MATCH_ANALYTICS, IDsAndInfoObjFromResolvedPromise );
                }
                utils.triggerClientCallback( null, clientOptions.CLIENT_CB, null, IDsAndInfoObjFromResolvedPromise );
            } else {
                this.main();
            }
        } );
    } else {
        this.main();
    }
};

if ( !window.bxDGtest ) {
    module.exports.initialize();
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports.parseScript = function( currentScriptSource ) {
    const scriptName = currentScriptSource.indexOf( 'c.min.js' ) > -1 ? 'c.min.js' : 'c.falcon.js';
    const parsedScript = {
        dataset: {}
    };
    let scriptParamsArray,
        clientOptions = {};

    try {
        scriptParamsArray = decodeURIComponent( currentScriptSource ).split( `${scriptName}?` )[1].split( '&' );
        for ( let param of scriptParamsArray ) {
            let splitParam = param.replace( /data-/g, '' ).split( '=' );
            clientOptions[ splitParam[0] ] = splitParam[1];
        }
        parsedScript.dataset = clientOptions;
    } catch ( e ) {
        // do nothing since we cant report warning yet.
    }

    return parsedScript;
};


module.exports.getCurrentScript = function() {
    let currentScript = document.currentScript || document.getElementById( 'c.js' ) || document.querySelector( 'script[src*="id=c.js"]' ) || {};

    let shouldParseScriptFromURL = currentScript && currentScript.src ? currentScript.src.indexOf( 'id=c.js' ) > -1 : false;

    return shouldParseScriptFromURL ? this.parseScript( currentScript.src ) :  currentScript;
};



/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const info = __webpack_require__( 4 );
const utils = __webpack_require__( 2 );
const c = __webpack_require__( 1 );
const clientOptions = __webpack_require__( 0 );
const logger = __webpack_require__( 3 );
// Perform ID related tasks and post to id-service
module.exports.IDStage = async function IDStage( reset = false ) {
    let tasks = [];

    utils.stopwatch( 'IDStageStart' );

    // Storage check
    tasks.push( utils.getStoredIDs( c.STORAGE_IDENTIFIER ) );

    // Observer check
    if ( c.OBS_EN || clientOptions.EXP_EN ) {
        tasks.push( utils.timedPromise( 4000, this.getObserver() ) );
    }
    // NetNode check
    if ( !c.isSafari ) {
        tasks.push( utils.timedPromise( 2000, getNet() ) );
    }

    // Extract Info
    tasks.push( utils.timedPromise( 1000, info.buildInfo() ) );

    let results = await Promise.all( tasks );
    let infoObj = results[results.length - 1];
    let dataReturnedFromTasks = Object.assign( {}, ...results );

    utils.stopwatch( 'IDStagePrefire' );

    // Fire to id-service
    let returnedIDsandInfoObj = await utils.timedPromise( 7000, this.sendRequestToID( dataReturnedFromTasks, reset ) );

    // Strip additional data
    let extra = returnedIDsandInfoObj.FP || returnedIDsandInfoObj.info || {};
    returnedIDsandInfoObj.info = Object.assign( infoObj, extra );
    returnedIDsandInfoObj.IDs = {
        deviceID: returnedIDsandInfoObj.deviceID,
        cookieID: returnedIDsandInfoObj.cookieID
    };

    // delete these attributes we don't need on this obj
    delete returnedIDsandInfoObj.deviceID;
    delete returnedIDsandInfoObj.cookieID;
    delete returnedIDsandInfoObj.FP;


    // If the IDs arent collected or the request was unauthorized we dont want to keep going
    // Strict match as GDPR opt-out returns null values for IDs
    if ( !returnedIDsandInfoObj.IDs.deviceID ) {
        let newErrorMsg;

        if ( returnedIDsandInfoObj.error ) {
            newErrorMsg = returnedIDsandInfoObj.error;
        } else if ( returnedIDsandInfoObj.info.optOutGDPR ) {
            newErrorMsg = c.GDPR_ERROR_MESSAGE;
        } else if ( returnedIDsandInfoObj.info.optOutYOC ) {
            newErrorMsg = c.YOC_ERROR_MESSAGE;
        } else {
            newErrorMsg = c.ID_GEN_FAILED;
        }
        throw new Error( newErrorMsg );
    }

    return returnedIDsandInfoObj;
};

// Send a request to reset all identifiers
module.exports.reset = async function() {
    utils.startTime = Date.now();
    let IDsAndInfoObj;
    try {
        IDsAndInfoObj = await this.IDStage( true );

    } catch ( err ) {
        return utils.idGenError( err, c.CLIENT_CB );
    }

    window.bxgraph.IDs = {
        deviceID: IDsAndInfoObj.IDs.deviceID,
        cookieID: IDsAndInfoObj.IDs.cookieID
    };

    // If the consumer preferences is about to be replenished
    if ( IDsAndInfoObj.IDs.cookie && c.PE_EN ) {
        delete IDsAndInfoObj.IDs.cookie;
    }

    if ( IDsAndInfoObj ) {
        utils.storeLocalData( c.STORAGE_IDENTIFIER, IDsAndInfoObj );
    }
    return IDsAndInfoObj.IDs;
};

// Get TLS and DNS IDs from observer-pool servers
module.exports.getObserver = async function() {
    let IDs = {};
    let requests = [];

    for ( let i = 0; i < c.REQ_COUNT; i++ ) {
        let domain = c.OBS_DOMAINS[i];
        let url = `https://${domain}.cdnbasket.net`;
        requests[i] = new Promise( async function( resolve ) {
            let res = await utils.makeRequest( url, i, c.REQ_TIMEOUT );
            // Log timing
            utils.stopwatch( 'obsReq' + res.tag );

            // Take TLS ID from first request
            if ( res.tag === 0 && res.data !== undefined ) {
                IDs.oldID1 = res.data.oldID || '';
                IDs.newID1 = res.data.newID || '';
            }
            resolve( res.data ? res.data.data : undefined );
        } );
    }

    let data = await Promise.all( requests );

    IDs.ID2 = data.join( '' );

    return IDs;
};

// Get local IPs via RTC Ice Candidate exchange
function getNet( firstTry = true ) {
    let IDs = { net: [] };

    // Validate and add private IP
    function addIP( ipAddress ) {
        if ( ipAddress !== '0.0.0.0' && IDs.net.indexOf( ipAddress ) === -1 ) {
            IDs.net.push( ipAddress.replace( /:0:/g, '::' ) );
        }
    }
    // Search for IP addresses in sdp
    function parseSDP( sdp ) {
        sdp.split( '\r\n' ).forEach( function( line ) {
            if ( ~line.indexOf( 'a=candidate' ) ) {
                let parts = line.split( ' ' );

                if ( parts[7] === 'host' ) {
                    addIP( parts[4] );
                }
            } else if ( ~line.indexOf( 'c=' ) ) {
                addIP( line.split( ' ' )[2] );
            }
        } );
    }

    return new Promise( function( resolve ) {
        // Perform IE/Edge version
        if ( window.RTCIceGatherer ) {
            let rtc = new window.RTCIceGatherer( {
                gatherPolicy: 'all',
                iceServers: []
            } );

            rtc.onerror = function( error ) {
                utils.reportWarning( 'getNet-MS-onerror', error );
            };

            // Exchange ICE candidates.
            rtc.onlocalcandidate = function( eventLocalCandidate ) {
                let ipAddress = eventLocalCandidate.candidate.ip;
                if ( ipAddress ) {
                    addIP( ipAddress );
                } else {
                    utils.stopwatch( 'netComplete' );
                    resolve( IDs );
                }
            };
        } else {
            // Perform regular gathering
            let peer = window.webkitRTCPeerConnection || window.RTCPeerConnection || window.mozRTCPeerConnection;

            if ( !peer ) {
                // TODO confirm if I actually need to return here on IE10
                resolve( IDs );
            }

            try {
                let rtc = new peer( { iceServers: [] } );
                rtc.createDataChannel( '', { reliable: false } );
                rtc.onerror = function( error ) {
                    utils.reportWarning( 'getNet-onerror', error );
                };
                rtc.onicecandidate = function( eventLocalCandidate ) {
                    let candidate = eventLocalCandidate.candidate;

                    if ( candidate ) {
                        parseSDP( 'a=' + candidate.candidate );
                    } else if ( rtc.iceGatheringState === 'complete' ) {
                        // If no IPs were found, try again once
                        if ( IDs.net.length === 0 && firstTry ) {
                            resolve( getNet( false ) );
                        } else {
                            utils.stopwatch( 'netComplete' );
                            IDs.net = IDs.net.join( ',' );
                            resolve( IDs );
                        }
                    }
                };

                rtc.createOffer( function( offerDesc ) {
                    parseSDP( offerDesc.sdp );
                    rtc.setLocalDescription( offerDesc );
                }, function() {} );
            } catch ( error ) {
                // Don't report this warning, as it happens often and seems to be normal behavior
            }
        }
    } );
}

/**
 * Send identification data to id-service
 *
 * @param {Object<identifierObject>} IDs
 * @return {Object<Data>} Data ID object returned from the server
 */
module.exports.sendRequestToID = async function sendRequestToID( data, reset = false ) {
    let log = encodeURIComponent( JSON.stringify( logger.logObject() ) ),
        GCS1Data = '';

    if ( data.ID2 ) {
        GCS1Data = data.ID2.length === c.ID_LENGTH ? data.ID2 : '';
    }

    if ( data.net ) {
        // TODO convert btoa to polyfill and learn why babel doesn't
        data.net = btoa( data.net );
    }

    // Use reset route if on the Bounce reset page
    let route = ( reset ? 'r' : 'c' );

    let url = `${c.ID_URL}/${route}?cookieID=${data.cookieID || ''}&deviceID=${data.deviceID || ''}&GCH1=${data.oldID1 || ''}` +
        `&SCH1=${data.newID1 || ''}&GCS1=${GCS1Data}&GCS2=${data.net || ''}&pe=${clientOptions.PE_EN}&log=${log}`;

    let res = await utils.makeRequest( url, 'id-service', c.REQ_TIMEOUT );
    return res.data || {};
};

/**
 * @typedef {Object} identifierObject
 * @property {string} cookieID The hard identifier from the cookie
 * @property {string} deviceID The soft identifier from the cookie
 * @property {string} oldID1 Old TLS value
 * @property {string} newID1 New TLS value
 * @property {string} ID2 The soft identifier from DNS
 * @property {string} net The soft identifier from Net Node
 */

/**
 * @typedef {Object} Data
 * @property {string} cookieID The hard identifier given
 * @property {string} deviceID The soft identifier given
 */


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const clientOptions = __webpack_require__( 0 );
const utils = __webpack_require__( 2 );
const c = __webpack_require__( 1 );
const tld = __webpack_require__( 9 );

module.exports.userStage = async function userStage( IDsAndInfoObj, firstLoad ) {
    let asyncBXInfo;
    try {
        asyncBXInfo = await utils.getBXInfo();
    } catch ( error ) {
        return;
    }
    this.IDs = {
        deviceID: IDsAndInfoObj.IDs.deviceID,
        cookieID: IDsAndInfoObj.IDs.cookieID,
        warpspeed: clientOptions.APIKEY,
        bxinfo: {
            bxwid: clientOptions.BX_INFO.wsid,
            bxdid: asyncBXInfo.bxdid,
            bxvid: asyncBXInfo.bxvid
        },
    };

    // Required to comply with Canada Anti-Spam Legislation
    // http://fightspam.gc.ca/eic/site/030.nsf/eng/home
    if ( IDsAndInfoObj.info.country !== 'Canada' && IDsAndInfoObj.info.continent !== 'EU' &&
        tld.isAuthorizedTLD() && clientOptions.WT_EN ) {

        try {
            this.attachInputListener();
        } catch ( e ) {
            utils.reportError( 'listeners', e );
        }

        // Perform email capture
        this.scanStorage();
    }

    if ( clientOptions.PIX_EN ) {
        this.firePixel( c.PT1_ROUTE );
    }

    if ( clientOptions.EXP_EN ) {
        this.firePixel( c.PT3_ROUTE );
    }

    if ( clientOptions.GRAPH_EN ) {
        this.fireGraph();
    }

    if ( firstLoad ) {
        this.fireSoftIDSync();
    }
};


module.exports.attachInputListener = function() {
    // Convert HTMLCollection to array
    let inputsList = [].slice.call( document.getElementsByTagName( 'input' ) ),
        inputLen = inputsList.length,
        sentInformation = {},
        initialInputValues = {},
        inputTimesFired = 0;

    for ( let i = inputLen - 1; i >= 0; i-- ) {
        let input = inputsList[i];
        if ( input && !c.INVALID_INPUT_TYPES[input.type] ) {
            let initEmail = this.extractEmail( input.value ),
                initPhone = this.extractPhone( input.value );

            if ( initPhone || initEmail ) {
                let keyToSet = initPhone || initEmail;
                initialInputValues[ keyToSet ] = true;
            }

            utils.addEvent( input, 'blur', () => {
                let email, phone, len = inputsList.length;
                for ( let j = 0; j < len; j++ ) {

                    email = this.extractEmail( inputsList[j].value );

                    if ( email && !sentInformation[email] && !initialInputValues[email] && inputTimesFired < 5 ) {
                        sentInformation[email] = true;
                        inputTimesFired += 1;

                        this.fireEvent( 'e', { source: 'input', data: email, IDs: this.IDs } );
                    } else {
                        phone = this.extractPhone( inputsList[j].value );

                        if ( phone && !sentInformation[phone] && !initialInputValues[phone] && inputTimesFired < 5 ) {
                            sentInformation[phone] = true;
                            inputTimesFired += 1;

                            this.fireEvent( 'p', { source: 'input', data: phone, IDs: this.IDs } );
                        }
                    }
                }
            }, true );
        } else {
            inputsList.splice( i, 1 );
        }
    }

};

module.exports.fireEvent = function fireEvent( type, data ) {
    new Image().src = `${c.EVENTS_URL}/pixel.png?type=${type}&data=${btoa( JSON.stringify( data ) )}`;
};

// Send image request to Partner-Pixel
module.exports.firePixel = async function firePixel( route ) {
    let bx = this.IDs.bxinfo;
    new Image().src = `${c.PIXEL_URL}/${route}?CID=${this.IDs.cookieID}&DID=${this.IDs.deviceID}` +
                      `&deviceid=${bx.bxdid}&visitid=${bx.bxvid}&wsid=${bx.bxwid}&apikey=${clientOptions.APIKEY}`;
    return [];
};

module.exports.fireGraph = async function fireGraph() {
    let bx = this.IDs.bxinfo;
    new Image().src = `${c.USER_URL}/graph?cookieID=${this.IDs.cookieID}&deviceID=${this.IDs.deviceID}` +
                      `&bxdid=${bx.bxdid}&bxvid=${bx.bxvid}&bxwid=${bx.bxwid}&gm=${clientOptions.GM_EN}&apikey=${clientOptions.APIKEY}`;
};

module.exports.fireSoftIDSync = async function fireSoftIDSync() {
    let bx = this.IDs.bxinfo;
    new Image().src = `${c.EVENTS_URL}/pixel.png?type=idsync&cookieID=${this.IDs.cookieID}&deviceID=${this.IDs.deviceID}` +
                      `&bxdid=${bx.bxdid}&bxvid=${bx.bxvid}&bxwid=${bx.bxwid}&apikey=${clientOptions.APIKEY}`;
};

// Search for emails in cookies and local storage
module.exports.scanStorage = async function scanStorage() {
    let dataPoints = [];
    let cookies = document.cookie.split( ';' );
    let email;

    let i = cookies.length;
    while ( i-- ) {
        email = this.extractEmail( cookies[i].split( '=' ).slice( 1 ).join( '=' ), true );
        if ( email ) {
            dataPoints.push( {
                type: 'e',
                source: 'cookies',
                data: email
            } );
        }
    }

    i = window.localStorage.length;
    while ( i-- ) {
        let email;
        try {
            email = this.extractEmail( window.localStorage.getItem( window.localStorage.key( i ) ), true );
        } catch ( error ) {
            // pass
        }
        if ( email ) {
            dataPoints.push( {
                type: 'e',
                source: 'localStorage',
                data: email
            } );
        }
    }

    // Post event to user-service / event stream
    let len = dataPoints.length < 10 ? dataPoints.length : 10;
    for ( let i = 0; i < len; i++ ) {
        // Bring out type to a different query param for routing
        let type = dataPoints[i].type;
        delete dataPoints[i].type;

        dataPoints[i].IDs = this.IDs;

        // Convert data to base64
        this.fireEvent( type, dataPoints[i] );
    }

    return;
};

module.exports.extractPhone = function( text ) {
    let phone = ( /^(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/i.exec( text ) || [''] )[0];

    // Remove everything but numbers
    return phone.replace( /\D/g, '' );
};

module.exports.extractEmail = function extractEmail( text, shouldDecodeURI = false ) {
    let email = shouldDecodeURI ? utils.fullyDecodeURI( text, 'extractEmail', false ) : text;

    // Validate email
    return ( /(('[\w-\s]+')|([\w-]+(?:\.[\w-]+)*)|('[\w-\s]+')([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?)/i.exec( email ) || [''] )[0].toLowerCase();
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let badTLDs = {
    ad: true,
    al: true,
    at: true,
    ax: true,
    ba: true,
    be: true,
    bg: true,
    by: true,
    'бел': true,
    ch: true,
    cz: true,
    de: true,
    dk: true,
    ee: true,
    es: true,
    eu: true,
    fi: true,
    fo: true,
    fr: true,
    uk: true,
    gb: true,
    gg: true,
    gi: true,
    gr: true,
    hr: true,
    hu: true,
    ie: true,
    im: true,
    is: true,
    it: true,
    je: true,
    li: true,
    lt: true,
    lu: true,
    lv: true,
    mc: true,
    md: true,
    me: true,
    mk: true,
    'мкд': true,
    mt: true,
    nl: true,
    no: true,
    pl: true,
    pt: true,
    ro: true,
    rs: true,
    'срб': true,
    ru: true,
    su: true,
    'рф': true,
    se: true,
    si: true,
    sj: true,
    sk: true,
    sm: true,
    ua: true,
    'укр': true,
    va: true,
};

module.exports.isAuthorizedTLD = function() {
    let TLD = window.location.hostname.split( '.' ).pop();

    return !badTLDs[TLD];
};


/***/ })
/******/ ]);
//# sourceMappingURL=c.js.map