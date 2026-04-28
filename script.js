// SIDEBAR
document.getElementById("toggleBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
});

// SUBMENUS (ACORDEÓN)
document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", function (e) {

        let parent = this.parentElement;

        if (!parent.classList.contains("has-submenu")) return;

        e.stopPropagation();

        // Cerrar otros al mismo nivel
        let siblings = parent.parentElement.querySelectorAll(":scope > .has-submenu");
        siblings.forEach(el => {
            if (el !== parent) {
                el.classList.remove("active");
            }
        });

        // Toggle actual
        parent.classList.toggle("active");
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
