// ==UserScript==
// @name          Absolute Enable Right Click & Copy
// @namespace     https://github.com/duyt1001/monkey-mountain
// @description   Force Enable Right Click & Copy & Highlight
// @shortcutKeys  [Ctrl + `] Activate Absolute Right Click Mode To Force Remove Any Type Of Protection
// @author        Absolute
// @version       1.8.9
// @include       *://*
// @icon          https://i.imgur.com/AC7SyUr.png
// @compatible    Chrome Google Chrome + Tampermonkey
// @grant         GM_registerMenuCommand
// @license       BSD
// @copyright     Absolute, 2016-Oct-06
// @downloadURL https://update.greasyfork.org/scripts/23772/Absolute%20Enable%20Right%20Click%20%20Copy.user.js
// @updateURL https://update.greasyfork.org/scripts/23772/Absolute%20Enable%20Right%20Click%20%20Copy.meta.js
// ==/UserScript==

(function () {
	'use strict';

	var css = document.createElement('style');
	var head = document.head;

	css.type = 'text/css';

	css.innerText = `* {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
         user-select: text !important;
    }`;

	function main() {

		var doc = document;
		var body = document.body;

		var docEvents = [
			doc.oncontextmenu = null,
			doc.onselectstart = null,
			doc.ondragstart = null,
			doc.onmousedown = null
		];

		var bodyEvents = [
			body.oncontextmenu = null,
			body.onselectstart = null,
			body.ondragstart = null,
			body.onmousedown = null,
			body.oncut = null,
			body.oncopy = null,
			body.onpaste = null
		];

		[].forEach.call(
			['copy', 'cut', 'paste', 'select', 'selectstart'],
			function (event) {
				document.addEventListener(event, function (e) { e.stopPropagation(); }, true);
			}
		);

		alwaysAbsoluteMode();
		enableCommandMenu();
		head.appendChild(css);
		document.addEventListener('keydown', keyPress);
	}

	function keyPress(event) {
		if (event.ctrlKey && event.keyCode == 192) {
			return confirm('Activate Absolute Right Click Mode!') == true ? absoluteMode() : null;
		}

		if (event.metaKey && event.altKey && event.keyCode === 90) { // Cmd+Option+Z on macOS
			event.preventDefault();
			const selection = document.getSelection();
			selection.selectAllChildren(document.body);
			navigator.clipboard.writeText(selection.toString()).catch(console.error);
			selection.removeAllRanges();
			
			// 播放叮声
			DING.play().catch(console.error);
		}
	}

	function absoluteMode() {
		[].forEach.call(
			['contextmenu', 'copy', 'cut', 'paste', 'mouseup', 'mousedown', 'keyup', 'keydown', 'drag', 'dragstart', 'select', 'selectstart'],
			function (event) {
				document.addEventListener(event, function (e) { e.stopPropagation(); }, true);
			}
		);
	}

	function alwaysAbsoluteMode() {
		let sites = ['example.com', 'www.example.com'];
		const list = RegExp(sites.join('|')).exec(location.hostname);
		return list ? absoluteMode() : null;
	}

	function enableCommandMenu() {
		var commandMenu = true;
		try {
			if (typeof (GM_registerMenuCommand) == undefined) {
				return;
			} else {
				if (commandMenu == true) {
					GM_registerMenuCommand('Enable Absolute Right Click Mode', function () {
						return confirm('Activate Absolute Right Click Mode!') == true ? absoluteMode() : null;
					});
				}
			}
		}
		catch (err) {
			console.log(err);
		}
	}

	var blackList = [
		'youtube.com', '.google.', '.google.com', 'greasyfork.org', 'twitter.com', 'instagram.com', 'facebook.com', 'translate.google.com', '.amazon.', '.ebay.', 'github.', 'stackoverflow.com',
		'bing.com', 'live.com', '.microsoft.com', 'dropbox.com', 'pcloud.com', 'box.com', 'sync.com', 'onedrive.com', 'mail.ru', 'deviantart.com', 'pastebin.com',
		'dailymotion.com', 'twitch.tv', 'spotify.com', 'steam.com', 'steampowered.com', 'gitlab.com', '.reddit.com'
	]

	var enabled = false;
	var url = window.location.hostname;
	var match = RegExp(blackList.join('|')).exec(url);

	if (window && typeof window != undefined && head != undefined) {

		if (!match && enabled != true) {

			main();
			enabled = true

			//console.log(location.hostname);

			window.addEventListener('contextmenu', function contextmenu(event) {
				event.stopPropagation();
				event.stopImmediatePropagation();
				var handler = new eventHandler(event);
				window.removeEventListener(event.type, contextmenu, true);
				var eventsCallBack = new eventsCall(function () { });
				handler.fire();
				window.addEventListener(event.type, contextmenu, true);
				if (handler.isCanceled && (eventsCallBack.isCalled)) {
					event.preventDefault();
				}
			}, true);
		}

		function eventsCall() {
			this.events = ['DOMAttrModified', 'DOMNodeInserted', 'DOMNodeRemoved', 'DOMCharacterDataModified', 'DOMSubtreeModified'];
			this.bind();
		}

		eventsCall.prototype.bind = function () {
			this.events.forEach(function (event) {
				document.addEventListener(event, this, true);
			}.bind(this));
		};

		eventsCall.prototype.handleEvent = function () {
			this.isCalled = true;
		};

		eventsCall.prototype.unbind = function () {
			this.events.forEach(function (event) { }.bind(this));
		};

		function eventHandler(event) {
			this.event = event;
			this.contextmenuEvent = this.createEvent(this.event.type);
		}

		eventHandler.prototype.createEvent = function (type) {
			var target = this.event.target;
			var event = target.ownerDocument.createEvent('MouseEvents');
			event.initMouseEvent(
				type, this.event.bubbles, this.event.cancelable,
				target.ownerDocument.defaultView, this.event.detail,
				this.event.screenX, this.event.screenY, this.event.clientX, this.event.clientY,
				this.event.ctrlKey, this.event.altKey, this.event.shiftKey, this.event.metaKey,
				this.event.button, this.event.relatedTarget
			);
			return event;
		};

		eventHandler.prototype.fire = function () {
			var target = this.event.target;
			var contextmenuHandler = function (event) {
				event.preventDefault();
			}.bind(this);
			target.dispatchEvent(this.contextmenuEvent);
			this.isCanceled = this.contextmenuEvent.defaultPrevented;
		};

	}

	// 定义一些系统提示音
	const DING = new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');

})();

