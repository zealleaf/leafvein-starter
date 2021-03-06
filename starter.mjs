#!/usr/bin/env node
import { argv, chalk, question, fs, path } from "zx";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import ora from "ora";
import download from "download-git-repo";
import templates from "./templates.mjs";

// Let esm support __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project projectInfo
const projectInfo = {
  name: "leafvein-project",
  version: "0.0.0",
  description: "",
  author: "",
};

// command
const create = argv.create;
const version = argv.version;
const help = argv.help;

// functions
const downloadTemplate = (gitRepo) => {
  const spinner = ora();
  spinner.start("downloading the template...");
  download(
    `direct:${templates[gitRepo].url}`,
    projectInfo.name,
    { clone: true },
    (err) => {
      if (err) {
        spinner.fail();
        console.error(chalk.redBright(err));
        process.exit(1);
      }
      spinner.succeed("downloaded the template!");
      const pkgPath = `./${projectInfo.name}/package.json`;
      const pkgContent = fs.readJSONSync(pkgPath);
      const newPkgContent = { ...pkgContent, ...projectInfo };
      fs.writeFileSync(pkgPath, JSON.stringify(newPkgContent, null, 2));
      console.log(
        chalk.green(`
cd ${projectInfo.name}
npm install
npm run dev`)
      );
    }
  );
};

const selectTemplate = async () => {
  const choiceList = Object.keys(templates);
  const template = await inquirer.prompt({
    name: "choices",
    message: "What is your preferred template?",
    type: "list",
    choices: choiceList.map((choice) => {
      return chalk[templates[choice].color].bold(choice);
    }),
  });

  let gitRepo;
  choiceList.forEach((choice) => {
    if (template.choices.includes(choice)) {
      gitRepo = choice;
    }
  });

  downloadTemplate(gitRepo);
};

(async function () {
  if (create) {
    const name = await question("Project name: ");
    if (name) {
      projectInfo.name = name;
    }
    if (!fs.existsSync(projectInfo.name)) {
      projectInfo.author = await question("Project author: ");
      projectInfo.description = await question("Project description: ");
      selectTemplate();
    } else {
      console.error(chalk.redBright("project has existed !!! enter again:"));
      main();
    }
  }

  if (version) {
    const v = fs.readJSONSync(__dirname + "/package.json").version;
    console.log(chalk.cyan("v" + v));
  }

  if (help) {
    console.log(`
--create: You can generate a project from the provided template!
--version: View current version.`);
  }
})();

if (!create && !version && !help) {
  console.warn(
    chalk.yellowBright(`
unknown command!!!`)
  );
  console.log(chalk.blueBright("Type lvs --help to see more commands!"));
  process.exit(1);
}
