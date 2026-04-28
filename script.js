// SIDEBAR
document.getElementById("toggleBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
});

// SUBMENUS
document.querySelectorAll(".has-submenu").forEach(item => {
    item.addEventListener("click", function (e) {
        e.stopPropagation();
        this.classList.toggle("active");
    });
});

// MATHQUILL
var MQ = MathQuill.getInterface(2);

var mathField = MQ.MathField(document.getElementById("math-field"), {
    handlers: {
        edit: function () {
            let latex = mathField.latex();

            document.getElementById("latex-output").textContent = latex;

            document.getElementById("math-preview").innerHTML = `\\(${latex}\\)`;
            MathJax.typeset();
        }
    }
});

// BOTONES
function insertCmd(cmd) {
    mathField.cmd(cmd);
    mathField.focus();
}

function insertText(text) {
    mathField.write(text);
    mathField.focus();
}

function clearMath() {
    mathField.latex('');
}