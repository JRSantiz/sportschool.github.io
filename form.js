/* ==========================================================================
   form.js — проверка формы обратной связи и формы записи на пробное занятие.
   Используются собственные проверки полей и встроенная валидация HTML5
   (атрибуты required, type="email", minlength, pattern).
   ========================================================================== */

var PHONE_PATTERN = /^\+7\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
var NAME_PATTERN = /^[А-Яа-яЁё\s-]{2,50}$/;

function setFieldError(input, message) {
    var holder = input.parentNode.querySelector(".field-error");
    if (holder) {
        holder.textContent = message;
    }
    if (message) {
        input.classList.add("has-error");
        input.setAttribute("aria-invalid", "true");
    } else {
        input.classList.remove("has-error");
        input.removeAttribute("aria-invalid");
    }
}

/* Проверка одного поля: возвращает текст ошибки или пустую строку */
function validateField(input) {
    var value = input.value.trim();

    if (input.hasAttribute("required") && value === "") {
        return "Заполните это поле";
    }
    if (value === "") {
        return "";
    }
    if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/.test(value)) {
        return "Укажите корректный адрес электронной почты";
    }
    if (input.type === "tel" && !PHONE_PATTERN.test(value)) {
        return "Телефон в формате +7 (999) 123-45-67";
    }
    if (input.dataset.role === "name" && !NAME_PATTERN.test(value)) {
        return "Укажите имя буквами, не короче 2 символов";
    }
    if (input.type === "number") {
        var num = parseInt(value, 10);
        var min = parseInt(input.getAttribute("min") || "0", 10);
        var max = parseInt(input.getAttribute("max") || "999", 10);
        if (isNaN(num) || num < min || num > max) {
            return "Значение должно быть от " + min + " до " + max;
        }
    }
    if (input.hasAttribute("minlength") && value.length < parseInt(input.getAttribute("minlength"), 10)) {
        return "Минимум " + input.getAttribute("minlength") + " символов";
    }
    return "";
}

/* Общая проверка формы всех полей */
function validateForm(form) {
    var inputs = form.querySelectorAll("input, textarea, select");
    var firstInvalid = null;

    for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        if (input.type === "checkbox" || input.type === "radio" || input.type === "hidden") {
            continue;
        }
        var error = validateField(input);
        setFieldError(input, error);
        if (error && !firstInvalid) {
            firstInvalid = input;
        }
    }

    /* Проверка обязательного чекбокса согласия */
    var agree = form.querySelector("[data-require-check]");
    if (agree && !agree.checked) {
        var agreeBox = agree.closest(".choice-wrap");
        if (agreeBox) {
            var msg = agreeBox.querySelector(".field-error");
            if (msg) {
                msg.textContent = "Необходимо согласие на обработку данных";
            }
        }
        if (!firstInvalid) {
            firstInvalid = agree;
        }
    }

    return firstInvalid;
}

function showFormMessage(box, type, text) {
    if (!box) {
        return;
    }
    box.className = "form-message " + type + " show";
    box.innerHTML = text;
}

/* ------------------------------------------------ Форма обратной связи --- */
function initFeedbackForm() {
    var form = document.getElementById("feedback-form");
    if (!form) {
        return;
    }

    var messageBox = document.getElementById("feedback-message");

    var inputs = form.querySelectorAll("input, textarea, select");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("blur", function () {
            setFieldError(this, validateField(this));
        });
        inputs[i].addEventListener("input", function () {
            if (this.classList.contains("has-error")) {
                setFieldError(this, validateField(this));
            }
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var invalid = validateForm(form);
        if (invalid) {
            showFormMessage(messageBox, "err",
                "Проверьте отмеченные поля: в форме есть ошибки заполнения.");
            invalid.focus();
            return;
        }

        var data = {
            name: form.querySelector("#name").value.trim(),
            email: form.querySelector("#email").value.trim(),
            phone: form.querySelector("#phone").value.trim(),
            topic: form.querySelector("#topic").value,
            message: form.querySelector("#message").value.trim()
        };

        var ticket = "ОБ-" + String(Date.now()).slice(-6);

        showFormMessage(messageBox, "ok",
            "<strong>Спасибо, " + escapeHtml(data.name) + "!</strong><br>" +
            "Ваше обращение зарегистрировано под номером <strong>" + ticket + "</strong>.<br>" +
            "Администратор школы ответит на адрес " + escapeHtml(data.email) +
            " в течение рабочего дня.<br>" +
            "<span class=\"hint\">Тема обращения: " + escapeHtml(topicName(data.topic)) + "</span>");

        form.reset();
        for (var j = 0; j < inputs.length; j++) {
            setFieldError(inputs[j], "");
        }
        messageBox.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

function topicName(value) {
    var names = {
        "trial": "запись на пробное занятие",
        "price": "уточнение стоимости",
        "groups": "набор в группы",
        "certificate": "справки и документы",
        "other": "другой вопрос"
    };
    return names[value] || "другой вопрос";
}

/* ------------------------------------- Форма записи на консультацию --- */
function initBookingForm() {
    var form = document.getElementById("booking-form");
    if (!form) {
        return;
    }

    var messageBox = document.getElementById("booking-message");

    var inputs = form.querySelectorAll("input, textarea, select");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("blur", function () {
            setFieldError(this, validateField(this));
        });
    }

    /* Согласие на обработку персональных данных */
    var agree = form.querySelector("[data-require-check]");
    if (agree) {
        agree.addEventListener("change", function () {
            if (this.checked) {
                var wrap = this.closest(".choice-wrap");
                var msg = wrap ? wrap.querySelector(".field-error") : null;
                if (msg) {
                    msg.textContent = "";
                }
            }
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var invalid = validateForm(form);
        if (invalid) {
            showFormMessage(messageBox, "err",
                "Форма не отправлена — проверьте обязательные поля.");
            invalid.focus();
            return;
        }

        var childName = form.querySelector("#child-name").value.trim();
        var program = form.querySelector("#child-program").value;

        showFormMessage(messageBox, "ok",
            "<strong>Заявка отправлена!</strong><br>" +
            "Мы записали " + escapeHtml(childName) + " на занятие по направлению " +
            "<strong>" + escapeHtml(program) + "</strong>.<br>" +
            "Администратор позвонит по номеру " +
            escapeHtml(form.querySelector("#child-phone").value.trim()) + ".");

        form.reset();
        for (var j = 0; j < inputs.length; j++) {
            setFieldError(inputs[j], "");
        }
        messageBox.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

/* Экранирование пользовательского текста перед вставкой в innerHTML */
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
