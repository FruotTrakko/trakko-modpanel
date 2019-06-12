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

String.prototype.indexOfRegex = function(regex, fromIndex){
	var str = fromIndex ? this.substring(fromIndex) : this;
	var match = str.match(regex);
	return match ? str.indexOf(match[0]) + (fromIndex ? fromIndex : 0) : -1;
  }