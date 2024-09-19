(async () => {
	const { CryptoUtils } = await import('../lib/browser/index.js');
	const crypto = await import('crypto');
	console.log(CryptoUtils.md5('aaa')); //47bce5c74f589f4867dbd57e9ca9f808
	console.log(CryptoUtils.sha256('aaa')); //9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0
})();
