// =====================
// VARIABLES GLOBALES
// =====================
let grafica = null;
let cientifica = null;
let metodoActual = null;

// =====================
// TABLA DINÁMICA
// =====================
function crearTabla(tipo) {

    const thead = document.querySelector("#tabla-iteraciones thead");
    const tbody = document.querySelector("#tabla-iteraciones tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    let columnas = [];

    switch (tipo) {
        case "biseccion":
            columnas = ["Iteración","a","c","b","f(a)","f(c)","f(b)","f(a)*f(b)","Ea","Er%"];
            break;

        case "reglaFalsa":
            columnas = ["Iteración","a","b","f(a)","f(b)","f(a)*f(b)","c","f(c)","Er%"];
            break;

        case "newton":
            columnas = ["Iteración","xi","f(xi)","f'(xi)","Er%"];
            break;

        case "secante":
            columnas = ["Iteración","xi-1","xi","f(xi-1)","f(xi)","xi+1","Er%"];
            break;
    }

    let fila = "<tr>";
    columnas.forEach(col => fila += `<th>${col}</th>`);
    fila += "</tr>";

    thead.innerHTML = fila;
}

// =====================
// INPUTS DINÁMICOS
// =====================
function mostrarInputs(tipo) {

    const grupoA = document.getElementById("input-a-group");
    const grupoB = document.getElementById("input-b-group");
    const grupoX0 = document.getElementById("input-x0-group");

    grupoA.style.display = "none";
    grupoB.style.display = "none";
    grupoX0.style.display = "none";

    if (tipo === "biseccion" || tipo === "reglaFalsa") {
        grupoA.style.display = "block";
        grupoB.style.display = "block";
    }

    if (tipo === "newton") {
        grupoX0.style.display = "block";
    }

    if (tipo === "secante") {
        grupoA.style.display = "block";
        grupoB.style.display = "block";

        document.querySelector("#input-a-group label").innerText = "x₀:";
        document.querySelector("#input-b-group label").innerText = "x₁:";
    } else {
        document.querySelector("#input-a-group label").innerText = "a:";
        document.querySelector("#input-b-group label").innerText = "b:";
    }
}

// =====================
// BOTONES MÉTODO
// =====================
document.querySelectorAll(".metodo-btn").forEach(btn => {
    btn.addEventListener("click", function () {

        let tipo = this.dataset.metodo;
        metodoActual = tipo;

        crearTabla(tipo);
        mostrarInputs(tipo);

        document.querySelectorAll(".metodo-btn").forEach(b => b.classList.remove("activo"));
        this.classList.add("activo");
    });
});

// =====================
// DESMOS
// =====================
window.addEventListener("load", function () {

    grafica = Desmos.GraphingCalculator(
        document.getElementById("grafica"),
        {
            keypad: false,
            expressions: false,
            settingsMenu: false
        }
    );

    cientifica = Desmos.ScientificCalculator(
        document.getElementById("cientifica")
    );

    cientifica.observeEvent('change', function () {

        let estado = cientifica.getState();

        if (estado.expressions && estado.expressions.list.length > 0) {
            let latex = estado.expressions.list[0].latex;

            if (latex && latex.includes("x")) {
                grafica.setExpression({
                    id: 'funcion',
                    latex: latex
                });
            }
        }
    });
});

// =====================
// LATEX → JS
// =====================
function convertirLatexAJS(latex) {

    let expr = latex;

    expr = expr.replace(/\\left|\\right/g, '');
    expr = expr.replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)');
    expr = expr.replace(/\\sqrt{([^}]*)}/g, 'Math.sqrt($1)');
    expr = expr.replace(/e\^{([^}]*)}/g, 'Math.exp($1)');

    expr = expr.replace(/\\sin/g, 'Math.sin');
    expr = expr.replace(/\\cos/g, 'Math.cos');
    expr = expr.replace(/\\tan/g, 'Math.tan');
    expr = expr.replace(/\\ln/g, 'Math.log');

    expr = expr.replace(/\^/g, '**');
    expr = expr.replace(/(\d)(x)/g, '$1*$2');

    return expr;
}

// =====================
// EVALUAR FUNCIÓN
// =====================
function evaluarFuncion(expr, x) {
    try {
        return Function("x", "return " + expr)(x);
    } catch {
        return NaN;
    }
}

// =====================
// DERIVADA NUMÉRICA
// =====================
function derivadaNumerica(expr, x) {
    let h = 1e-6;
    return (evaluarFuncion(expr, x + h) - evaluarFuncion(expr, x - h)) / (2 * h);
}

// =====================
// BISECCIÓN
// =====================
function metodoBiseccion(latex, a, b) {

    const tbody = document.querySelector("#tabla-iteraciones tbody");
    const resultado = document.getElementById("resultado-text");

    tbody.innerHTML = "";

    let expr = convertirLatexAJS(latex);
    let fa = evaluarFuncion(expr, a);
    let fb = evaluarFuncion(expr, b);

    let c, fc;

    for (let i = 1; i <= 50; i++) {

        let c_old = c;
        c = (a + b) / 2;
        fc = evaluarFuncion(expr, c);

        let fab = fa * fb;
        let error = i === 1 ? "-" : Math.abs((c - c_old) / c) * 100;

        tbody.innerHTML += `
        <tr>
            <td>${i}</td>
            <td>${a.toFixed(6)}</td>
            <td>${c.toFixed(6)}</td>
            <td>${b.toFixed(6)}</td>
            <td>${fa.toFixed(6)}</td>
            <td>${fc.toFixed(6)}</td>
            <td>${fb.toFixed(6)}</td>
            <td>${fab.toFixed(6)}</td>
            <td>${i === 1 ? "-" : Math.abs(c - c_old).toFixed(6)}</td>
            <td>${i === 1 ? "-" : error.toFixed(4)}</td>
        </tr>
        `;

        if (Math.abs(fc) < 1e-6) break;

        if (fa * fc < 0) {
            b = c; fb = fc;
        } else {
            a = c; fa = fc;
        }
    }

    resultado.innerText = `Raíz ≈ ${c.toFixed(6)}`;
}

// =====================
// REGLA FALSA
// =====================
function metodoReglaFalsa(latex, a, b) {

    const tbody = document.querySelector("#tabla-iteraciones tbody");
    const resultado = document.getElementById("resultado-text");

    tbody.innerHTML = "";

    let expr = convertirLatexAJS(latex);
    let fa = evaluarFuncion(expr, a);
    let fb = evaluarFuncion(expr, b);

    let c, fc;

    for (let i = 1; i <= 50; i++) {

        let c_old = c;
        c = b - (fb * (a - b)) / (fa - fb);
        fc = evaluarFuncion(expr, c);

        let fab = fa * fb;
        let error = i === 1 ? "-" : Math.abs((c - c_old) / c) * 100;

        tbody.innerHTML += `
        <tr>
            <td>${i}</td>
            <td>${a.toFixed(6)}</td>
            <td>${b.toFixed(6)}</td>
            <td>${fa.toFixed(6)}</td>
            <td>${fb.toFixed(6)}</td>
            <td>${fab.toFixed(6)}</td>
            <td>${c.toFixed(6)}</td>
            <td>${fc.toFixed(6)}</td>
            <td>${i === 1 ? "-" : error.toFixed(4)}</td>
        </tr>
        `;

        if (Math.abs(fc) < 1e-6) break;

        if (fa * fc < 0) {
            b = c; fb = fc;
        } else {
            a = c; fa = fc;
        }
    }

    resultado.innerText = `Raíz ≈ ${c.toFixed(6)}`;
}

// =====================
// NEWTON
// =====================
function metodoNewton(latex, x0) {

    const tbody = document.querySelector("#tabla-iteraciones tbody");
    const resultado = document.getElementById("resultado-text");

    tbody.innerHTML = "";

    let expr = convertirLatexAJS(latex);
    let xi = x0;

    for (let i = 1; i <= 50; i++) {

        let fxi = evaluarFuncion(expr, xi);
        let dfxi = derivadaNumerica(expr, xi);

        let xi_next = xi - (fxi / dfxi);

        let error = i === 1 ? "-" : Math.abs((xi_next - xi) / xi_next) * 100;

        tbody.innerHTML += `
        <tr>
            <td>${i}</td>
            <td>${xi.toFixed(6)}</td>
            <td>${fxi.toFixed(6)}</td>
            <td>${dfxi.toFixed(6)}</td>
            <td>${i === 1 ? "-" : error.toFixed(4)}</td>
        </tr>
        `;

        if (Math.abs(fxi) < 1e-6) break;

        xi = xi_next;
    }

    resultado.innerText = `Raíz ≈ ${xi.toFixed(6)}`;
}

// =====================
// SECANTE
// =====================
function metodoSecante(latex, x0, x1) {

    const tbody = document.querySelector("#tabla-iteraciones tbody");
    const resultado = document.getElementById("resultado-text");

    tbody.innerHTML = "";

    let expr = convertirLatexAJS(latex);

    let xi_1 = x0;
    let xi = x1;

    for (let i = 1; i <= 50; i++) {

        let fxi_1 = evaluarFuncion(expr, xi_1);
        let fxi = evaluarFuncion(expr, xi);

        let xi_next = xi - (fxi * (xi - xi_1)) / (fxi - fxi_1);

        let error = i === 1 ? "-" : Math.abs((xi_next - xi) / xi_next) * 100;

        tbody.innerHTML += `
        <tr>
            <td>${i}</td>
            <td>${xi_1.toFixed(6)}</td>
            <td>${xi.toFixed(6)}</td>
            <td>${fxi_1.toFixed(6)}</td>
            <td>${fxi.toFixed(6)}</td>
            <td>${xi_next.toFixed(6)}</td>
            <td>${i === 1 ? "-" : error.toFixed(4)}</td>
        </tr>
        `;

        if (Math.abs(fxi) < 1e-6) break;

        xi_1 = xi;
        xi = xi_next;
    }

    resultado.innerText = `Raíz ≈ ${xi.toFixed(6)}`;
}

// =====================
// BOTÓN EJECUTAR
// =====================
document.getElementById("btn-iterar").addEventListener("click", () => {

    let estado = cientifica.getState();

    if (!estado.expressions || estado.expressions.list.length === 0) {
        alert("Escribe una función");
        return;
    }

    let latex = estado.expressions.list[0].latex;

    if (!latex.includes("x")) {
        alert("La función debe tener x");
        return;
    }

    if (metodoActual === "biseccion" || metodoActual === "reglaFalsa") {

        let a = parseFloat(document.getElementById("input-a").value);
        let b = parseFloat(document.getElementById("input-b").value);

        if (isNaN(a) || isNaN(b)) {
            alert("Ingresa valores válidos");
            return;
        }

        if (metodoActual === "biseccion") metodoBiseccion(latex, a, b);
        if (metodoActual === "reglaFalsa") metodoReglaFalsa(latex, a, b);
    }

    if (metodoActual === "newton") {
        let x0 = parseFloat(document.getElementById("input-x0").value);
        metodoNewton(latex, x0);
    }

    if (metodoActual === "secante") {
        let x0 = parseFloat(document.getElementById("input-a").value);
        let x1 = parseFloat(document.getElementById("input-b").value);
        metodoSecante(latex, x0, x1);
    }
});
