if ('undefined' === typeof Array.isArray) {
    Array.isArray = function(arg) {
        return "[object Array]" === Object.prototype.toString.call(arg);
    };
}

(function(window, undefined) {
// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
    navigator = window.navigator,
    location = window.location,
    screen = window.screen,
    history = window.history,

    $ = window.Sizzle,

    byId = document.getElementById,
    byName = document.getElementsByName,
    byTag = document.getElementsByTagName,
    byCss = document.getElementsByClassName,
    select = document.querySelectorAll
    ;
var createAttr = document.createAttribute,
    createElement = document.createElement,
    createDocumentFragment = document.createDocumentFragment,
    cloneNode = document.cloneNode,

    // Save a reference to some core methods
    toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,
    push = Array.prototype.push,
    slice = Array.prototype.slice,
    trim = String.prototype.trim,
    index = Array.prototype.indexOf
    ;

/**
 * jam
 *
 * @namespace jam
 */
var jam = (function() {
    // Define a local copy of jam
    var jam = function(selector, context) {
        return new jam.fn.init(selector, context);
    };

    jam.prototype = {
        constructor: jam,
        selector: "",
        length: 0
    };
    jam.fn = jam.prototype;

    // instance method
    /**
     * Constructs jam object.
     *
     * @constructor
     * @param {Object} selector
     * @param {Object} context
     */
    jam.fn.init = function(selector, context) {
        this.selector = selector;
        this.context = context || document;

        return this;
    };

    // class method
    /**
     * Extends jam class.
     *
     * @param {Object} obj Extending object.
     */
    jam.extend = function(obj) {
        var extended = obj.extended;
        for (var i in obj) {
            if (!(i in jam) && hasOwn.call(obj, i)) {
                jam[i] = obj[i];
            }
        }
        if (extended) {
            extended(jam);
        }
    };
    /**
     * Includes argument object to jam object.
     *
     * @param {Object} obj Including object.
     */
    jam.include = function(obj) {
        var included = obj.included, fn = obj.fn, proto = jam.fn;
        for (var i in fn) {
            if (!(i in proto) && hasOwn.call(fn, i)) {
                jam.fn[i] = fn[i];
            }

        }
        if (included) {
            included(jam);
        }
    };
    /**
     * Selects elements by css.
     *
     * @param {Object} selector Selector css.
     * @param {Object} context Context root element.
     * @return {Array} Selected elements.
     */
    jam.selectClass = function(selector, context) {
        var elem = context || document;
        return elem.querySelectorAll
                ? select.call(elem, '.' + selector)
                : byCss.call(elem, selector);
    };
    /**
     * Selects elements by tag name.
     *
     * @param {Object} selector Tag name.
     * @param {Object} context Context root element.
     * @return {Array} Selected elements.
     */
    jam.selectTag = function(selector, context) {
        var elem = context || document;
        return elem.querySelectorAll
                ? select.call(elem, selector)
                : byTag.call(elem, selector);
    };
    jam.each = function(elements, callback, args) {
        for (var i = 0, max = elements.length; i < max; i++) {
            if (false === callback(elements[i], args)) {
                return false;
            }
        }

        return true;
    };
    jam.reverse = function(elements, callback, args) {
        for (var i = elements.length; i--;) {
            if (false === callback(elements[i], args)) {
                return false;
            }
        }

        return true;
    };
    jam.count = function(obj) {
        var count = 0;

        for (var i in obj) {
            if (hasOwn.call(obj, i)) {
                count++;
            }
        }

        return count;
    };

    jam.arrayHas = function(array, value) {
        return -1 !== index.call(array, value);
    };
    jam.arrayHasValue = function(array, value) {
        var i = index.call(array, value);

        if (-1 !== i) {
            return array[i];
        }

        return false;
    };
    jam.arrayContains = function(array, values) {
        var has = jam.arrayHas, i = values.length;

        for (; i--;) {
            if (has(array, values[i])) {
                return true;
            }
        }

        return false;
    };
    jam.arrayHasAll = function(array, values) {
        var has = jam.arrayHas, i = values.length;

        for (; i--;) {
            if (!has(array, values[i])) {
                return false;
            }
        }

        return true;
    };
    jam.arrayHasValues = function(array, values) {
        var has = jam.arrayHasValue,
            i = values.length,
            v = false, list = [];

        for (; i--;) {
            v = has(array, values[i]);

            if (false === v) {
                return false;
            } else {
                list.unshift(v);
            }
        }

        if (0 === list.length) {
            return false;
        }

        return list;
    };
    jam.arrayKsort = function(array) {
        var a = [], i = array.length;

        for(;i--;) {
            if (i in array) {
                a.unshift(array[i]);
            }
        }

        return a;
    };

    jam.objHasValues = function(obj, names) {
        var i = names.length,
            name, list = [];

        for (;i--;) {
            name = names[i];

            if (name in obj) {
                list.unshift(obj[name]);
            } else {
                return false;
            }
        }

        if (0 === list.length) {
            return false;
        }

        return list;
    };
    jam.copy = function(obj) {
        var copy = {};

        for (var name in obj) {
            copy[name] = obj[name];
        }

        return copy;
    };

    jam.fn.init.prototype = jam.fn;

    return jam;
}());

var Str = (function() {
    // Define a local copy of Css
    var Str = function() {
        return new Str.fn.init();
    };

    Str.prototype = {
        constructor: Str
    };
    Str.fn = Str.prototype;

    // class method
    Str.trim = function(str) {
        var str1 = str.replace(/^\s+/, ''),
            end = str1.length - 1,
            ws = /\s/;

        while (ws.test(str1.charAt(end))) {
            end--;
        }

        return str1.slice(0, end + 1);
    };
    Str.ltrim = function(str) {
        return str.replace(/^\s+/, '');
    };
    Str.rtrim = function(str) {
        var end = str.length - 1,
            ws = /\s/;

        while (ws.test(str.charAt(end))) {
            end--;
        }

        return str.slice(0, end + 1);
    };
    Str.toCapCase = function(str) {
        return str.toLowerCase().replace(/^\w+$/, function(txt){
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };
    Str.toTitleCase = function(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    // instance method
    Str.fn.init = function() {
        return this;
    };

    Str.fn.init.prototype = Str.fn;

    return Str;
}());
jam.Str = Str;
jam.extend(Str);

var Type = (function() {
    // Define a local copy of Type
    var Type = function() {
        return new Type.fn.init();
    };

    Type.prototype = {
        constructor: Event
    };
    Type.fn = Type.prototype;

    // class property
    Type.rNumeric = /^[0-9]+$/;
    Type.rAlpha = /^[a-zA-Z]+$/;
    Type.rUpperCase = /^[A-Z]+$/;
    Type.rLowerCase = /^[a-z]+$/;
    Type.rAlphaNumeric = /^[a-zA-Z0-9]+$/;
    Type.rUpperCaseNumeric = /^[A-Z0-9]+$/;
    Type.rLowerCaseNumeric = /^[a-z0-9]+$/;
    Type.rEmail = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/;
    Type.rUrl = /^(https?:\/\/)?[\da-z\.\-]+\.[a-z\.]{2,6}[#&+_\?\/\w \.\-=]*$/;

    // class method
    Type.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    // instance method
    Type.fn.init = function() {
        return this;
    };

    Type.fn.init.prototype = Type.fn;

    return Type;
}());
jam.Type = Type;
jam.extend(Type);

var Event = (function(){
    // Define a local copy of Event
    var Event = function() {
        return new Event.fn.init();
    };

    Event.prototype = {
        constructor: Event
    };
    Event.fn = Event.prototype;

    // class property
    Event.eventType = [
        'load', 'unload',
        'click', 'dblclick',
        'blur', 'focus',
        'change', 'select', 'submit', 'reset',
        'abort', 'error',
        'keyup', 'keydown', 'keypress',
        'mouseout', 'mouseover', 'mouseup', 'mousedown', 'mousemove',
        'resize', 'move'
    ];

    // class method
    Event.cancel = function(event) {
        if (event.preventDefault) {
            event.preventDefault(); // IE9, FF8, opera, chrome, safari
            event.stopPropagation(); // IE9, FF8, opera, chrome, safari
        } else {
            event.returnValue = false; // chrome, safari, opera
            event.cancelBubble = true; // IE9, chrome, opera, safari
        }
    };
    Event.add = function(target, type, listener) {
        var _listener, _type;

        if (target.addEventListener) {
            target.addEventListener(type, listener, false);

            return true;
        }

        if (target.attachEvent) {
            _listener =  function(event) {
                event.currentTarget = target;
                listener(event);
            };

            _type = 'on' + type;
            target.detachEvent(_type, _listener);
            target.attachEvent(_type, _listener);

            return true;
        }

        return false;
    };
    Event.remove = function(target, type, listener) {
        var _listener, _type;

        if (target.removeEventListener) {
            target.removeEventListener(type, listener, false);

            return true;
        }

        if (target.detachEvent) {
            _listener =  function(event) {
                event.currentTarget = target;
                listener(event);
            };

            _type = 'on' + type;
            target.detachEvent(_type, _listener);

            return true;
        }

        return false;
    };

    // add event listener methods
    (function() {
        var eventType = Event.eventType,
            i = eventType.length;

        for (; i--;) {
            (function(type) {
                Event[type] = function(target, listener) {
                    return Event.add(target, type, listener);
                };
            }(eventType[i]));
        }
    }());

    // instance method
    Event.fn.init = function() {
        return this;
    };

    Event.fn.init.prototype = Event.fn;

    // special event
    jam.ready = function(listener) {
        return Event.load(window, listener);
    };

    return Event;
}());
jam.Event = Event;

var Css = (function() {
    // Define a local copy of Css
    var Css = function(className, context) {
        return new Css.fn.init(className, context);
    };

    Css.prototype = {
        constructor: Css,
        context: document,
        className: '',
        elements: []
    };
    Css.fn = Css.prototype;

    // class method
    Css.names = function(target) {
        return target.className
            .replace(/(?:^[\x09\x0A\x0C\x0D\x20]+)|(?:[\x09\x0A\x0C\x0D\x20]+$)/g, '')
            .split(/[\x09\x0A\x0C\x0D\x20]+/);
    };
    Css.has = function(target, className, classNames) {
        if (!classNames) {
            classNames = Css.names(target);
        }

        return -1 !== index.call(classNames, className);
    };
    Css.add = function(target, className, classNames) {
        if (!classNames) {
            classNames = Css.names(target);
        }

        if (Css.has(target, className, classNames)) {
            return true;
        }

        classNames.push(className);
        target.className = Str.trim(classNames.join(' '));

        return true;
    };
    Css.remove = function(target, className, classNames) {
        var newClassNames = [], i;

        if (!classNames) {
            classNames = Css.names(target);
        }

        if (!Css.has(target, className, classNames)) {
            return false;
        }

        for (i = classNames.length; i--;) {
            if (className !== classNames[i]) {
                newClassNames.push(classNames[i]);
            }
        }

        target.className = Str.trim(newClassNames.join(' '));
        return true;
    };
    Css.replace = function(target, oldClass, newClass, classNames) {
        var newClassNames = [], i;

        if (!classNames) {
            classNames = Css.names(target);
        }

        if (!Css.has(target, oldClass, classNames)) {
            return false;
        }

        for (i = classNames.length; i--;) {
            if (oldClass !== classNames[i]) {
                newClassNames.push(classNames[i]);
            } else {
                newClassNames.push(newClass);
            }
        }

        target.className = Str.trim(newClassNames.join(' '));
        return true;
    };

    Css.each = function(className, callback, args, elements, context) {
        if (!elements) {
            elements = jam.selectClass(className, context);
        }

        return jam.each(elements, callback, args);
    };
    Css.reverse = function(className, callback, args, elements, context) {
        if (!elements) {
            elements = jam.selectClass(className, context);
        }

        return jam.reverse(elements, callback, args);
    };

    Css.addEach = function(className, elements) {
        return jam.each(elements, function(target) {
            Css.add(target, className);
        });
    };
    Css.removeEach = function(className, elements) {
        return jam.each(elements, function(target) {
            Css.remove(target, className);
        });
    };

    // instance method
    Css.fn.init = function(className, context) {
        this.className = className || '';
        this.context = context || document;
        this.elements = jam.selectClass(this.className, this.context);

        return this;
    };
    Css.fn.each = function(callback, args) {
        return Css.each(this.className, callback, args, this.elements, this.context);
    };
    Css.fn.reverse = function(callback, args) {
        return Css.reverse(this.className, callback, args, this.elements, this.context);
    };

    Css.fn.init.prototype = Css.fn;

    // extend Event
    Event.addCss = function(className, type, listener, elements, conext) {
        return Css.each(className, function(target) {
            return Event.add(target, type, listener);
        }, undefined, elements, conext);
    };
    Event.removeCss = function(className, type, listener, elements, conext) {
        return Css.each(className, function(target) {
            return Event.remove(target, type, listener);
        }, undefined, elements, conext);
    };

    // add event listener methods
    (function() {
        var eventType = Event.eventType, method, postFix = 'Css',
            i = eventType.length;

        for (; i--;) {
            (function(type) {
                method = type + postFix;
                Event[method] = function(className, listener, elements, conext) {
                    return Event.addCss(className, type, listener, elements, conext);
                };
            }(eventType[i]));
        }
    }());

    return Css;
}());
jam.Css = Css;

var Attr = (function() {
    // Define a local copy of Css
    var Attr = function(elem) {
        return new Attr.fn.init(elem);
    };

    Attr.prototype = {
        constructor: Attr
    };
    Attr.fn = Attr.prototype;

    Attr.rReturn = /\r\n/g;
    var rReturn = Attr.rReturn;

    // class method
    Attr.getText = function( elem ) {
        var i, node,
            nodeType = elem.nodeType,
            ret = "";

        if ( nodeType ) {
            if ( nodeType === 1 ) {
                // Use textContent || innerText for elements
                if ( typeof elem.textContent === 'string' ) {
                    return elem.textContent;
                } else if ( typeof elem.innerText === 'string' ) {
                    // Replace IE's carriage returns
                    return elem.innerText.replace( rReturn, '' );
                } else {
                    // Traverse it's children
                    for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        ret += getText( elem );
                    }
                }
            } else if ( nodeType === 3 || nodeType === 4 ) {
                return elem.nodeValue;
            }
        } else {

            // If no nodeType, this is expected to be an array
            for ( i = 0; (node = elem[i]); i++ ) {
                // Do not traverse comment nodes
                if ( node.nodeType !== 8 ) {
                    ret += getText( node );
                }
            }
        }
        return ret;
    };
    var getText = Attr.getText;

    // instance method
    Attr.fn.init = function(elem) {
        this.element = elem;
        return this;
    };
    Attr.fn.text = function() {
        return Attr.getText(this.element);
    };

    Attr.fn.init.prototype = Attr.fn;

    return Attr;
}());
jam.Attr = Attr;

// Expose jam to the global object
window.jam = jam;
}(window));
