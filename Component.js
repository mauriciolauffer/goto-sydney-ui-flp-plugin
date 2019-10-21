sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/core/Component",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function (ObjectPath, Component, Fragment, MessageBox) {

	return Component.extend("mlauffer.shell.plugin.Component", {
		metadata: {
			"manifest": "json"
		},

		init: function () {
			this._resourceBundle = this.getModel("i18n").getResourceBundle();
			this._getRenderer()
				.then(function (renderer) {
					this._popupDisplay();
					this._addButtonToHeader(renderer);
				}.bind(this))
				.catch(function (err) {
					MessageBox.error(this._resourceBundle.getText("error") + err);
				}.bind(this));
		},

		_addButtonToHeader: function (renderer) {
			renderer.addHeaderItem({
				icon: "sap-icon://hint",
				tooltip: this._resourceBundle.getText("btBlogTooltip"),
				press: function () {
					const url = "https://blogs.sap.com/2018/10/17/join-the-sap-cloud-platform-portal-developer-challenge-2018";
					window.open(url, "_blank");
				}
			}, true, false);
		},

		_popupDisplay: function () {
			if (!this._dialog) {
				Fragment.load({
						id: this.getId() + "flpPopup",
						name: "mlauffer.shell.plugin.view.Dialog",
						controller: this
					})
					.then(function (dialog) {
						this._dialog = dialog;
						this._dialog.setModel(this.getModel("i18n"), "i18n");
						this._dialog.open();
					}.bind(this));
			} else {
				this._dialog.open();
			}
		},

		onPopupClose: function (evt) {
			this._dialog.close();
			this._dialog.destroy();
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			const resourceBundle = this._resourceBundle;
			return new Promise(function (resolve, reject) {
				const shellContainer = ObjectPath.get("sap.ushell.Container");
				if (!shellContainer) {
					reject(resourceBundle.getText("errorShellContainer"));
				} else {
					const renderer = shellContainer.getRenderer();
					if (renderer) {
						resolve(renderer);
					} else {
						shellContainer.attachRendererCreatedEvent(function (evt) {
							renderer = evt.getParameter("renderer");
							if (renderer) {
								resolve(renderer);
							} else {
								reject(resourceBundle.getText("errorShellRenderer"));
							}
						});
					}
				}
			});
		}
	});
});