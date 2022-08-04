/*
	██  ██  ██    ████    ██████    ██    ██  ██████  ██    ██    ██████  
	██  ██  ██  ██    ██  ██    ██  ████  ██    ██    ████  ██  ██        ██
	██  ██  ██  ████████  ██████    ██  ████    ██    ██  ████  ██    ██  
	  ██  ██    ██    ██  ██    ██  ██    ██  ██████  ██    ██    ██████  ██
	
	  ████  ██████      ████    ██████    ██████    ██  ██      ████    ████    ██████    ██████
	██      ██    ██  ██    ██  ██    ██  ██    ██  ██  ██    ██      ██    ██  ██    ██  ██____
	██      ██████    ████████  ██████    ██████      ██      ██      ██    ██  ██    ██  ██
	  ████  ██    ██  ██    ██  ██        ██          ██        ████    ████    ██████    ██████

	...and crappy ANSI art...
	But it works! (at least, i hope it works...)
	I wouldn't advise to read it, you'll think you know nothing of life because you don't know how this could possibly work...
	-----DEPRESSION ALERT!!!!!-----

	made by Nathan Huisman
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
		let answerType = "multiple-choice-radio";
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
		XML = replaceTag(XML, "des", "p", "id=\"answer\"");
		XML += newLine + "<button class=\"continue\" onclick=\"goToPage(" + (i + 1) + ");\">Antwoord</button>";
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
	let quizElms = quizWindow.querySelectorAll("*");
	quizDoneArray.push(quizWindow.querySelectorAll("*"));
	if (page >= XMLArray.length) {
		finishQuiz(quizDoneArray);
		console.log(quizDoneArray);
		return;
	}
	for (let i = 0; i < quizElms.length; i++) {
		if (quizElms[i].tagName.toLowerCase() === "button") {
			quizElms[i].innerHTML = "Volgende vraag";
			quizElms[i].removeAttribute("onclick");
			quizElms[i].addEventListener("click", () => {
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
			});
			continue;
		}
		quizElms[i].style.display = "none";
	}
	quizWindow.querySelector("p#answer").style.display = "block";
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