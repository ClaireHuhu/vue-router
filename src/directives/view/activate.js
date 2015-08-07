var getRouteConfig = require('../../util').getRouteConfig

module.exports = function (transition) {
  if (transition.to._aborted) {
    return
  }

  // update current route component id
  var id = this._routeComponentID = transition._componentID
  var Component = transition._Component

  // no component
  if (!id || !Component) {
    return this.setComponent(null)
  }

  var self = this
  var activateHook = getRouteConfig(Component, 'activate')
  var dataHook = getRouteConfig(Component, 'data')

  /**
   * Build new instance, either caused by siwtching to a
   * different component, or because canReuse is false and
   * we need to reload current component.
   */

  var build = function () {
    self.setComponent(id, null, function (component) {
      component.$loading = true
      loadData(component)
    })
  }

  /**
   * Asynchronously load and apply data.
   *
   * @param {Vue} component
   */

  var loadData = function (component) {
    if (!dataHook || !component) {
      return
    }
    component.$loading = true
    transition._callHook(dataHook, component, function (data) {
      if (data) {
        for (var key in data) {
          component.$set(key, data[key])
        }
      }
      component.$loading = false
    })
  }

  if (transition._canReuse) {
    if (transition.to.path !== transition.from.path) {
      // reload data if necessary
      loadData(this.childVM)
    }
  } else if (activateHook) {
    // call activate hook first
    transition._callHook(activateHook, null, build)
  } else {
    // no activate hook, just build
    build()
  }
}