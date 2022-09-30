const fs = require("fs");
const path = require("path");
const pretty = require("pretty"); // makes html output to file "pretty"
const { success, err } = require("./cliDisplay");

// styles constant holds reference to customs stylesheet and Google fonts
const styles = `<link rel="stylesheet" type="text/css" href="../src/siteit.css" /> 
<link rel="preconnect" href="https://fonts.googleapis.com"> 
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> 
<link href="https://fonts.googleapis.com/css2?family=Questrial&display=swap" rel="stylesheet">`;

const BOLD_REGEX_MD = /\*\*(.+?)\*\*(?!\*)/g
const ITALIC_REGEX_MD = /\*([^*><]+)\*/g

/*  generatePTags programmatically generates tags based on regular expression
The function replaces all instances of carriage return and newline characters
with appropriate paragraph tags and a blank line */
const generatePTags = (content) => {
  let returnStr = content.replace(/[\r\n]{2,}/g, "</p>\n\n<p>")
  returnStr = returnStr.replace(/\-{3}/g, '<hr>')
  returnStr = returnStr.replace(/(\r\n|\n|\r)/gm, " ")
  returnStr = returnStr.replace(BOLD_REGEX_MD, '<strong>$1</strong>');
  returnStr = returnStr.replace(ITALIC_REGEX_MD, "<i>$1</i>");

  return `<p>${returnStr}</p>`;
};

/*  generateHTML uses template literals and string interpolation to write html 
html markup to output file. Tags are programmatically generated when call to
generatePTags is invoked with file content */
const generateHTML = (...args) => {
  const inputFileExtension = path.extname(args[0])

  // get just the name of the file and replace ".txt" with "html"
  let fileNameWithHTMLExt = path.basename(args[0]).replace(inputFileExtension, ".html");
  // passing file content to generatePTags without heading and extra spaces in the beginning
  let content = generatePTags(inputFileExtension === '.txt' ? 
    args[1].substring(fileNameWithHTMLExt.replace(".html", "").length + 2) : args[1]
  );

  // a lot of string interpolation instances to generate the final markup
  let markup = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
${styles}
<title>${fileNameWithHTMLExt.replace(".html", "")}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
${inputFileExtension === '.txt' ? `<h1>${args[1].substring(0, args[1].indexOf("\n"))}</h1>` :''}
${content}
</body>
</html>`;

  try {
    // create and write to file
    fs.writeFileSync(
      path.join(__dirname, `../dist/${fileNameWithHTMLExt}`),
      pretty(markup, { ocd: true }) // fix the html output formatting using "pretty"
    );
    console.log(
      // success message
      success(`-- ${fileNameWithHTMLExt} generated in dist directory --`)
    );
  } catch (e) {
    // error message
    console.error(
      err(`-- ERROR writing to output file ${fileNameWithHTMLExt}`)
    );
  }
};
/*  generateIndexFile behaves similar to generateHTML except its generating
markup for Index file which contains list items with working relative link
to files generated by genereateHTML. This function should not be invoked
prior to invoking generateHTML */

const generateIndexFile = (files) => {
  let content = ``;
  files.map((file) => {
    const fileExtension = path.extname(file)

    content += `<li><a href="../dist/${path
      .basename(file)
      .replace(fileExtension, ".html")}"</a>${file.replace(fileExtension, "")}</li>`;
  });

  // markup for index.html
  let markup = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
${styles}
<title>Index</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
<h1>Index</h1>
<ul>
${content}
</ul>
</body>
</html>`;

  // create and write to file:
  try {
    fs.writeFileSync(
      path.join(__dirname, `../dist/index.html`),
      pretty(markup, { ocd: true })
    );
    // success message
    console.log(success(`-- index.html generated in dist directory --`));
  } catch (e) {
    // error message
    console.error(err(`-- ERROR generating index.html --`));
  }
};

module.exports = { generateHTML, generateIndexFile };
