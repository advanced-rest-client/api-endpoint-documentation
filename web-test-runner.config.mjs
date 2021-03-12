/** @typedef {import('@web/test-runner').TestRunnerConfig} TestRunnerConfig */

export default /** @type TestRunnerConfig */ ({
  files: 'test/**/*.test.js',
  nodeResolve: true,
  middleware: [
    function rewriteBase(context, next) {
      if (context.url.indexOf('/base') === 0) {
        context.url = context.url.replace('/base', '');
      }
      return next();
    }
  ],
  testFramework: {
    config: {
      timeout: 10000,
    },
  },
  testRunnerHtml: (testFramework) =>
    `<html>
		<body>
		  <script src="../demo/vendor.js"></script>
		  <script type="module" src="${testFramework}"></script>
		</body>
	  </html>`
});
