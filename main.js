/* ==========================================================================
   main.js — инициализация сайта: сначала отрисовка динамических блоков,
   затем подключение обработчиков. Файл подключается последним.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    /* 1. Отрисовка данных из массивов объектов */
    renderSportCards();
    renderCoaches();
    renderPromotions();
    renderCatalog();
    fillProgramSelects();
    renderGreeting();

    /* 2. Инициализация модулей */
    initTheme();
    initNavToggle();
    initActiveNav();
    initToTop();
    initCanvas();
    initCanvasSound();
    initPriceCalculator();
    initBasicCalculator();
    initFeedbackForm();
    initBookingForm();
    initGalleryFilters();
    initPrintButtons();

    /* 3. Корзина инициализируется последней, когда все кнопки уже в DOM */
    initCart();

    /* 4. Подсказка формируется после загрузки корзины */
    initStorageNote();
});

/* --------------------------------------- Динамическая отрисовка секций --- */

/* Карточки направлений на главной странице */
function renderSportCards() {
    var grid = document.getElementById("sport-grid");
    if (!grid) {
        return;
    }
    grid.innerHTML = "";

    for (var i = 0; i < catalog.length; i++) {
        grid.appendChild(buildSportCard(catalog[i]));
    }
}

function buildSportCard(program) {
    var article = document.createElement("article");
    article.className = "sport-card";

    var img = document.createElement("img");
    img.src = program.img;
    img.alt = "Иконка направления «" + program.name + "»";
    img.width = 96;
    img.height = 96;
    article.appendChild(img);

    var title = document.createElement("h3");
    title.textContent = program.name;
    article.appendChild(title);

    var desc = document.createElement("p");
    desc.textContent = program.desc;
    article.appendChild(desc);

    var meta = document.createElement("div");
    meta.className = "sport-meta";

    var age = document.createElement("span");
    age.textContent = program.age;
    meta.appendChild(age);

    var price = document.createElement("strong");
    price.textContent = formatPrice(program.price);
    price.style.color = "var(--color-primary-dark)";
    meta.appendChild(price);

    article.appendChild(meta);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-small";
    button.textContent = "В заявку";
    button.setAttribute("data-add-to-cart", String(program.id));
    article.appendChild(button);

    return article;
}

/* Карточки тренеров */
function renderCoaches() {
    var grid = document.getElementById("coach-grid");
    if (!grid) {
        return;
    }
    grid.innerHTML = "";

    for (var i = 0; i < coaches.length; i++) {
        var coach = coaches[i];
        var article = document.createElement("article");
        article.className = "coach-card";

        var img = document.createElement("img");
        img.src = coach.img;
        img.alt = "Фото тренера " + coach.name;
        img.width = 120;
        img.height = 120;
        article.appendChild(img);

        var name = document.createElement("h3");
        name.textContent = coach.name;
        article.appendChild(name);

        var role = document.createElement("p");
        role.className = "coach-role";
        role.textContent = coach.role;
        article.appendChild(role);

        var text = document.createElement("p");
        text.textContent = coach.text;
        article.appendChild(text);

        var exp = document.createElement("p");
        exp.style.marginTop = "10px";
        exp.style.fontWeight = "700";
        exp.style.color = "var(--color-primary)";
        exp.textContent = "Стаж: " + coach.exp + " лет";
        article.appendChild(exp);

        grid.appendChild(article);
    }
}

/* Промо-предложения в боковой панели <aside> */
function renderPromotions() {
    var list = document.getElementById("promo-list");
    if (!list) {
        return;
    }
    list.innerHTML = "";

    for (var i = 0; i < promotions.length; i++) {
        var item = document.createElement("li");

        var title = document.createElement("strong");
        title.textContent = promotions[i].title;
        item.appendChild(title);

        var text = document.createElement("span");
        text.textContent = promotions[i].text;
        item.appendChild(text);

        list.appendChild(item);
    }
}

/* Каталог направлений на странице catalog.html */
function renderCatalog() {
    var list = document.getElementById("product-list");
    if (!list) {
        return;
    }
    list.innerHTML = "";

    for (var i = 0; i < catalog.length; i++) {
        list.appendChild(buildProductCard(catalog[i]));
    }
}

function buildProductCard(program) {
    var article = document.createElement("article");
    article.className = "product-card";

    var img = document.createElement("img");
    img.src = program.img;
    img.alt = "Иконка направления «" + program.name + "»";
    img.width = 96;
    img.height = 96;
    article.appendChild(img);

    var body = document.createElement("div");

    var title = document.createElement("h2");
    title.className = "product-title";
    title.textContent = program.name;
    body.appendChild(title);

    var desc = document.createElement("p");
    desc.className = "product-desc";
    desc.textContent = program.desc;
    body.appendChild(desc);

    var tags = document.createElement("div");
    tags.className = "tag-row";

    var tagAge = document.createElement("span");
    tagAge.className = "tag";
    tagAge.textContent = program.age;
    tags.appendChild(tagAge);

    var tagTime = document.createElement("span");
    tagTime.className = "tag";
    tagTime.textContent = program.duration;
    tags.appendChild(tagTime);

    var tagLevel = document.createElement("span");
    tagLevel.className = "tag tag-accent";
    tagLevel.textContent = program.level;
    tags.appendChild(tagLevel);

    body.appendChild(tags);

    var coachLine = document.createElement("p");
    coachLine.className = "product-desc";
    coachLine.style.marginTop = "8px";
    coachLine.textContent = "Тренер: " + program.coach;
    body.appendChild(coachLine);

    article.appendChild(body);

    var buy = document.createElement("div");
    buy.className = "product-buy";

    var price = document.createElement("div");
    price.className = "price";
    price.textContent = formatPrice(program.price);
    var small = document.createElement("small");
    small.textContent = "в месяц";
    price.appendChild(small);
    buy.appendChild(price);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-small";
    button.textContent = "В заявку";
    button.setAttribute("data-add-to-cart", String(program.id));
    buy.appendChild(button);

    article.appendChild(buy);

    return article;
}

/* Заполнение списков направлений в формах записи */
function fillProgramSelects() {
    var selects = document.querySelectorAll("select[data-program-select]");
    for (var s = 0; s < selects.length; s++) {
        var select = selects[s];
        for (var i = 0; i < catalog.length; i++) {
            var option = document.createElement("option");
            option.value = catalog[i].name;
            option.textContent = catalog[i].name;
            select.appendChild(option);
        }
    }
}

/* Приветствие объекта «Пользователь» */
function renderGreeting() {
    var box = document.getElementById("user-greeting");
    if (box) {
        box.textContent = user.sayHello();
    }
}

/* ------------------------------------------------ Фильтр галереи --- */
function initGalleryFilters() {
    var buttons = document.querySelectorAll("[data-filter]");
    if (buttons.length === 0) {
        return;
    }

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
            var value = this.getAttribute("data-filter");
            var all = document.querySelectorAll("[data-category]");

            for (var j = 0; j < all.length; j++) {
                var item = all[j];
                var show = value === "all" || item.getAttribute("data-category") === value;
                item.style.display = show ? "block" : "none";
            }

            for (var k = 0; k < buttons.length; k++) {
                buttons[k].classList.toggle("active", buttons[k] === this);
            }
        });
    }
}

/* ---------------------------------------------------- Кнопки печати --- */
function initPrintButtons() {
    var buttons = document.querySelectorAll("[data-print]");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
            window.print();
        });
    }
}

/* ------------------------------- Подсказка о сохранении настроек темы --- */
function initStorageNote() {
    var note = document.getElementById("storage-note");
    if (!note) {
        return;
    }

    /* На странице заявки поясняем, что сохраняется именно корзина */
    if (note.getAttribute("data-note-kind") === "cart") {
        var count = cartCount();
        note.textContent = count > 0
            ? "Состав заявки сохраняется в локальном хранилище браузера: " +
              "выбранные направления и срок не пропадают после перезагрузки страницы."
            : "Данные заявки сохраняются в локальном хранилище браузера и не пропадают " +
              "после перезагрузки страницы.";
        return;
    }

    var saved = storage.get(THEME_KEY, null);
    if (saved && THEME_NAMES[saved]) {
        note.textContent = "Выбранная тема оформления («" + THEME_NAMES[saved] +
            "») сохраняется в локальном хранилище браузера и восстанавливается " +
            "при следующем открытии сайта.";
    } else {
        note.textContent = "Выбранная тема оформления сохраняется в локальном " +
            "хранилище браузера автоматически.";
    }
}
