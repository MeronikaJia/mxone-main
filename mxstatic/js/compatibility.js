/**
 * 浏览器兼容性处理
 */

// 添加requestAnimationFrame兼容性处理
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || 
                                    window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

// 添加classList兼容性处理
if (!("classList" in document.documentElement)) {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function() {
            var self = this;
            function update(fn) {
                return function(value) {
                    var classes = self.className.split(/\s+/g);
                    var index = classes.indexOf(value);
                    fn(classes, index, value);
                    self.className = classes.join(" ");
                }
            }
            return {
                add: update(function(classes, index, value) {
                    if (!~index) classes.push(value);
                }),
                remove: update(function(classes, index) {
                    if (~index) classes.splice(index, 1);
                }),
                toggle: update(function(classes, index, value) {
                    if (~index) classes.splice(index, 1);
                    else classes.push(value);
                }),
                contains: function(value) {
                    return !!~self.className.split(/\s+/g).indexOf(value);
                },
                item: function(i) {
                    return self.className.split(/\s+/g)[i] || null;
                }
            };
        }
    });
}

// 添加addEventListener兼容性处理
if (!Element.prototype.addEventListener) {
    Element.prototype.addEventListener = function(type, listener) {
        this.attachEvent('on' + type, listener);
    };
}

// 添加removeEventListener兼容性处理
if (!Element.prototype.removeEventListener) {
    Element.prototype.removeEventListener = function(type, listener) {
        this.detachEvent('on' + type, listener);
    };
}

// 添加matches兼容性处理
if (!Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;            
        };
}

// 添加closest兼容性处理
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1); 
        return null;
    };
}

// 添加CustomEvent兼容性处理
(function() {
    if (typeof window.CustomEvent === "function") return false;
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();

// 添加dataset兼容性处理
if (!document.documentElement.dataset) {
    Object.defineProperty(HTMLElement.prototype, 'dataset', {
        get: function() {
            var attributes = this.attributes;
            var name = [];
            var value = [];
            var obj = {};
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].nodeName.slice(0, 5) == 'data-') {
                    name.push(attributes[i].nodeName.slice(5));
                    value.push(attributes[i].nodeValue);
                }
            }
            for (var j = 0; j < name.length; j++) {
                obj[name[j]] = value[j];
            }
            return obj;
        }
    });
}

// 添加Array.from兼容性处理
if (!Array.from) {
    Array.from = (function() {
        var toStr = Object.prototype.toString;
        var isCallable = function(fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function(value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function(value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };
        return function from(arrayLike) {
            var C = this;
            var items = Object(arrayLike);
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }
            var len = toLength(items.length);
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);
            var k = 0;
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            A.length = len;
            return A;
        };
    }());
}

// 添加Object.assign兼容性处理
if (typeof Object.assign != 'function') {
    Object.assign = function(target) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
} 