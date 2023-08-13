!(function () {
    const action = {
        config: {
            dataAttrAppUrl: "data-checkout-master-url",
            dataAttrName: "data-checkout-master",
            defaultAppBaseUrl: "http://localhost:8001",
            domainPath: "/checkoutDomain",
            is_expired: false,
        },
        variables: {
            isCheckoutProcessing: false,
            isPreventDefaultHandlers: true,
            skipCheckoutSumbission: false,
        },
        cartApi: {
            clearCart: function () {
                return fetch("/cart/clear.js", { method: "POST", credentials: "same-origin" });
            },
            addToCart: function (value) {
                return fetch("/cart/add.js", { method: "POST", credentials: "same-origin", body: "FORM" === value.nodeName ? new FormData(value) : value });
            },
            updateCart: function (value) {
                return fetch("/cart/update.js", { method: "POST", credentials: "same-origin", body: JSON.stringify(value), headers: { "Content-Type": "application/json", Accept: "application/json" } });
            },
            getCart: async () => {
                return await fetch("/cart.js", { credentials: "same-origin" })
                    .then(function (res) {
                        return res.json();
                    })
                    .then(async function (event) {
                        return event;
                    });
            },
            syncCart: async () => {
                try {
                    var master_x_s = localStorage.getItem("master_x_s");

                    return (
                        master_x_s !== "undefined" &&
                        master_x_s !== undefined &&
                        master_x_s !== null &&
                        (await fetch("/cart.js", { credentials: "same-origin" })
                            .then(function (res) {
                                return res.json();
                            })
                            .then(async function (event) {
                                var products = [];
                                var shopId = action.main.shopId(),
                                    checkout_id = localStorage.getItem("master_x_s"),
                                    checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                                    url = `${checkUrl}/put-checkout/${checkout_id}/${shopId}`;

                                return (
                                    event.items.forEach(function (item) {
                                        products.push({
                                            cart_token: event.token,

                                            product_id: item.product_id,
                                            product_image: item.image,
                                            product_title: item.product_title,
                                            product_varient: item.options_with_values,

                                            variant_id: item.variant_id,
                                            variant_title: item.variant_title,

                                            grams: item.grams,

                                            quantity: item.quantity,
                                            price: item.price / 100,
                                            original_price: item.original_price / 100,
                                        });
                                    }),
                                    await fetch(url, {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Accept: "application/json, text/plain, */*",
                                        },
                                        body: JSON.stringify({
                                            line_items: products,
                                        }),
                                    })
                                        .then(function (result) {
                                            return result.json();
                                        })
                                        .then(function (response) {
                                            if (response?.checkout_uuid) {
                                                localStorage.setItem("master_x_s", response?.checkout_uuid);
                                            }
                                            return response?.status;
                                        })
                                );
                            }))
                    );
                } catch (error) {
                    console.error("cartApi syncCart error --------------", error);
                }
            },
        },
        main: {
            findCheckout: function () {
                var shopId = action.main.shopId(),
                    checkout_id = localStorage.getItem("master_x_s"),
                    checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                    url = `${checkUrl}/get-checkout/${checkout_id}/${shopId}`;

                return fetch(url, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                });
            },
            createCheckout: async () => {
                let cartToken = localStorage.getItem("cartToken");
                cartToken = cartToken || action.main.getCookie("cart");
                var shop_id = action.main.shopId(),
                    checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                    url = `${checkUrl}/create-checkout/${shop_id}`;

                return fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        cartToken: cartToken,
                    }),
                });
            },
            shopId: function () {
                var master_id = document.querySelector("[data-master-x-id]");
                return !!master_id && master_id.dataset.masterXId;
            },
            getCookie: function (name) {
                function escape(s) {
                    return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1");
                }
                var match = document.cookie.match(RegExp("(?:^|;\\s*)" + escape(name) + "=([^;]*)"));
                return match ? match[1] : null;
            },
        },
        helpers: {
            debounce: function (target, event) {
                let run = false;
                return function () {
                    run ||
                        ((run = true),
                            setTimeout(() => {
                                target.apply(this, arguments), (run = false);
                            }, event));
                };
            },
            isDescendant: (target, event) => {
                let run = event.parentNode;
                for (; null != run;) {
                    if (run == target) return true;
                    run = run.parentNode;
                }
                return false;
            },
            addCaptureListener: (element, capture, next) => {
                element.addEventListener &&
                    window.addEventListener(
                        capture,
                        (capture) => {
                            (capture.target === element || action.helpers.isDescendant(element, capture.target)) && (capture.stopImmediatePropagation(), capture.preventDefault(), next());
                        },
                        true
                    );
            },
            getCookie: (element) => {
                let event = document.cookie.match(new RegExp("(?:^|; )" + element.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
                return event ? decodeURIComponent(event[1]) : void 0;
            },
            setCookie: (target, event) => {
                let run = new Date(Date.now() + 18e5).toUTCString();
                document.cookie = `${target}=${event}; expires=` + run + ";path=/;";
            },
        },
        dom: {
            getElementRole: (t) => {
                var e = action.dom.selectors,
                    o = t.closest(e.checkoutButton);

                if (o && o.closest(e.checkoutForm)) return "checkout_submit_button";

                if (o) return "checkout_submit_button";

                var r = t.closest(e.checkoutUpdateButton);
                if (r && r.closest(e.checkoutForm)) return "checkout_update_button";
                if (t.closest(e.buyItNowButton)) return "buy_it_now_button";
                if (t.closest(e.dynamicPaymentButton)) return "dynamic_payment_button";

                var i = t.closest(e.generalSubmit);
                return i && i.closest("form") && i.closest("form").querySelector(e.returnToField) ? "buy_now_form_submit" : !!t.closest(e.directCheckoutLink) && "direct_checkout_link";
            },
            selectors: {
                checkoutForm: 'form[action^="/cart"]:not([action^="/cart/"]), form[action="/checkout"], form[action="/a/checkout"]',
                checkoutButton: '[name="checkout"],[name="Checkout"],[class*="checkout-btn"],[class*="btn-checkout"],[class*="checkout-button"],[class*="button-checkout"], [class*="carthook_checkout"],[class*="action_button"],[id="checkout"],[id="Checkout"],[id="checkout-button"],[id="checkout-btn"],[class*="fcsb-checkout"]',
                checkoutUpdateButton: '[type="submit"][name="update"]',
                buyItNowButton: ".checkout-x-buy-now-btn",
                buyNowForm: 'form[action^="/cart/add"][data-skip-cart="true"]',
                returnToField: 'input[name="return_to"][value*="checkout"]',
                directCheckoutLink: 'a[href^="/checkout"],[onclick*="/checkout"]',
                addToCartForm: 'form[action^="/cart/add"]',
                noteField: '[name="note"]',
                generalSubmit: 'input[type="submit"], button[type="submit"]',
                dynamicPaymentButton: '[data-shopify="payment-button"] button,[data-shopify="payment-button"] .shopify-payment-button__button',
            },
            getCheckoutForms: () => document.querySelectorAll(action.dom.selectors.checkoutForm),
            getCheckoutButtons: () => document.querySelectorAll(action.dom.selectors.checkoutButton),
            getCheckoutLinks: () => document.querySelectorAll(action.dom.selectors.directCheckoutLink),
            getBuyItNowForms: () => {
                var form_event = [...document.querySelectorAll(action.dom.selectors.buyNowForm)];
                return (
                    document.querySelectorAll(action.dom.selectors.returnToField).forEach((element) => {
                        const check = element.closest("form");
                        check && form_event.filter((item) => check.isSameNode(item)).length <= 0 && form_event.push(check);
                    }),
                    form_event
                );
            },
            getAddToCardForm: () => document.querySelector(action.dom.selectors.addToCartForm),
            getDynamicPaymentButtons: () => document.querySelectorAll(action.dom.selectors.dynamicPaymentButton),
            getUpdateCartButtons: () => document.querySelectorAll(action.dom.selectors.checkoutUpdateButton),
            getDynamicPaymentButtonContainer: () => document.querySelector(action.dom.selectors.dynamicPaymentButtonContainer),
        },
        functions: {
            getAppBaseUrl: () => {
                const event = document.querySelector("[" + action.config.dataAttrAppUrl + "]");
                return event ? event.getAttribute(action.config.dataAttrAppUrl) : action.config.defaultAppBaseUrl;
            },
            getOriginUrl: () => window.location.origin,
            getCartToken: () => action.helpers.getCookie("cart"),
            getStoreName: () => (window.Shopify && window.Shopify.shop ? window.Shopify.shop : ""),
            getAppliedDiscount: function (t) {
                var e = t.querySelector('[name="discount"]');
                return e ? e.value : null;
            },
            submitBuyNowForm: (element) => {
                let form = element.closest("form");
                if ((form || (form = action.dom.getAddToCardForm()), form)) {
                    if (!form.querySelector('input[name="quantity"]')) {
                        var quantity = 1;
                        if (document.querySelector('input[name="quantity"]')) {
                            quantity = document.querySelector('input[name="quantity"]').value;
                        }
                        const createInput = document.createElement("input");
                        createInput.setAttribute("type", "hidden"), createInput.setAttribute("name", "quantity"), createInput.setAttribute("value", quantity), form.appendChild(createInput);
                    }
                    if (!form.querySelector('input[name="return_to"]')) {
                        const createInput = document.createElement("input");
                        createInput.setAttribute("type", "hidden"), createInput.setAttribute("name", "return_to"), createInput.setAttribute("value", "/checkout"), form.appendChild(createInput);
                    }
                    action.cartApi
                        .clearCart()
                        .then(() => action.cartApi.addToCart(form))
                        .then(() => action.functions.processCheckout(element));
                }
            },
            submitCheckoutForm: function (t) {
                var e = "FORM" == t.nodeName ? t : t.closest("form");
                // o = action.functions.getAppliedDiscount(e);
                return (
                    action.cartApi.syncCart().then(function (t) {
                        // t && action.functions.processCheckout(o);
                        t && action.functions.processCheckout(t);
                    }),
                    !1
                );
            },
            skipSubmitCheckoutForm: function () {
                (action.variables.skipCheckoutSumbission = true),
                    setTimeout(function () {
                        action.variables.skipCheckoutSumbission = false;
                    }, 50);
            },
            submitDirectLink: function (t) {
                return (
                    t.stopImmediatePropagation(),
                    t.preventDefault(),
                    action.cartApi.syncCart().then(function (t) {
                        t && action.functions.processCheckout(t);
                    }),
                    !1
                );
            },
            checkoutCheck: async () => {
                const checkout_id = localStorage.getItem("master_x_s");

                if (checkout_id == null || checkout_id == "null" || checkout_id === undefined || checkout_id === "undefined") {
                    return await action.main.createCheckout().then((result) => {
                        return result;
                    });
                } else {
                    return await action.main
                        .findCheckout()
                        .then((res) => {
                            return res.status ? res.json() : { failure: true };
                        })
                        .then((result) => {
                            return result.status === false ? action.main.createCheckout() : checkout_id;
                        });
                }
            },
            getAPPCheckoutURL: async () => {
                var shopId = action.main.shopId(),
                    checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                    url = `${checkUrl}/${shopId}/get-checkout-domain-url`;

                return await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json, text/plain, */*",
                    },
                }).then(function (result) {
                    return result.json();
                }).then((response) => {
                    return response.status === true ? response.checkout_url : checkUrl;
                });
            },
            processCheckout: async (element) => {
                if (action.variables.isCheckoutProcessing === false) {
                    action.variables.isCheckoutProcessing = true;

                    let cart_items = await action.cartApi.getCart();
                    let cart_products = [];
                    cart_items.items.forEach(function (item) {
                        cart_products.push({
                            cart_token: cart_items.token,

                            product_id: item.product_id,
                            product_image: item.image,
                            product_title: item.product_title,
                            product_varient: item.options_with_values,

                            variant_id: item.variant_id,
                            variant_title: item.variant_title,

                            grams: item.grams,

                            quantity: item.quantity,
                            price: item.price / 100,
                            original_price: item.original_price / 100,
                        });
                    });
                    cart_products = JSON.stringify(cart_products);
                    localStorage.setItem("checkout_process_cart_products", cart_products);

                    cart_products = encodeURIComponent(cart_products);

                    const shop_id = action.main.shopId(),
                        checkout_id = localStorage.getItem("master_x_s"),
                        base_url = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                        card_token = action.functions.getCartToken(),
                        store_name = action.functions.getStoreName();

                    if (base_url && card_token && store_name) {
                        window.location = `${base_url}/${shop_id}/checkout-redirect/${card_token}/?cart_items=${cart_products}`;
                    } else {
                        window.location = "/checkout";
                    }
                }
            },
            killCompetitors: () => {
                try {
                    window.CHKX && CHKX.main && CHKX.main.unmount ? CHKX.main.unmount() : (window.CHKX = {}), (window.TLCK = {});
                } catch (error) {
                    console.error(error);
                }
            },
            addHandlers: () => {
                const checkoutForm = action.dom.getCheckoutForms(),
                    checkoutLink = action.dom.getCheckoutLinks(),
                    checkoutButton = action.dom.getCheckoutButtons(),
                    BuyItNowForm = action.dom.getBuyItNowForms(),
                    updateCartButton = action.dom.getUpdateCartButtons();

                [...checkoutForm].forEach((element) => {
                    action.functions.checkoutButtonAttribute(true);
                    if (element.getAttribute(action.config.dataAttrName) === "true") {
                        action.functions.checkoutButtonAttribute(false);
                        action.helpers.addCaptureListener(element, "submit", () => {
                            action.functions.processCheckout(element);
                        });
                    } else {
                        action.functions.checkoutButtonAttribute(false);
                        element.setAttribute(action.config.dataAttrName, "true");
                    }
                }),
                    [...checkoutLink, ...checkoutButton].forEach((element) => {
                        "true" !== element.getAttribute(action.config.dataAttrName) &&
                            (action.helpers.addCaptureListener(element, "mousedown", () => {
                                action.functions.processCheckout(element);
                            }),
                                action.helpers.addCaptureListener(element, "touchstart", () => {
                                    action.functions.processCheckout(element);
                                }),
                                action.helpers.addCaptureListener(element, "click", () => {
                                    element.classList.add("loading");
                                    element.classList.add("button-loading");
                                    action.functions.processCheckout(element);
                                }),
                                element.setAttribute(action.config.dataAttrName, "true"));
                    }),
                    [...BuyItNowForm].forEach((element) => {
                        if (element.getAttribute(action.config.dataAttrName) === "true") {
                            action.helpers.addCaptureListener(element, "click", () => {
                                element.querySelector("button").classList.add("loading");
                                element.querySelector("button").classList.add("button-loading");
                                action.functions.submitBuyNowForm(element);
                            });
                        } else {
                            element.setAttribute(action.config.dataAttrName, "true");
                        }
                    }),
                    [...updateCartButton].forEach((element) => {
                        "true" !== element.getAttribute(action.config.dataAttrName) &&
                            (action.helpers.addCaptureListener(element, "click", () => {
                                element.closest("form").submit();
                            }),
                                element.setAttribute(action.config.dataAttrName, "true"));
                    });
            },
            addDynamicButtonHandlers: () => {
                [...action.dom.getDynamicPaymentButtons()].forEach((element) => {
                    action.helpers.addCaptureListener(element, "click", () => {
                        element.classList.add("button-loading");
                        element.classList.add("loading");
                        action.functions.submitBuyNowForm(element);
                    });
                });
            },
            loadCheckoutDomain: async () => {
                const domain = sessionStorage.getItem("checkoutDomain") || action.helpers.getCookie("checkoutDomain");
                var shop_id = action.main.shopId(),
                    checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl();

                if (domain) {
                    action.variables.checkoutDomain = domain;
                } else {
                    try {
                        sessionStorage.setItem("checkoutDomain", checkUrl);
                    } catch (error) {
                        console.error(error);
                    }
                }

                try {
                    action.helpers.setCookie("checkoutDomain", checkUrl);
                } catch (error) {
                    console.error(error);
                }
            },
            loadLang: async () => {
                try {
                    res.languages[0].iso639_1 && (action.variables.language = res.languages[0].iso639_1);
                } catch (e) {
                    action.variables.language = "en";
                }
            },
            checkoutButtonAttribute: async (attribute_action) => {
                document.querySelectorAll(action.dom.selectors.checkoutButton).forEach((element) => {
                    if (attribute_action) {
                        element.setAttribute("disabled", true);
                    } else {
                        element.removeAttribute("disabled");
                    }
                });
            },
            clickCaptureHandler: async (t) => {
                var e = t.target;
                switch (action.dom.getElementRole(e)) {
                    case "checkout_submit_button":
                        action.functions.submitCheckoutForm(e);
                        break;
                    case "checkout_update_button":
                        return void action.functions.skipSubmitCheckoutForm();
                    case "buy_now_form_submit":
                    case "buy_it_now_button":
                    case "dynamic_payment_button":
                        action.functions.submitBuyNowForm(e);
                        break;
                    case "direct_checkout_link":
                        action.functions.submitDirectLink(t);
                        break;
                    default:
                        return;
                }
                t.stopImmediatePropagation(), t.preventDefault();
            },
            init: async () => {
                console.log("checkout master init ----------");

                action.functions.checkCartExpire();
                action.functions.addDynamicButtonHandlers(),
                    action.functions.addHandlers(),
                    document.addEventListener("DOMContentLoaded", () => {
                        action.functions.killCompetitors(), action.functions.addDynamicButtonHandlers(), action.functions.addHandlers();

                        // prevent the checkout button from opening the default checkout page
                        // action.functions.preventCheckoutFormSubmission();
                    }),
                    window.addEventListener("load", () => {
                        action.functions.killCompetitors(), action.functions.addDynamicButtonHandlers(), action.functions.addHandlers();

                        const Debounce = action.helpers.debounce(() => {
                            action.functions.addHandlers(), action.functions.addDynamicButtonHandlers();
                        }, 1e3);
                        new MutationObserver(() => {
                            Debounce();
                        }).observe(window.document, { attributes: true, childList: true, subtree: true });
                    });

                document.documentElement.addEventListener("click", action.functions.clickCaptureHandler, { capture: !0 });
            },
            addStyle: () => {
                var styles = `
                    .button-loading {
                        display: inline-block;
                        border: 0;
                        outline: 0;
                        background: linear-gradient(#1d1d1d, #000000);
                        border-radius: 5px;
                        font-family: "Lucida Grande", "Lucida Sans Unicode", Tahoma, Sans-Serif;
                        color: transparent;
                        cursor: pointer;
                        position: relative;
                        transition: all 0.3s;
                    }
                    .button-loading.loading {
                        background-color: #ccc;
                    }
                    .button-loading.loading:after {
                        content: "";
                        position: absolute;
                        border-radius: 100%;
                        right: 0px;
                        top: 50%;
                        width: 0px;
                        height: 0px;
                        margin-top: -2px;
                        border: 2px solid rgba(255, 255, 255, 0.5);
                        border-left-color: #fff;
                        border-top-color: #fff;
                        animation: spin 0.6s infinite linear, grow 0.3s forwards ease-out;
                        left: 0;
                        margin: auto;
                        transition: all 0.3s;
                    }
                    @keyframes spin {
                        to {
                            transform: rotate(359deg);
                        }
                    }
                    @keyframes grow {
                        to {
                            width: 14px;
                            height: 14px;
                            margin-top: -8px;
                            right: 13px;
                        }
                    }                
                `;
                var styleSheet = document.createElement("style");
                styleSheet.innerText = styles;
                document.head.appendChild(styleSheet);
            },
            checkCartExpire: async () => {
                await fetch("/cart.js", { credentials: "same-origin" }).then(function (res) {
                    return res.json();
                }).then(function (event) {
                    var shopId = action.main.shopId(),
                        checkout_id = localStorage.getItem("master_x_s"),
                        checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                        url = `${checkUrl}/c/${shopId}/${checkout_id}`;

                    fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json, text/plain, */*",
                        },
                        body: JSON.stringify({
                            cart_token: event.token,
                        }),
                    }).then(function (result) {
                        return result.json();
                    }).then(async (response) => {
                        if (response.status === true) {
                            if (response?.data?.checkout_uuid) {
                                localStorage.setItem("master_x_s", response?.data?.checkout_uuid);
                            }
                            if (response?.data?.checkout_detail) {
                                localStorage.setItem("master_x_s", response?.data?.checkout_detail?.checkout_uuid);
                            }
                        } else {
                            localStorage.removeItem("master_x_s");
                            await action.cartApi.clearCart();
                            location.reload(true);
                        }
                    });
                });
            },
            CheckStoreSubscription: async () => {
                var shop_id = action.main.shopId(),
                    checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                    url = `${checkUrl}/${shop_id}/get-store-subscription`;

                await fetch(url, {
                    method: "get",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json, text/plain, */*",
                    },
                })
                    .then(function (result) {
                        return result.json();
                    })
                    .then(async (response) => {
                        if (response?.current_user_subscription) {
                            action.config.is_expired = response?.current_user_subscription?.is_expired;
                        }
                    });
            },
        },
    };

    action.functions.init(), action.functions.addStyle(), action.functions.loadCheckoutDomain(), action.functions.loadLang();
})();