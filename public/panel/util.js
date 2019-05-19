var maxRetryInterval = 10000;

function tryUntilTrue(conditionFunction, retryInterval, maxRetries, resolve, reject) {
	if(conditionFunction()) {
		resolve();
	} else if(maxRetries > 0) {
		setTimeout(() => {
			tryUntilTrue(conditionFunction, Math.min(maxRetryInterval, retryInterval * 2), maxRetries - 1, resolve, reject);
		}, retryInterval);
	} else {
        reject('Exceeded maximum retries limit');
    }
}