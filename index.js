const linkedin = require("./interfaceLinkedin");

(async () => {
  //await linkedin.initialize();
  await linkedin.crawl();

  debugger;
})();
