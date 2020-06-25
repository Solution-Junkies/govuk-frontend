import '../../vendor/polyfills/Function/prototype/bind'
// addEventListener, event.target normalization and DOMContentLoaded
import '../../vendor/polyfills/Event'
import '../../vendor/polyfills/Element/prototype/classList'
import { nodeListForEach } from '../../common'

function Checkboxes ($module) {
  this.$module = $module
  this.$inputs = $module.querySelectorAll('input[type="checkbox"]')
}

Checkboxes.prototype.init = function () {
  var $module = this.$module
  var $inputs = this.$inputs

  nodeListForEach($inputs, function ($input) {
    var target = $input.getAttribute('data-aria-controls')

    // Skip checkboxes without data-aria-controls attributes, or where the
    // target element does not exist.
    if (!target || !$module.querySelector('#' + target)) {
      return
    }

    // Promote the data-aria-controls attribute to a aria-controls attribute
    // so that the relationship is exposed in the AOM
    $input.setAttribute('aria-controls', target)
    $input.removeAttribute('data-aria-controls')
  })

  // When the page is restored after navigating 'back' in some browsers the
  // state of form controls is not restored until *after* the DOMContentLoaded
  // event is fired, so we need to sync after the pageshow event in browsers
  // that support it.
  if ('onpageshow' in window) {
    window.addEventListener('pageshow', this.syncAll.bind(this))
  } else {
    window.addEventListener('DOMContentLoaded', this.syncAll.bind(this))
  }

  // Although we've set up handlers to sync state on the pageshow or
  // DOMContentLoaded event, init could be called after those events have fired,
  // for example if they are added to the page dynamically, so sync now too.
  this.syncAll()

  $module.addEventListener('click', this.handleClick.bind(this))
}

Checkboxes.prototype.syncAll = function () {
  nodeListForEach(this.$inputs, this.syncWithInputState.bind(this))
}

Checkboxes.prototype.syncWithInputState = function ($input) {
  var $content = this.$module.querySelector('#' + $input.getAttribute('aria-controls'))

  if ($content) {
    var inputIsChecked = $input.checked

    $input.setAttribute('aria-expanded', inputIsChecked)
    $content.classList.toggle('govuk-checkboxes__conditional--hidden', !inputIsChecked)
  }
}

Checkboxes.prototype.handleClick = function (event) {
  var $target = event.target

  // If a checkbox with aria-controls, handle click
  var isCheckbox = $target.getAttribute('type') === 'checkbox'
  var hasAriaControls = $target.getAttribute('aria-controls')
  if (isCheckbox && hasAriaControls) {
    this.syncWithInputState($target)
  }
}

export default Checkboxes
