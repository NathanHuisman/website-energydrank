/*
	██  ██  ██    ████    ██████    ██    ██  ██████  ██    ██    ██████
	██  ██  ██  ██    ██  ██    ██  ████  ██    ██    ████  ██  ██
	██  ██  ██  ████████  ██████    ██  ████    ██    ██  ████  ██    ██
	  ██  ██    ██    ██  ██    ██  ██    ██  ██████  ██    ██    ██████
	
	  ████  ██████      ████    ██████    ██████    ██  ██      ████    ████    ██████    ██████
	██      ██    ██  ██    ██  ██    ██  ██    ██  ██  ██    ██      ██    ██  ██    ██  ██____
	██      ██████    ████████  ██████    ██████      ██      ██      ██    ██  ██    ██  ██
	  ████  ██    ██  ██    ██  ██        ██          ██        ████    ████    ██████    ██████

	...and crappy ANSI art...
*/

let newLine = String.fromCharCode(0x0A);
let XMLArray;
let quizDoneArray = [];

document.addEventListener("load", main());
function main() {
	loadQuiz("quiz.xml");
}

async function loadQuiz(url) {
	let response = await fetch(url);
	let XMLText = await response.text();
	let regex = /<q>((\s|.)*?)(?=<\/q>)/g;
	XMLArray = XMLText.match(regex);
	for (i = 0; i < XMLArray.length; i++) {
		let XML = XMLArray[i].slice(XMLArray[i].indexOf(">") + 1);
		XML = replaceTag(XML, "text", "h1");
		let answerType = /<answer((.|\s)*?)type((.|\s)*?)=((.|\s)*?)"((.|\s)*?)"((.|\s)*?)>/.exec(XML)[7];
		console.log(answerType);
		switch (answerType) {
			case "text": {
				XML = replaceTag(XML, "answer", "input", "type=\"text\"");
			}
			case "text-long": {
				XML = replaceTag(XML, "answer", "textarea");
			}
			case "multiple-choice-radio": {
				XML = XML.replace(/<a(|( [^]*?))>[^]*?<\/a>/g, (match) => {
					return "<p><span class=\"checkbox\"></span>" + match + "</p>";
				});
				XML = replaceTag(XML, "answer", "div");
				XML = replaceTag(XML, "a", "input", "type=\"radio\" name=\"multiple-choice-" + i + "\"", true);
			}
			case "multiple-choice-check": {
				XML = XML.replace(/<a(|( [^]*?))>[^]*?<\/a>/g, (match) => {
					return "<p>" + match + " <br /> </p>";
				});
				XML = replaceTag(XML, "answer", "div");
				XML = replaceTag(XML, "a", "input", "type=\"checkmark\" name=\"multiple-choice-" + i + "\"", true);
			}
		}
		XML += newLine + "<button class=\"continue\" onclick=\"goToPage(" + (i + 1) + ");\">Volgende vraag</button>";
		XMLArray[i] = XML;
	}
	document.querySelector("#quiz").innerHTML = XMLArray[0];
	let quizEls = document.querySelectorAll("#quiz > * > p");
	if (quizEls) {
		for (i = 0; i < quizEls.length; i++) {
			quizEls[i].addEventListener("click", evt => {
				let button = evt.target.querySelector("input");
				if (!button) return;
				button.click();
			});
		}
	}

}



function replaceTag(text, tag, newTag, newAttr, keepAttr) {
	newAttr = newAttr ? " " + newAttr : "";
	return text.replace(new RegExp("<(\/?" + tag + "([^]*?))>", "g"), (match, noBr, attr) => {
		if (!keepAttr) {
			attr = "";
		}
		if (noBr.endsWith("/")) {
			return "<" + newTag + newAttr + attr + " />";
		}
		else if (noBr.charAt(0) === "/") {
			return "</" + newTag + ">";
		}
		else {
			return "<" + newTag + newAttr + attr + ">";
		}
	});
}



function goToPage(page) {
	let quizWindow = document.querySelector("#quiz");
	quizDoneArray.push(quizWindow.querySelectorAll("*"));
	if (page >= XMLArray.length) {
		finishQuiz(quizDoneArray);
		console.log(quizDoneArray);
		return;
	}
	quizWindow.innerHTML = XMLArray[page];
	let quizEls = document.querySelectorAll("#quiz > * > p");
	if (quizEls) {
		for (i = 0; i < quizEls.length; i++) {
			quizEls[i].addEventListener("click", evt => {
				let button = evt.target.querySelector("input");
				if (!button) return;
				button.click();
			});
		}
	}
}



async function getAllHTMLElements() {
	let response = await fetch("https://api.github.com/repos/mdn/browser-compat-data/contents/html/elements");
	let responseJSON = await response.json();
	let nameArray = [];
	let fetchArray = [];
	let getJSONArray = [];
	let JSONArray = [];
	console.log(responseJSON);
	for (i = 0; i < responseJSON.length; i++) {
		const element = responseJSON[i];
		nameArray.push(element.name.split(".")[0]);
		fetchArray.push(fetch(element.url));
	}
	let fetchResponses = await Promise.all(fetchArray);
	for (i = 0; i < fetchResponses.length; i++) {
		getJSONArray.push(fetchResponses[i].json());
	}
	JSONArray = await Promise.all(fetchArray);
	console.log(JSONArray);
}

function finishQuiz(quizArr) {
	let points = 0;
	for (let i = 0; i < quizArr.length; i++) {
		for (let j = 0; j < quizArr[i].length; j++) {
			if (quizArr[i][j].tagName.toLowerCase() !== "input") continue;
			if (quizArr[i][j].attributes.correctAnswer && quizArr[i][j].checked) {
				points++;
				console.log(points);
			}
		}
	}
	let quizWindow = document.querySelector("#quiz");
	quizWindow.innerHTML = "<h1>De quiz is afgelopen. je hebt " + points + " van de " + quizArr.length + " vragen goed!</h1>";
	
}