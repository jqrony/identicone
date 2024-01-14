/**
 * Identicone.js v1.0.0
 * A random Identicon avatar generator Libarary.
 * https://github.com/jqrony/identicone
 * 
 * Copyright 2024, Shahzada Modassir
 * Released under the MIT License
 * https://github.com/jqrony/identicone/blob/main/LICENSE
 * 
 * @author Shahzada Modassir
 * date: 14 January 2024 23:46:30 GMT+0530
 */
(function(_w) {
"use strict";

var encoder  = new TextEncoder();
var document = _w.document;

/**
 * Create Identicone instance public API
 */
function Identicone() {
	return !(this instanceof Identicone) && new Identicone();
}

function compileHex(compaire, hex, uid, len) {
	if (compaire===hex) {
		hex = "#" + uid.slice(len - 6, len);
		len += 6;
		if (Math.abs(len) <= uid.length) {
			compileHex(compaire, hex, uid, len);
		}
	}
	return hex;
}

function encodeSHA1(data, callback) {
	var buffer;
	buffer = encoder.encode(data);
	crypto.subtle.digest("SHA-1", buffer).then(function(newBuffer) {
		return Array.from(new Uint8Array(newBuffer))
			.map(function(byte) {
				return byte.toString(16).padStart(2, '0');
			}).join("");
	}).then(callback);
}

Identicone.Hooks = {
	identicon: function(uid, options, context) {
		var i = 0, x, y;
		for(; i < 20; i++) {
			x = (uid.charCodeAt(i) % 5) * (options.size / 5);
			y = (uid.charCodeAt(i + 1) % 5) * (options.size / 5);
			context.fillRect(x, y, options.size / 3.5, options.size / 3.5);
		}
	}
};

/**
 * Create multi profile generator public API
 */
Identicone.prototype.generate=function(options, callback) {
	var canvas   = document.createElement("canvas");
	var context  = canvas.getContext("2d");
	options = options || {};
	options.size=typeof options.size!=="number" ? 100 : options.size;
	options.type="identicon";
	

	var primaryHex="#", secondryHex="#", hexLen=6;

	canvas.height = options.size;
	canvas.width = options.size;
	context.font = `900 ${options.size}px Arial`;

	encodeSHA1(options.uid, function(uid) {
		secondryHex += uid.slice(-hexLen);
		primaryHex  += uid.slice(0, hexLen);
		context.fillStyle = primaryHex;
		secondryHex = compileHex(primaryHex, secondryHex, uid, hexLen);
		context.fillRect(0, 0, options.size, options.size);
		context.fillStyle = secondryHex;
		Identicone.Hooks[options.type](uid, options, context);
		if (callback && typeof callback==="function") {
			canvas.toBlob(function(blob) {
				callback.call(this, canvas, URL.createObjectURL(blob), canvas.toDataURL("image/png"), blob);
			});
		}
	});
};


if (typeof define==="function" && define.amd) {
	define(function() {
		return Identicone
	});
}
if (typeof module==="object" && module.exports) {
	module.exports = Identicone;
} else {
	window.Identicone = Identicone;
}
})(window);