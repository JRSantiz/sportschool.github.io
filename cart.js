/* ==========================================================================
   cart.js — корзина заявки на зачисление в спортивную школу.
   Корзина — массив cart, где каждая запись является объектом
   со свойствами id, name, price, quantity, img.
   Функции: addToCart, updateQuantity, removeFromCart, clearCart, checkout.
   ========================================================================== */

/* Корзина — массив объектов */
var cart = [];

/* Загрузка корзины из локального хранилища */
function loadCart() {
    var saved = storage.get(CART_KEY, []);
    if (Object.prototype.toString.call(saved) === "[object Array]") {
        cart = saved;
    } else {
        cart = [];
    }
}

/* Сохранение корзины в локальном хранилище */
function saveCart() {
    storage.set(CART_KEY, cart);
}

/* Поиск товара в корзине */
function findCartItem(id) {
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
            return cart[i];
        }
    }
    return null;
}

/* Добавление товара в корзину */
function addToCart(id) {
    var selected = findProgram(id);
    if (!selected) {
        return;
    }

    var existing = findCartItem(id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: selected.id,
            name: selected.name,
            price: selected.price,
            quantity: 1,
            img: selected.img,
            coach: selected.coach
        });
    }
    saveCart();
    updateCartBadge();
    showToast("«" + selected.name + "» добавлено в заявку");
}

/* Изменение количества месяцев */
function updateQuantity(id, delta) {
    var item = findCartItem(id);
    if (!item) {
        return;
    }

    item.quantity += delta;

    /* Количество месяцев не может быть меньше одного */
    if (item.quantity < 1) {
        removeFromCart(id);
        return;
    }
    if (item.quantity > 24) {
        item.quantity = 24;
        showToast("Максимальный срок абонемента — 24 месяца");
    }

    saveCart();
    renderCart();
    updateCartBadge();
}

/* Удаление позиции из корзины */
function removeFromCart(id) {
    var item = findCartItem(id);
    cart = cart.filter(function (entry) {
        return entry.id !== id;
    });
    saveCart();
    renderCart();
    updateCartBadge();
    if (item) {
        showToast("«" + item.name + "» удалено из заявки");
    }
}

/* Полная очистка корзины */
function clearCart() {
    cart = [];
    saveCart();
    renderCart();
    updateCartBadge();
    showToast("Заявка очищена");
}

/* Оформление заявки */
function checkout() {
    if (cart.length === 0) {
        showToast("Заявка пуста — добавьте хотя бы одно направление");
        return;
    }

    var total = cartTotal();
    var list = cart.map(function (entry) {
        return entry.name + " — " + entry.quantity + " мес.";
    }).join("; ");

    var answer = window.confirm(
        "Оформить заявку на зачисление?\n\n" + list +
        "\n\nИтого к оплате: " + formatPrice(total) +
        "\n\nАдминистратор школы свяжется с вами в течение рабочего дня."
    );

    if (answer) {
        var number = "З-" + String(Date.now()).slice(-6);
        var box = document.getElementById("checkout-result");
        if (box) {
            box.className = "form-message ok show";
            box.innerHTML =
                "<strong>Заявка №" + number + " принята.</strong><br>" +
                "Сумма к оплате: " + formatPrice(total) + ".<br>" +
                "Ждём звонка администратора в рабочее время " +
                "с 09:00 до 18:00.";
        }
        clearCart();
        var form = document.getElementById("checkout-form");
        if (form) {
            form.reset();
        }
    }
}

/* Общая сумма корзины */
function cartTotal() {
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].quantity;
    }
    return total;
}

/* Общее количество месяцев во всех позициях */
function cartCount() {
    var count = 0;
    for (var i = 0; i < cart.length; i++) {
        count += cart[i].quantity;
    }
    return count;
}

/* Обновление счётчика в шапке и в меню */
function updateCartBadge() {
    var count = cartCount();
    var badges = document.querySelectorAll(".badge-counter");
    for (var i = 0; i < badges.length; i++) {
        badges[i].textContent = String(count);
        badges[i].style.display = count > 0 ? "inline-block" : "none";
    }
}

/* Всплывающее уведомление */
function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) {
        return;
    }
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () {
        toast.classList.remove("show");
    }, 2600);
}

/* Отрисовка корзины (вывод данных циклом и innerHTML) */
function renderCart() {
    var list = document.getElementById("cart-list");
    var empty = document.getElementById("cart-empty");
    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (cart.length === 0) {
        if (empty) {
            empty.style.display = "block";
        }
        list.style.display = "none";
        renderSummary();
        return;
    }

    if (empty) {
        empty.style.display = "none";
    }
    list.style.display = "grid";

    for (var i = 0; i < cart.length; i++) {
        var entry = cart[i];
        var li = document.createElement("li");
        li.className = "cart-item";

        var img = document.createElement("img");
        img.src = entry.img;
        img.alt = entry.name;
        li.appendChild(img);

        var info = document.createElement("div");

        var title = document.createElement("h3");
        title.textContent = entry.name;
        info.appendChild(title);

        var meta = document.createElement("p");
        meta.textContent = formatPrice(entry.price) + " в месяц · " + entry.coach;
        info.appendChild(meta);

        var qty = document.createElement("div");
        qty.className = "qty-control";

        var minus = document.createElement("button");
        minus.type = "button";
        minus.className = "qty-btn";
        minus.textContent = "−";
        minus.setAttribute("aria-label", "Уменьшить количество месяцев");
        minus.setAttribute("data-action", "dec");
        minus.setAttribute("data-id", String(entry.id));
        qty.appendChild(minus);

        var value = document.createElement("span");
        value.className = "qty-value";
        value.textContent = entry.quantity + " мес.";
        qty.appendChild(value);

        var plus = document.createElement("button");
        plus.type = "button";
        plus.className = "qty-btn";
        plus.textContent = "+";
        plus.setAttribute("aria-label", "Увеличить количество месяцев");
        plus.setAttribute("data-action", "inc");
        plus.setAttribute("data-id", String(entry.id));
        qty.appendChild(plus);

        info.appendChild(qty);
        li.appendChild(info);

        var actions = document.createElement("div");
        actions.className = "cart-item-actions";

        var sum = document.createElement("span");
        sum.className = "cart-item-sum";
        sum.textContent = formatPrice(entry.price * entry.quantity);
        actions.appendChild(sum);

        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "link-danger";
        remove.textContent = "Удалить";
        remove.setAttribute("data-action", "remove");
        remove.setAttribute("data-id", String(entry.id));
        actions.appendChild(remove);

        li.appendChild(actions);
        list.appendChild(li);
    }

    renderSummary();
}

/* Блок итогов заявки */
function renderSummary() {
    var totalBox = document.getElementById("summary-total");
    var countBox = document.getElementById("summary-count");
    var monthsBox = document.getElementById("summary-count-months");
    var discountBox = document.getElementById("summary-discount");
    var totalWithDiscount = document.getElementById("summary-total-discount");

    var total = cartTotal();
    var months = cartCount();

    /* Скидка 10% при оплате сразу за 3 и более месяцев */
    var discount = total >= 3000 ? Math.round(total * 0.1) : 0;

    if (totalBox) {
        totalBox.textContent = formatPrice(total);
    }
    if (countBox) {
        countBox.textContent = String(cart.length);
    }
    if (monthsBox) {
        monthsBox.textContent = String(months);
    }
    if (discountBox) {
        discountBox.textContent = discount > 0 ? "−" + formatPrice(discount) : "—";
    }
    if (totalWithDiscount) {
        totalWithDiscount.textContent = formatPrice(total - discount);
    }

    var checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

/* Инициализация корзины на любой странице */
function initCart() {
    loadCart();

    /* Кнопки «В заявку» в каталоге и на главной странице */
    var addButtons = document.querySelectorAll("[data-add-to-cart]");
    for (var i = 0; i < addButtons.length; i++) {
        addButtons[i].addEventListener("click", function (event) {
            var id = parseInt(this.getAttribute("data-add-to-cart"), 10);
            addToCart(id);
        });
    }

    /* Список корзины: делегирование событий для +/- и «удалить» */
    var list = document.getElementById("cart-list");
    if (list) {
        list.addEventListener("click", function (event) {
            var target = event.target;
            var action = target.getAttribute("data-action");
            if (!action) {
                return;
            }
            var id = parseInt(target.getAttribute("data-id"), 10);
            if (action === "inc") {
                updateQuantity(id, 1);
            } else if (action === "dec") {
                updateQuantity(id, -1);
            } else if (action === "remove") {
                removeFromCart(id);
            }
        });
    }

    var clearBtn = document.getElementById("clear-cart");
    if (clearBtn) {
        clearBtn.addEventListener("click", function () {
            if (window.confirm("Очистить заявку полностью?")) {
                clearCart();
            }
        });
    }

    var checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", checkout);
    }

    renderCart();
    updateCartBadge();
}
