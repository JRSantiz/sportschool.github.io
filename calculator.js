/* ==========================================================================
   calculator.js — калькуляторы.
   1) calc-price  — расчёт стоимости обучения по направлениям из массива catalog.
   2) calc-basic  — арифметический калькулятор (+, −, ×, ÷).
   Использованы операторы: if-else, switch, for, while.
   ========================================================================== */

/* ====================================================================== */
/*  1. Калькулятор стоимости обучения                                      */
/* ====================================================================== */

/* Массив истории вычислений (объекты) */
var priceHistory = [];

function initPriceCalculator() {
    var form = document.getElementById("calc-price-form");
    if (!form) {
        return;
    }

    var programSelect = document.getElementById("calc-program");
    var monthsInput = document.getElementById("calc-months");
    var monthsRange = document.getElementById("calc-months-range");
    var discountInput = document.getElementById("calc-discount");
    var actionSelect = document.getElementById("calc-action");
    var resultBox = document.getElementById("calc-price-result");
    var errorBox = document.getElementById("calc-price-error");
    var listBox = document.getElementById("calc-price-history");
    var moreBtn = document.getElementById("calc-price-more");

    /* Заполняем список направлений из массива объектов catalog */
    for (var i = 0; i < catalog.length; i++) {
        var option = document.createElement("option");
        option.value = String(catalog[i].id);
        option.textContent = catalog[i].name + " — " + formatPrice(catalog[i].price) + " в месяц";
        programSelect.appendChild(option);
    }
    programSelect.value = "1";

    /* Ползунок и поле «Количество месяцев» связаны между собой */
    if (monthsRange && monthsInput) {
        monthsRange.addEventListener("input", function () {
            monthsInput.value = monthsRange.value;
        });
        monthsInput.addEventListener("input", function () {
            var v = parseInt(monthsInput.value, 10);
            if (!isNaN(v) && v >= 1 && v <= 24) {
                monthsRange.value = String(v);
            }
        });
    }

    /* Расчёт стоимости по нажатию кнопки */
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        calculatePrice();
    });

    /* Цикл while — повторяем расчёт, пока пользователь подтверждает */
    if (moreBtn) {
        moreBtn.addEventListener("click", function () {
            var again = window.confirm("Выполнить ещё один расчёт?");
            while (again) {
                calculatePrice();
                again = window.confirm("Выполнить ещё один расчёт?");
            }
        });
    }

    function calculatePrice() {
        var programId = parseInt(programSelect.value, 10);
        var months = parseInt(monthsInput.value, 10);
        var discount = parseInt(discountInput.value, 10);
        var action = actionSelect.value;
        var result = 0;
        var label = "";

        /* Проверка ввода условным оператором if-else */
        if (isNaN(months) || months < 1 || months > 24) {
            errorBox.textContent = "Укажите количество месяцев от 1 до 24";
            return;
        } else if (isNaN(discount) || discount < 0 || discount > 100) {
            errorBox.textContent = "Укажите скидку от 0 до 100 процентов";
            return;
        } else if (isNaN(programId)) {
            errorBox.textContent = "Выберите направление для расчёта";
            return;
        } else {
            errorBox.textContent = "";
        }

        var program = findProgram(programId);
        if (!program) {
            errorBox.textContent = "Направление не найдено";
            return;
        }

        var base = program.price;
        var withDiscount = base * months * (100 - discount) / 100;

        /* Оператор switch — выбор вида расчёта */
        switch (action) {
            case "total":
                result = base * months;
                label = "Стоимость " + months + " мес.";
                break;
            case "total-discount":
                result = withDiscount;
                label = "С учётом скидки " + discount + "% за " + months + " мес.";
                break;
            case "per-month":
                result = withDiscount / months;
                label = "В среднем за 1 месяц";
                break;
            case "lessons":
                result = withDiscount * 4;
                label = "Стоимость занятий (4 раза в месяц)";
                break;
            case "per-lesson":
                result = withDiscount / (months * 4);
                label = "Стоимость одного занятия";
                break;
            default:
                result = 0;
                label = "Неизвестный вид расчёта";
        }

        var rounded = Math.round(result);
        resultBox.textContent = formatPrice(rounded);
        document.getElementById("calc-price-label").textContent = label;

        /* Сохраняем результат в массив истории */
        priceHistory.push({
            program: program.name,
            text: label + ": " + formatPrice(rounded),
            value: rounded
        });

        renderPriceHistory();
    }

    /* Цикл for — вывод массива истории в список */
    function renderPriceHistory() {
        if (!listBox) {
            return;
        }
        listBox.innerHTML = "";
        if (priceHistory.length === 0) {
            var empty = document.createElement("li");
            empty.className = "history-empty";
            empty.textContent = "История пока пуста";
            listBox.appendChild(empty);
            return;
        }
        for (var i = priceHistory.length - 1; i >= 0; i--) {
            var li = document.createElement("li");
            var name = document.createElement("span");
            name.textContent = priceHistory[i].program;
            var val = document.createElement("strong");
            val.textContent = priceHistory[i].text;
            li.appendChild(name);
            li.appendChild(val);
            listBox.appendChild(li);
        }
    }

    renderPriceHistory();
}

/* ====================================================================== */
/*  2. Арифметический калькулятор                                         */
/* ====================================================================== */

var calcHistory = [];

function calculate() {
    var a = parseFloat(document.getElementById("num1").value);
    var b = parseFloat(document.getElementById("num2").value);
    var op = document.getElementById("operation").value;
    var result;

    /* Проверка корректности введённых значений */
    if (isNaN(a) || isNaN(b)) {
        showCalcError("Введите числа");
        return;
    }
    if (op === "/" && b === 0) {
        showCalcError("Делить на ноль нельзя");
        return;
    }
    if (op === "mod" && b === 0) {
        showCalcError("Нельзя делить на ноль");
        return;
    }
    showCalcError("");

    /* Оператор switch — выбор арифметического действия */
    switch (op) {
        case "+": result = a + b; break;
        case "-": result = a - b; break;
        case "*": result = a * b; break;
        case "/": result = a / b; break;
        case "mod": result = a % b; break;
        case "pow": result = Math.pow(a, b); break;
        default: result = 0;
    }

    if (!isFinite(result)) {
        showCalcError("Результат слишком большой");
        return;
    }

    document.getElementById("calcResult").innerHTML = formatResult(result);
    document.getElementById("calcExpression").textContent =
        a + " " + opSymbol(op) + " " + b + " = " + formatResult(result);

    var item = a + " " + op + " " + b + " = " + result;
    calcHistory.push(item);

    var list = document.getElementById("historyList");
    list.innerHTML = "";

    /* Цикл for — перебор массива истории и вывод всех записей */
    for (var i = 0; i < calcHistory.length; i++) {
        var li = document.createElement("li");
        li.textContent = calcHistory[i];
        list.appendChild(li);
    }
}

/* Символ операции для читаемой записи выражения */
function opSymbol(op) {
    var symbols = { "+": "+", "-": "−", "*": "×", "/": "÷", "mod": "%", "pow": "^" };
    return symbols[op] || op;
}

/* Красивое число: целые — без дробной части, дробные — с двумя знаками */
function formatResult(value) {
    if (Number.isInteger(value)) {
        return String(value);
    }
    return value.toFixed(2);
}

function showCalcError(message) {
    var box = document.getElementById("calc-error");
    if (box) {
        box.textContent = message;
    }
}

function initBasicCalculator() {
    var form = document.getElementById("calc-form");
    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        calculate();
    });

    var clearBtn = document.getElementById("calc-clear");
    if (clearBtn) {
        clearBtn.addEventListener("click", function () {
            calcHistory = [];
            document.getElementById("historyList").innerHTML =
                "<li class=\"history-empty\">История пока пуста</li>";
            document.getElementById("calcResult").textContent = "0";
            document.getElementById("calcExpression").textContent = "";
            showCalcError("");
        });
    }

    var againBtn = document.getElementById("calc-again");
    if (againBtn) {
        againBtn.addEventListener("click", function () {
            /* Цикл while — повторяем расчёты, пока пользователь подтверждает */
            var continueCalc = window.confirm("Продолжить вычисления?");
            while (continueCalc) {
                calculate();
                document.getElementById("num1").focus();
                continueCalc = window.confirm("Продолжить вычисления?");
            }
        });
    }
}
