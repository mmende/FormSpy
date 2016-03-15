'use strict';

declare var Path
declare var PathObserver

class FormSpy {

	private static observerIDs: number = 0
	private static observes: { 
		observer: any,
		eventListener: EventListener,
		eventType: string,
		element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
	}[] = []

	/**
	 * Creates a two way observation between a form element and a data object.
	 * Currently supported elements are textarea or input[type="text"|"number"|"checkbox"|...] and selects.
	 *
	 * @param  {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} element The form element to control.
	 * @param  {Object}                                                     data    The data to syncronize the data of the form element with.
	 * @param  {string = 'value'}                                           path    The path to store the value at inside the data object.
	 *
	 * @return {number}                   [description]
	 */
	public static observe(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, data: Object, path: string = 'value'): number {
		// Check what type of observe is required
		if (element.nodeName === 'SELECT')
			return this.observeSelect(<HTMLSelectElement>element, data, path)
		if (element.nodeName === 'INPUT' && element.getAttribute('type') !== null &&element.getAttribute('type').toLowerCase().trim() === 'checkbox')
			return this.observeCheckbox(<HTMLInputElement>element, data, path)
		return this.observeText(<HTMLInputElement>element, data, path)
	}

	/**
	 * Unobserves a textarea or input[type="text"|"number"|...] and the data object again.
	 *
	 * @param {number} observerID The observerID received from observeText(...), observeCheckbox(...) or observeSelect(...).
	 */
	public static unobserve(observerID: number) {
		if (typeof this.observes[observerID] !== 'undefined') {
			// Close the observe-js observer
			this.observes[observerID].observer.close()
			// Remove the eventListener
			this.observes[observerID].element.removeEventListener(this.observes[observerID].eventType, this.observes[observerID].eventListener, false)
			// Remove the reference
			delete this.observes[observerID]
		}
	}

	/**
	 * Creates a two way observation between a textarea or input[type="text"|"number"|...] and a data object.
	 *
	 * @param {HTMLInputElement|HTMLTextAreaElement} element The checkbox to observe for changes.
	 * @param {Object}                               data    The object containing the value attribute.
	 * @param {string}                               path    The path for the value property.
	 *
	 * @return {number} The observer id to use to unobserve again.
	 */
	private static observeText(element: HTMLInputElement | HTMLTextAreaElement, data: Object, path: string = 'value'): number {
		if (!this.observeJsIncluded()) return

		var observer = new PathObserver(data, path);
		observer.open(function(newValue, oldValue) {
			// respond to data.<value> having changed value.
			if (element.value !== newValue)
				element.value = newValue
		})
		var keyupListener = function() {
			if (Path.get(path).getValueFrom(data) !== this.value) Path.get(path).setValueFrom(data, this.value)
		}
		element.addEventListener('keyup', keyupListener, false)

		return this.registerObserver(observer, keyupListener, 'keyup', element)
	}

	/**
	 * Creates a two way observation between a input[type="checkbox"] and a data object.
	 *
	 * @param {HTMLInputElement} checkbox The checkbox to observe for changes.
	 * @param {Object}           data     The object containing the value attribute.
	 * @param {string}           path     The path for the value property.
	 *
	 * @return {number} The observer id to use to unobserve again.
	 */
	private static observeCheckbox(checkbox: HTMLInputElement, data: Object, path: string = 'value'): number {
		if (!this.observeJsIncluded()) return
		
		var observer = new PathObserver(data, path);
		observer.open(function(newValue, oldValue) {
			// respond to data.<value> having changed value.
			checkbox.checked = newValue
		})
		var changeListener = function() {
			if (Path.get(path).getValueFrom(data) !== this.checked) Path.get(path).setValueFrom(data, this.checked)
		}
		checkbox.addEventListener('change', changeListener, false)

		return this.registerObserver(observer, changeListener, 'change', checkbox)
	}

	/**
	 * Creates a two way observation between a select (single select) and a data object.
	 *
	 * @param {HTMLSelectElement} select The select to observe for changes.
	 * @param {Object}            data   The object containing the value attribute.
	 * @param {string}            path   The path for the value property.
	 *
	 * @return {number} The observer id to use to unobserve again.
	 */
	private static observeSelect(select: HTMLSelectElement, data: Object, path: string = 'value'): number {
		if (!this.observeJsIncluded()) return

		var observer = new PathObserver(data, path);
		observer.open(function(newValue, oldValue) {
			// Check if newValue is empty
			if (!newValue) return
			// respond to data.<value> having changed value.
			var option: HTMLOptionElement = <HTMLOptionElement>select.querySelector('option[value="' + newValue + '"]')
			// Create a new option with the updated value if such a option does not exist
			if (option === null) {
				option = document.createElement('option')
				option.value = newValue
				option.innerText = newValue
				select.appendChild(option)
			}
			// Select the corresponding option
			option.selected = true
		})
		var changeListener = function() {
			if (Path.get(path).getValueFrom(data) !== this.value) Path.get(path).setValueFrom(data, this.value)
		}
		select.addEventListener('change', changeListener, false)

		return this.registerObserver(observer, changeListener, 'change', select)
	}
	

	/**
	 * Registers a new observer.
	 *
	 * @param  {any}                                                    observer The PathObserver object.
	 * @param  {EventListener}                                          listener The listener registered to determine changes on the dom element.
	 * @param  {string}                                                 type     The listener type.
	 * @param  {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} element  The element the listener is bound to.
	 *
	 * @return {number}                 The observer id.
	 */
	private static registerObserver(observer: any, listener: EventListener, type: string, element: HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement): number {
		// Get a new observerID
		var id = this.observerIDs++
		// Register the observer
		this.observes[id] = {
			observer: observer,
			eventListener: listener,
			element: element,
			eventType: type
		}
		return id
	}

	/**
	 * Checks if an element was removed from the DOM.
	 *
	 * @deprecated The element values can still be accessed if they are outside of the DOM.
	 *
	 * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} element The element to check for removal.
	 * @param {Function}                                                   callback A callback function to trigger when the element get's removed.
	 */
	private static onElementRemoval(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, callback: Function) {
		if (window.hasOwnProperty('MutationObserver')) {
			// For browsers with MutationObserver
			var mutObserver = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					for (var i = 0; i < mutation.removedNodes.length; ++i) {
						if (mutation.removedNodes[i] === element) {
							callback()
							mutObserver.disconnect()
						}
					}
				})
			})
			mutObserver.observe(element.parentElement, {childList: true})
		} else {
			// For browsers without MutationObserver
			var removeListener = function(event) {
				if (event.target === element) {
					callback()
					element.parentElement.removeEventListener('DOMNodeRemove', removeListener)
				}
			}
			element.parentElement.addEventListener('DOMNodeRemoved', removeListener)
		}
	}

	/**
	 * Determines if observe-js was included.
	 *
	 * @return {boolean} If observe-js was included.
	 */
	private static observeJsIncluded(): boolean {
		var included = window.hasOwnProperty('PathObserver') && window.hasOwnProperty('Path');
		if (!included)
			console.error('FormSpy requires observe-js. https://github.com/Polymer/observe-js')
		return included
	}
}