var maxRetryInterval = 10000;

function tryUntilTrue(conditionFunction, retryInterval, maxRetries, resolve, reject) {
	if (conditionFunction()) {
		resolve();
	} else if (maxRetries > 0) {
		setTimeout(() => {
			tryUntilTrue(conditionFunction, Math.min(maxRetryInterval, retryInterval * 2), maxRetries - 1, resolve, reject);
		}, retryInterval);
	} else {
		reject('Exceeded maximum retries limit');
	}
}

String.prototype.indexOfRegex = function (regex, fromIndex) {
	var str = fromIndex ? this.substring(fromIndex) : this;
	var match = str.match(regex);
	return match ? str.indexOf(match[0]) + (fromIndex ? fromIndex : 0) : -1;
}

function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}