/* ==========================================================================
   theme.js — переключение тем оформления, мобильное меню, кнопка «вверх»
   Темы: light (светлая), dark (тёмная), blue (голубая)
   Выбранная тема сохраняется в локальном хранилище браузера.
   ========================================================================== */

var THEMES = ["light", "dark", "blue"];
var THEME_KEY = "olimp_theme";
var THEME_NAMES = {
    light: "Светлая тема",
    dark: "Тёмная тема",
    blue: "Голубая тема"
};

var currentTheme = "light";

/* Применение темы к элементу <html> и перерисовка кнопок */
function applyTheme(theme) {
    if (THEMES.indexOf(theme) === -1) {
        theme = "light";
    }
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);

    var buttons = document.querySelectorAll(".theme-btn");
    for (var i = 0; i < buttons.length; i++) {
        var isActive = buttons[i].getAttribute("data-theme-value") === theme;
        buttons[i].classList.toggle("active", isActive);
        buttons[i].setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    storage.set(THEME_KEY, theme);
}

/* Обработчик нажатия на кнопку темы */
function onThemeClick(event) {
    var value = event.currentTarget.getAttribute("data-theme-value");
    applyTheme(value);
}

/* Восстановление сохранённой темы при загрузке страницы */
function initTheme() {
    var saved = storage.get(THEME_KEY, null);
    if (typeof saved === "string") {
        applyTheme(saved);
    } else {
        applyTheme("light");
    }

    var buttons = document.querySelectorAll(".theme-btn");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", onThemeClick);
    }
}

/* ----------------------------------------------------- Мобильное меню --- */
function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");

    if (!toggle || !nav) {
        return;
    }

    if (window.matchMedia && window.matchMedia("(min-width: 769px)").matches) {
        nav.classList.remove("collapsed");
    } else {
        nav.classList.add("collapsed");
    }

    toggle.addEventListener("click", function () {
        var isHidden = nav.classList.toggle("collapsed");
        toggle.setAttribute("aria-expanded", isHidden ? "false" : "true");
    });

    /* Закрываем меню после выбора пункта на мобильном экране */
    var links = nav.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function () {
            if (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) {
                nav.classList.add("collapsed");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }
}

/* ------------------------------------------------------ Кнопка «вверх» --- */
function initToTop() {
    var button = document.querySelector(".to-top");
    if (!button) {
        return;
    }

    function onScroll() {
        if (window.pageYOffset > 400) {
            button.classList.add("show");
        } else {
            button.classList.remove("show");
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ---------------------------------- Подсветка активного пункта меню --- */
function initActiveNav() {
    var path = window.location.pathname.split("/").pop();
    if (!path) {
        path = "index.html";
    }
    var links = document.querySelectorAll(".nav-list a");
    for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute("href");
        if (href === path) {
            links[i].classList.add("active");
            links[i].setAttribute("aria-current", "page");
        }
    }
}
