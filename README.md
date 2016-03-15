# FormSpy

***A library for two way observation between form elements and javscript objects***

FormSpy is a library for observing form elements and javascript objects biderectional by using (Polymer observe-js)[https://github.com/Polymer/observe-js]. If a observed form element such as a text input field changes the data also changes. And if the data object itself changes the observed form elements also changes magically.

## Prerequisite and limitations

FormSpy requires observe-js to be included that's all. Since apparently not all browsers are supported by observe-js the form elements might not update automatically when the data object is changing.

## Usage

To create a observation between a form element and a data object simply provide the element, the object and optionally the path to store the value to:

```js
var myObject = { foo: { bar: '' } };

// With pure javascript
var myInput = document.getElementById('myInput');
FormSpy.observe(myInput, myObject, 'foo.bar');

// Or with jQuery
FormSpy.observe($('#myInput')[0], myObject, 'foo.bar');
```

If no path is specified `value` is used.  
Unobserve is also pretty easy:

```js
var myObject = { foo: { bar: '' } };
var myObserve = FormSpy.observe($('#myInput')[0], myObject, 'foo.bar');

// Unobserve it
FormSpy.unobserve(myObserve);
```

You can also take a look at the code in `example`.