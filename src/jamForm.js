(function(window, undefined) {
// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
    navigator = window.navigator,
    location = window.location,
    screen = window.screen,
    history = window.history,

    byId = document.getElementById,
    index = Array.prototype.indexOf,

    jam = window.jam,
    Event, Type;

if (!jam) {
    return;
}
Event = jam.Event;
Type = jam.Type;

// class method
/**
 *
 *
 * @param {Object} options
 *
 * options = {
    form: '',
    submit: '',
    depend: {},
    fieldErrors: {},
    formErrors: {},
    post: {},
    onError: null,
    onSuccess: null
};
 *
 */
Event.addValidator = function(options) {
    var target = null,
        button = null,
        submitted = false,

        rules = options.rules || {},
        invalid = options.invalid || null,
        valid = options.valid || null,

        form;

    if (!options.form) {
        return;
    }
    target = byId.call(document, options.form);
    form = new Form(target, rules);

    if (options.submit) {
        button = byId.call(document, options.submit);
    }

    var getErrorMessages = function(errors) {
        var fieldErrors,
            messages = [];

        for (var fieldName in errors) {
            fieldErrors = errors[fieldName];

            for (var label in fieldErrors) {
                messages.push(fieldErrors[label]);
            }
        }

        return messages;
    };

    var handler = function(event) {
        var errors,
            messages;

        if (submitted) {
            Event.cancel(event);
            return false;
        }

        submitted = true;

        if (!form.isValid()) {
            if (invalid) {
                errors = form.errors;
                messages = getErrorMessages(errors);

                Css.removeEach('invalid', form.getValidElement());
                Css.addEach('invalid', form.getInvalidElement());

                invalid(event, form, messages);
                Event.cancel(event);
                submitted = false;
            }
        } else if (valid) {
            // do ajax or something
            valid(event, form);
            Event.cancel(event);
            submitted = false;
        }
        // submit normally
    };

    if (button) {
        Event.click(button, handler);
    } else {
        Event.submit(form, handler);
    }
};

jam.isFieldElement = function(elem) {
    var tagName = elem.tagName.toLowerCase(), inputType;

    if ('input' === tagName) {
        inputType = elem.type.toLowerCase();
        if ('submit' !== inputType && 'button' !== inputType && 'reset' !== inputType && 'image' !== inputType) {
            return true;
        }
    } else if ('textarea' === tagName || 'select' === tagName) {
        return true;
    }

    return false;
};

var Form = (function() {
    // Define a local copy of Form
    var Form = function(target, rules) {
        return new Form.fn.init(target, rules);
    };

    Form.prototype = {
        constructor: Form,
        target: null,
        action: '',
        method: '',
        fields: [],
        fieldsByName: [],
        validator: {},
        validators: [],
        errors: {}, // {field1: [error1, error2], field2: [error1, error2], ...}
        valid: false
    };
    Form.fn = Form.prototype;

    // private method
    /**
     * Cleans Field object.
     *
     * @param {Form} form Form object.
     * @return void
     */
    var cleanField = function(form) {
        var field, name,
            fields = form.fields,
            fieldErrors,
            i = 0, max = fields.length;

        for (; i < max; i++) {
            field = fields[i];
            name = field.name;

            // validation
            if (field.mustValidate() && field.isValid()) {
                continue;
            }

            // error
            if (!form.errors[name]) {
                form.errors[name] = {};
            }
            fieldErrors = form.errors[name];

            for (var label in field.errors) {
                fieldErrors[label] = field.errors[label];
            }
        }
    };
    /**
     * Cleans Form object.
     *
     * @param {Form} form Form object.
     * @return void
     */
    var cleanForm = function(form) { //TODO implement
    };
    /**
     * Returns field by field name.
     *
     * @param {Object} form Form object.
     * @param {String} name Field name.
     * @return {Field} Field object.
     */
    var getFieldByName = function(form, name) {
        if (name in form.fieldsByName) {
            return form.fieldsByName[name];
        }

        return null;
    };

    // instance method
    /**
     * Initializes Form object.
     *
     * @param {Object} elem Form element.
     * @param {Object} rules Validation rule messages.
     * @return Form Form object.
     */
    Form.fn.init = function(elem, rules) {
        var validator = new Validator();

        // copy form element and its property
        this.target = elem;
        this.action = elem.action || '';
        this.method = elem.method || '';

        //this.elements = {};
        this.fields = [];
        this.fieldsByName = [];
        this.validator = validator;
        this.validators = [];
        this.errors = {};
        this.valid = false;

        this.initFields(validator, rules);
        this.initValidator(validator, rules);

        return this;
    };
    /**
     * Initializes Field objects.
     *
     * @param {Validator} validator Validator object.
     * @param {Object} rules Validation rule messages
     * @return void
     */
    Form.fn.initFields = function(validator, rules) {
        var field, fieldName, messages, f,
            elem = this.target,
            i = 0, max = elem.length || 0;

        for (; i < max; i++) {
            field = elem[i];
            fieldName = field.name || '';
            messages = rules[fieldName] || {};

            if (jam.isFieldElement(field) && fieldName) {
                f = new Field(field, messages, validator);
                this.fields.push(f);
                this.fieldsByName[fieldName] = f;
            }
        }
    };
    /**
     * Initializes the form validator property.
     *
     * @param {Validator} validator Validator object.
     * @param {Object} rules Form validation rule messages.
     * @return void
     */
    Form.fn.initValidator = function(validator, rules) {
        var field, fieldName, fields = this.fields,
            order = Validator.order,
            vOrder,
            ruleset,
            messages, message,
            v,
            validators = [],
            target,
            i = 0, max = fields.length;

        for (i = 0; i < max; i++) {
            field = fields[i];
            fieldName = field.name;

            ruleset = field.formRuleset;
            if (0 === jam.count(ruleset)) {
                continue;
            }

            messages = fieldName in rules ?  rules[fieldName] : {};
            for (var name in ruleset) {
                v = validator[name];
                if ('form' !== v.type) {
                    continue;
                }

                vOrder = index.call(order, name);
                if (-1 === vOrder) {
                    continue;
                }

                target = getFieldByName(this, ruleset[name]);
                if (null === target) {
                    continue;
                }

                message = name in messages  ? messages[name] : Validator.getDefaultMessage(name, navigator.language);
                validators[vOrder] = v.apply(this, [message, field, target]);
            }
        }

        this.validators = jam.arrayKsort(validators);
    };
    /**
     * Returns whether the form is valid.
     *
     * @return {bool} true if the form is valid, false otherwise.
     */
    Form.fn.isValid = function() {
        // clear errors before validation
        this.valid = false;
        this.errors = {};

        cleanField(this);
        cleanForm(this);

        if (0 !== jam.count(this.errors)) {
            return false;
        }

        this.valid = true;
        return true;
    };
    /**
     * Returns invalid fields.
     *
     * @return {Array} Invalid fields.
     */
    Form.fn.getInvalidFields = function() {
        var fields = this.fields,
            field,
            errorFields = [];
        for (var i =0, max = fields.length; i< max; i++) {
            field = fields[i];
            if (!field.valid) {
                errorFields.push(field);
            }
        }

        return errorFields;
    };
    Form.fn.getInvalidElement = function() {
        var fields = this.fields,
            field,
            invalidFields = [];
        for (var i =0, max = fields.length; i< max; i++) {
            field = fields[i];
            if (!field.valid) {
                invalidFields.push(field.element);
            }
        }

        return invalidFields;
    };
    Form.fn.getValidElement = function() {
        var fields = this.fields,
            field,
            validFields = [];
        for (var i =0, max = fields.length; i< max; i++) {
            field = fields[i];
            if (field.valid) {
                validFields.push(field.element);
            }
        }

        return validFields;
    };

    Form.fn.init.prototype = Form.fn;

    return Form;
}());
jam.Form = Form;

var Field = (function() {
    // Define a local copy of Field
    var Field = function(target, messages, validator) {
        return new Field.fn.init(target, messages, validator);
    };

    Field.prototype = {
        constructor: Field,
        id: '',
        name: '',
        dataset: {},
        css: [],
        messages: [],
        element: null,
        validator: null,
        validators: [],
        requiredMessage: '',
        required: false,
        ruleset: {},
        role: 'text',
        formRuleset: {},
        errors: {},
        valid:false
    };
    Field.fn = Field.prototype;

    /**
     * Converts arguments to validator closure arguments.
     *
     * @param {Object} message Validation message.
     * @param {Array} data Validation arguments.
     * @return {Array} Validator closure arguments.
     */
    Field.toValidatorArgs = function(message, data) {
        var args;

        if (!Array.isArray(data)) {
            args = [message, data];
        } else {
            args = data;
            args.unshift(message);
        }

        return args;
    };
    /**
     * Returns field element value.
     *
     * @param {Object} elem Field element.
     * @return {String} Field element value.
     */
    Field.getValue = function(elem) {
        var tagName = elem.tagName.toLowerCase(),
            values = [],
            option;

        if ('input' === tagName || 'textarea' === tagName) {
            return elem.value;
        } else if ('select' === tagName) {
            for (var i = 0, max = elem.length; i < max; i++) {
                option = elem[i];

                if (option.selected) {
                    values.push(option.value);
                }
            }

            return values;
        }

        return '';
    };

    // instance method
    Field.fn.init = function(elem, messages, validator) {
        this.id = elem.id;
        this.name = elem.name;
        this.css = Css.names(elem);
        this.element = elem;
        this.validator = validator;
        this.messages = messages || [];
        this.errors = {};
        this.valid = false;
        this.required = false;

        if (elem.dataset) {
            this.initDataSet(elem);
        } else {
            // IE9
            this.initDataAttr(elem);
        }

        this.initRole(elem);
        this.initRuleSet(elem);
        this.initRequired(elem, messages, validator);
        this.initValidators();

        return this;
    };
    Field.fn.initRole = function(elem) {
        var role = elem.getAttribute("data-role"),
            tagName = elem.tagName.toLowerCase(),
            inputType;

        if (null !== role) {
            this.role = role;
            return true;
        }

        if ('input' === tagName) {
            inputType = elem.type.toLowerCase();
            if ('submit' !== inputType && 'button' !== inputType && 'reset' !== inputType && 'image' !== inputType) {
                return false;
            }
            this.role = inputType;
        } else if ('textarea' === tagName || 'select' === tagName) {
            this.role = tagName;
        }

        return true;
    };
    Field.fn.initDataSet = function(elem) {
        var def = Validator.def,
            dataset = elem.dataset;
        this.dataset = {};

        for (var name in dataset) {
            if (name in def) {
                this.dataset[name] = dataset[name];
            }
        }
    };
    Field.fn.initDataAttr = function(elem) {
        var data, def = Validator.def,
            name = '';

        this.dataset = {};

        for (name in def) {
            data = elem.getAttribute("data-" + def[name]);

            if (null !== data) {
                this.dataset[name] = data;
            }
        }
    };
    Field.fn.initRuleSet = function(elem) {
        var dataset = this.dataset, list, ruleset = {},
            support = Validator.support, attr,
            i = support.length;

        // copy dataset
        for (var name in dataset) {
            ruleset[name] = dataset[name];
        }

        // get field element attributes
        for (;i--;) {
            attr = support[i];
            data = elem.getAttribute(attr);

            if (null !== data) {
                ruleset[attr] = data;
            }
        }

        list = jam.objHasValues(ruleset, ['min', 'max']);
        if (false !== list) {
            ruleset['range'] = list;
            delete ruleset['min'];
            delete ruleset['max'];
        }

        list = jam.objHasValues(ruleset, ['minLength', 'maxLength']);
        if (false !== list) {
            ruleset['between'] = list;
            delete ruleset['minLength'];
            delete ruleset['maxLength'];
        }

        this.ruleset = ruleset;
        this.formRuleset = {};
    };
    Field.fn.initRequired = function(elem, messages, validator) {
        var required;

        this.requiredMessage = '';
        this.required = elem.required || null !== elem.getAttribute('required')

        if (this.required || 'required' in this.dataset) {
            this.requiredMessage = messages.required || '';
            required = validator.required(this.requiredMessage);
            this.required = function(value) {
                return required(this, value);
            };
        }
    };
    Field.fn.initValidators = function() {
        var message, v, args,
            ruleset = this.ruleset,
            validator = this.validator,
            messages = this.messages,
            order = Validator.order,
            validators = [],
            vOrder;

        for (var name in ruleset) {
            v = validator[name];
            if ('field' !== v.type) {
                if ('form' == v.type) {
                    this.formRuleset[name] = ruleset[name];
                }
                continue;
            }

            vOrder = index.call(order, name);
            if (-1 === vOrder) {
                continue;
            }

            message = name in messages  ? messages[name] : Validator.getDefaultMessage(name, navigator.language);
            args = Field.toValidatorArgs(message, ruleset[name]);

            validators[vOrder] = v.apply(this, args);
        }

        this.validators = jam.arrayKsort(validators);
    };
    Field.fn.value = function() {
        if (!this.element) {
            return '';
        }

        return Field.getValue(this.element);
    };

    Field.fn.mustValidate = function() {
        this.valid = false;
        this.errors = {};

        // pre validation
        if (!this.required) {
            if (Validator.empty(this.value())) {
                this.valid = true;
                return true;
            }
        } else {
            if (!this.required(this.value())) {
                return false;
            }
        }

        return true;
    };
    Field.fn.isValid = function() {
        var v, i, max;

        if (this.valid) {
            return true;
        }

        for (i = 0, max = this.validators.length; i < max; i++) {
            v = this.validators[i];

            if (!v(this,  this.value())) {
                return false;
            }
        }

        this.valid = true;

        return true;
    };

    Field.fn.init.prototype = Field.fn;

    return Field;
}());
jam.Field = Field;

var Validator = (function() {
    // Define a local copy of Validator
    var Validator = function() {
        return new Validator.fn.init();
    };

    Validator.prototype = {
        constructor: Validator
    };
    Validator.fn = Validator.prototype;

    // class property
    Validator.def = {
        'depend': 'depend', 'required': 'required',
        'len': 'len', 'maxLength': 'max-length', 'minLength': 'min-length', 'between': 'between',
        'equals': 'equals', 'equalsFloat': 'equals-float', 'max': 'max', 'min': 'min', 'range': 'range',
        'pattern': 'pattern',
        'choice': 'choice', 'choices': 'choices',
        'equalsTo': 'equals-to', 'compareTo': 'compare-to', 'compareEqualsTo': 'compare-equals-to'
    };
    Validator.support = [
        //'required',
        'maxLength', 'max', 'min',
        'pattern'
    ];
    Validator.order = [
        'required',
        'numeric', 'pattern',
        'len', 'between', 'minLength', 'maxLength',
        'equals', 'equalsFloat', 'range', 'min', 'max',
        'equalsTo', 'compareTo', 'compareEqualsTo'
    ];
    Validator.defaultMessages = {
        en: {
            required: 'This field is required.',

            pattern: 'This field must be input as %s format.',
            numeric: 'This field must be input as %s format.',

            len: 'This field must input %s chars.',
            between: 'This field must input from %s to %s chars.',
            maxLength: 'This field must input less than equal %s chars.',
            minLength: 'This field must input more than equal %s chars.',

            equals: 'This field must equals to %s.',
            equalsFloat: 'This field must equals to %s.',
            range: 'This field must be from %s to %s.',
            max: 'This field must be less than equals to %s.',
            min: 'This field must be more than equals to %s.',

            choice: 'This field must be choosed from valid options.',
            choices: 'This field must be choosed from valid options.',

            equalsTo: 'This field must be equals to %s field.',
            compareTo: 'This field must be less than %s field.',
            compareEqualsTo: 'This field must be less than equals to %s field.'
        }
    };

    // class method
    Validator.empty = function(value) {
        var length = value.length || 0;

        if ('string' === typeof value) {
            return 0 === length;
        }

        if (Array.isArray(value)) {
            if (0 === length) {
                return true;
            }

            for (var i = 0; i < length; i++) {
                if ('' !== value[i]) {
                    return false;
                }
            }

            return true;
        }

        return false;
    };
    Validator.getDefaultMessage = function(label, lang) {
        var messageSet = Validator.defaultMessages, messages;

        if (!lang) {
            lang = 'en';
        } else if (!(lang in messageSet)) {
            lang = 'en';
        }

        if (lang in messageSet) {
            messages = messageSet[lang];

            if (label in messages) {
                return messages[label];
            }
        }

        return '';
    };

    // private method
    var inChoices = function(values, choices) {
        for (var i = values.length; i--;) {
            if (!(values[i] in choices)) {
                return false;
            }
        }

        return true;
    };
    var validate = function(field, label, message, constraint) {
        if (constraint()) {
            return true;
        }

        field.errors[label] = message;
        return false;
    };
    var getRoleValue = function(role, value) {
        switch(role) {
            case 'int':
                var intVal = parseInt(value, 10);
                if (intVal.toString() === value) {
                    return intVal;
                }
                return null;
            case 'float':
                return parseFloat(value);
            case 'date':
                return value;
            default:
                return value;
        }
    };
    var getRoleTarget = function(role, target) {
        switch(role) {
            case 'int':
                return parseInt(target, 10);
            case 'float':
                return parseFloat(target);
            case 'date':
                return target;
            default:
                return target;
        }
    };

    // instance method
    Validator.fn.init = function() {
        return this;
    };

    // pre validation
    Validator.fn.depend = function(target, constraint, group) { //TODO not implemented
        return function() {
            return target.constraint();
        };
    };
    Validator.fn.depend.type = 'field';
    Validator.fn.required = function(message) {
        return function(field, value) {
            return validate(field, 'required', message, function() {
                return !Validator.empty(value);
            });
        };
    };
    Validator.fn.required.type = 'field';

    // regex
    Validator.fn.numeric = function(message, regex) {
        return function(field, value) {
            return validate(field, 'numeric', message, function() {
                if (regex) {
                    return regex.test(value);
                }
                return Type.rNumeric.test(value);
            });
        };
    };
    Validator.fn.numeric.type = 'field';
    Validator.fn.pattern = function(message, regex) {
        return function(field, value) {
            return validate(field, 'pattern', message, function() {
                return regex.test(value);
            });
        };
    };
    Validator.fn.pattern.type = 'field';

    // field validator
    // string
    Validator.fn.len = function(message, length) {
        return function(field, value) {
            return validate(field, 'len', message, function() {
                return value.length === length;
            });
        };
    };
    Validator.fn.len.type = 'field';
    Validator.fn.between = function(message, minLength, maxLength) {
        return function(field, value) {
            return validate(field, 'between', message, function() {
                var length = value.length;
                return minLength <= length && length <= maxLength;
            });
        };
    };
    Validator.fn.between.type = 'field';
    Validator.fn.minLength = function(message, minLength) {
        return function(field, value) {
            return validate(field, 'minLength', message, function() {
                return minLength <= value.length;
            });
        };
    };
    Validator.fn.minLength.type = 'field';
    Validator.fn.maxLength = function(message, maxLength) {
        return function(field, value) {
            return validate(field, 'maxLength', message, function() {
                return value.length <= maxLength;
            });
        };
    };
    Validator.fn.maxLength.type = 'field';

    // number, date
    Validator.fn.equals = function(message, equal) {
        return function(field, value) {
            return validate(field, 'equals', message, function() {
                return Type.isNumber(value) && equal === parseInt(value, 10);
            });
        };
    };
    Validator.fn.equals.type = 'field';
    Validator.fn.equalsFloat = function(message, equal) {
        return function(field, value) {
            return validate(field, 'equalsFloat', message, function() {
                return Type.isNumber(value) && equal === parseFloat(value);
            });
        };
    };
    Validator.fn.equalsFloat.type = 'field';
    Validator.fn.range = function(message, min, max) { //TODO must implement date validation, int, float validations
        return function(field, value) {
            var role = field.role;

            value = getRoleValue(role, value);
            max = getRoleTarget(role, max);
            min = getRoleTarget(role, min);

            return validate(field, 'range', message, function() {
                return Type.isNumber(value) && min <= value && value <= max;
            });
        };
    };
    Validator.fn.range.type = 'field';
    Validator.fn.min = function(message, min) { //TODO must implement date validation, int, float validations
        return function(field, value) {
            var role = field.role;

            value = getRoleValue(role, value);
            min = getRoleTarget(role, min);

            return validate(field, 'min', message, function() {
                return Type.isNumber(value) && min <= value;
            });
        };
    };
    Validator.fn.min.type = 'field';
    Validator.fn.max = function(message, max) { //TODO must implement date validation, int, float validations
        return function(field, value) {
            var role = field.role;

            value = getRoleValue(role, value);
            max = getRoleTarget(role, max);

            return validate(field, 'max', message, function() {
                return Type.isNumber(value) && value <= max;
            });
        };
    };
    Validator.fn.max.type = 'field';

    // checkbox, radio, select
    Validator.fn.choice = function(message, choices) {
        return function(field, value) {
            return validate(field, 'choice', message, function() {
                return value in choices;
            });
        };
    };
    Validator.fn.choice.type = 'field';
    Validator.fn.choices = function(message, choices) {
        return function(field, values) {
            return validate(field, 'choices', message, function() {
                return inChoices(values, choices);
            });
        };
    };
    Validator.fn.choices.type = 'field';

    // form valildator
    Validator.fn.equalsTo = function(message, field, equal) {
        return function() {
            if (field.valid && equal.valid) {
                return validate(field, 'equalsTo', message, function() {
                    return field.value() === equal.value();
                });
            }

            return true;
        };
    };
    Validator.fn.equalsTo.type = 'form';
    Validator.fn.compareTo = function(message, field, greater) {
        return function() {
            if (field.valid && greater.valid) {
                return validate(field, 'compareTo', message, function() {
                    return field.value() < greater.value();
                });
            }

            return true;
        };
    };
    Validator.fn.compareTo.type = 'form';
    Validator.fn.compareEqualsTo = function(message, field, greater) {
        return function() {
            if (field.valid && greater.valid) {
                return validate(field, 'compareEqualsTo', message, function() {
                    return field.value() <= greater.value();
                });
            }

            return true;
        };
    };
    Validator.fn.compareEqualsTo.type = 'form';

    Validator.fn.init.prototype = Validator.fn;

    return Validator;
}());
jam.Validator = Validator;

// for smart phone event
var checked = function(elem, label) {
    return elem.checked ? Css.add(label, 'checked') : Css.remove(label, 'checked');
};
var defaultChecked = function(elem, label) {
    return elem.defaultChecked ? Css.add(label, 'checked') : Css.remove(label, 'checked');
};
var selected = function(elem, label) {
    return elem.selected ? Css.add(label, 'selected') : Css.remove(label, 'selected');
};
var defaultSelected = function(elem, label) {
    return elem.defaultSelected ? Css.add(label, 'selected') : Css.remove(label, 'selected');
};
var radioGroupChecked = function(group, context) {
    var parent = context || document, radio, label;

    for (var i = group.length; i--;) {
        radio = group[i];
        label = parent.querySelector("label[for=" + radio.id + "]");
        checked(radio, label);
    }
};
var resetCheck = function(parent, selector) {
    var checks = parent.querySelectorAll(selector), elem, label;
    if (checks.length) {
        for (var i = checks.length; i--;) {
            elem = checks[i];
            label = parent.querySelector("label[for=" + elem.id + "]");
            if (label) {
                defaultChecked(elem, label);
            }
        }
    }
};
var resetCheckBoxes = function(form) {
    resetCheck(form, "input[type=checkbox]");
};
var resetRadioButtons = function(form) {
    resetCheck(form, "input[type=radio]");
};

(function() {
    // form reset
    var forms = document.getElementsByTagName("form"), form;
    if (!forms.length) {
        return;
    }
    for (var i = forms.length; i--;) {
        form = forms[i];
        Event.reset(form, function(event) {
            resetCheckBoxes(form);
            resetRadioButtons(form);
        });
    }
}());

(function() {
    // checkbox click
    var checks = document.querySelectorAll("input[type=checkbox]");
    if (!checks.length) {
        return;
    }
    for (var i = checks.length; i--;) {
        (function(elem){
            var label = document.querySelector("label[for=" + elem.id + "]");
            Event.click(elem, function(event) {
                checked(elem, label);
            });
        }(checks[i]));
    }
}());

(function() {
    // radio click
    var radios = document.querySelectorAll("input[type=radio]");
    if (!radios.length) {
        return;
    }
    for (var i = radios.length; i--;) {
        (function(elem) {
            var name = elem.name,
                form = elem.form,
                group = form[name];
            if (!group.length) {
                return;
            }
            Event.click(elem, function(event) {
                radioGroupChecked(group, form);
            });
        }(radios[i]));
    }
}());

}(window));
