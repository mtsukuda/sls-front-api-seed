const chalk = require("chalk");

module.exports.taskName = (gulpTaskName) => {
  console.log(
    " 🚀🚀🚀 " + chalk.bold.bgBlueBright(` ${gulpTaskName} `) + " 🚀🚀🚀 "
  );
};

module.exports.note = (gulpNote) => {
  console.log(" 📣🥸 " + chalk.green(` ${gulpNote} `));
};

module.exports.working = (
  gulpWorking,
  gulpWorkingKey = "",
  gulpWorkingVal = ""
) => {
  console.log(
    " ⚙️🛠 " +
      chalk.green(` ${gulpWorking}`) +
      chalk.whiteBright(gulpWorkingKey) +
      chalk.green(`${gulpWorkingVal} `)
  );
};

module.exports.checkGreen = (target) => {
  console.log(chalk.greenBright(`✓ `) + `${target}`);
};
