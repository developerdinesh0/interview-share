const fs = require("fs");
const moment = require("moment");
const request = require("request-promise");

const models = require("../models");

module.exports.customize_checkout = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            request_body.user_id = auth_user?.id;
            request_body.updated_by = auth_user?.id;

            let customize_checkout = await models.CustomizeCheckout.findOne({
                where: {
                    id: request_body?.customize_checkout_id,
                },
            });

            customize_checkout.money_format = request_body?.money_format;
            customize_checkout.store_logo = request_body?.store_logo;
            customize_checkout.favicon = request_body?.favicon;
            customize_checkout.security_badge = request_body?.security_badge;
            customize_checkout.accent_color = request_body?.accent_color;
            customize_checkout.button_color = request_body?.button_color;
            customize_checkout.error_color = request_body?.error_color;
            customize_checkout.font_size = request_body?.font_size;

            customize_checkout.return_policy = request_body?.return_policy;
            customize_checkout.privacy_policy = request_body?.privacy_policy;
            customize_checkout.terms_condition = request_body?.terms_condition;

            customize_checkout.require_phone_number = request_body?.require_phone_number ? true : false;
            customize_checkout.require_address_number = request_body?.require_address_number ? true : false;
            customize_checkout.check_accepts_marketing = request_body?.check_accepts_marketing ? true : false;
            customize_checkout.display_timer = request_body?.display_timer ? true : false;
            customize_checkout.display_branding = request_body?.display_branding ? true : false;
            customize_checkout.display_discount = request_body?.display_discount ? true : false;

            customize_checkout.custom_script = request_body?.custom_script;
            customize_checkout.thankyou_description = request_body?.thankyou_description;

            customize_checkout.save();

            if (customize_checkout?.template_id) {
                let template_code = customize_checkout?.template_code;

                // Replace constant value with the database variable
                let replace_parametars = {
                    font_size: `${customize_checkout?.font_size}px`,
                    accent_color: customize_checkout?.accent_color,
                    button_color: customize_checkout?.button_color,
                    error_color: customize_checkout?.error_color,
                };

                let checkout_template_css = await fs.readFileSync(`${appRoot}/public/assets/css/checkout-template/checkout-template-${template_code}-dummy.css`, "utf8");
                checkout_template_css = checkout_template_css.replace(/font_size|accent_color|button_color|error_color/gi, function (matched) {
                    return replace_parametars[matched];
                });

                let checkout_template_writeStream = await fs.createWriteStream(`${appRoot}/public/assets/css/store-css/checkout-template-${customize_checkout?.store_id}.css`);
                checkout_template_writeStream.write(checkout_template_css);
                checkout_template_writeStream.end();

                let checkout_thankyou_css = await fs.readFileSync(`${appRoot}/public/assets/css/checkout-template/checkout-thankyou-${template_code}-dummy.css`, "utf8");
                checkout_thankyou_css = checkout_thankyou_css.replace(/font_size|accent_color|button_color|error_color/gi, function (matched) {
                    return replace_parametars[matched];
                });

                let checkout_thankyou_writeStream = await fs.createWriteStream(`${appRoot}/public/assets/css/store-css/checkout-thankyou-${customize_checkout?.store_id}.css`);
                checkout_thankyou_writeStream.write(checkout_thankyou_css);
                checkout_thankyou_writeStream.end();
            }

            // Checkout section details create and update
            for (let section_key in request_body?.section_title) {
                let section_detail = {
                    store_id: request_body?.store_id,
                    customize_checkout_id: customize_checkout?.id,
                    section_title: request_body?.section_title[section_key],
                    section_icon: request_body?.section_icon[section_key],
                    section_description: request_body?.section_description[section_key],
                };

                if (request_body?.section_id && request_body?.section_id[section_key]) {
                    section_detail = { ...section_detail, updated_by: auth_user?.id };
                    await models.CustomizeAboutSections.update(section_detail, {
                        where: {
                            id: request_body?.section_id[section_key],
                        },
                    });
                } else {
                    section_detail = { ...section_detail, created_by: auth_user?.id };
                    await models.CustomizeAboutSections.create(section_detail);
                }
            }

            return res.json({
                status: true,
                message: "Checkout details submit",
                store_id: request_body.store_id,
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/customize-checkout`,
            });
        } catch (error) {
            console.error("customize_checkout error--------------", error);
            return res.json({
                status: false,
                message: "Something went wrong. Please try again.",
            });
        }
    }

    let customize_checkout = await models.CustomizeCheckout.findOne({
        where: {
            store_id: store_id,
        },
        include: [
            {
                model: models.CustomizeAboutSections,
            },
        ],
    });

    let userSubscription = true;
    let user_subscription = await models.UserSubscriptions.findOne({
        where: {
            store_id: store_id,
        },
    });
    if (user_subscription) {
        userSubscription = false;
    }

    res.render("backend/CustomizeCheckout/customize_checkout", {
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,
        userSubscription: userSubscription,
        customize_checkout: customize_checkout,
        active_menu: "customize-checkout",
    });
};

module.exports.preview_checkout = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    // Get Store Detail
    let store_detail = await models.Stores.findOne({
        where: { id: store_id },
        attributes: ["id", "user_id", "store_name", "store_domain", "store_token", "store_currency"],
    });
    store_detail.customize_checkout_preview = true;
    store_detail.save();

    // Get Store Customize Checkout
    let customize_checkout = await models.CustomizeCheckout.findOne({
        where: { store_id: store_id },
        include: [
            {
                model: models.CustomizeAboutSections,
            },
        ],
    });

    // Get Store ShippingRates Details
    let shipping_options = await models.ShippingRates.findAll({
        where: {
            store_id: store_id,
        },
    });

    let countery_where_filter = {};
    if (shipping_options) {
        let shipping_country_codes = [];
        for (let shipping_option of shipping_options) {
            shipping_country_codes = [...shipping_country_codes, ...shipping_option?.country_codes];
        }

        if (shipping_country_codes.length > 0) {
            countery_where_filter = {
                ...countery_where_filter,
                country_code: shipping_country_codes,
            };
        }
    }

    // Get Countries From Database
    let shipping_countries = await models.Countries.findAll({
        where: countery_where_filter,
        order: [["country_name", "ASC"]],
    });

    let billing_countries = await models.Countries.findAll({
        order: [["country_name", "ASC"]],
    });

    // Get Store PaymentMethods Details
    let payment_methods = await models.PaymentMethods.findAll({
        order: [["method_name", "DESC"]],
        where: {
            store_id: store_id,
        },
    });
    let convert_response = await convert_key_array(payment_methods, "method_name");
    let payment_method_names = convert_response?.array_keys;
    let payment_methods_key = convert_response?.convert_key_array;

    // Get Store Translations Details
    let language_translation = await models.Translations.findOne({
        where: {
            store_id: store_id,
        },
    });

    let card_accepted = [];
    if (payment_methods) {
        payment_methods.forEach((payment_method, payment_method_key) => {
            let card_html = "";

            if (payment_method?.method_name === "Stripe") {
                card_accepted = payment_method?.card_accepted;
                for (let card_accepted_key in payment_method?.card_accepted) {
                    let card_accepted = payment_method?.card_accepted[card_accepted_key];
                    if (card_accepted_key >= 3) {
                        card_html += `<small>&amp; more</small>`;
                        break;
                    }
                    card_html += `<img src="/assets/img/card-icons/${card_accepted}.svg">`;
                }
            }

            if (payment_method?.method_name === "Checkout.com") {
                card_accepted = payment_method?.card_accepted;
                for (let card_accepted_key in payment_method?.card_accepted) {
                    let card_accepted = payment_method?.card_accepted[card_accepted_key];
                    if (card_accepted_key >= 3) {
                        card_html += `<small>&amp; more</small>`;
                        break;
                    }
                    card_html += `<img src="/assets/img/card-icons/${card_accepted}.svg">`;
                }
            }

            if (payment_method?.method_name === "Payout Master") {
                card_html = `<img src="/assets/img/card-icons/visa.svg"><img src="/assets/img/card-icons/mastercard.svg"><img src="/assets/img/card-icons/amex.svg"><small>&amp; more</small>`;
            }

            if (payment_method?.method_name === "Revolut") {
                card_html = `<img src="/assets/img/card-icons/visa.svg"><img src="/assets/img/card-icons/mastercard.svg"><img src="/assets/img/card-icons/amex.svg"><small>&amp; more</small>`;
            }

            payment_method["card_html"] = card_html;
        });
    }

    let customize_checkout_publish = true;
    customize_checkout_publish = store_detail.customize_checkout_publish ? false : customize_checkout_publish;
    customize_checkout_publish = store_detail.customize_checkout_publish ? false : customize_checkout_publish;

    customize_checkout = customize_checkout?.dataValues;
    delete customize_checkout.custom_script;
    delete customize_checkout.thankyou_description;

    res.render("backend/CustomizeCheckout/preview_checkout", {
        right_sides: [],
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,

        version: customize_checkout?.template_code,
        body_class: `checkout-template-${customize_checkout?.template_code}`,

        store_detail: store_detail,
        shipping_countries: shipping_countries,
        billing_countries: billing_countries,

        customize_checkout: customize_checkout,
        money_format: customize_checkout.money_format ? customize_checkout.money_format : "${{amount}}",

        shipping_options: shipping_options,

        payment_methods: payment_methods,
        payment_methods_key: payment_methods_key,
        payment_method_names: payment_method_names,

        language_translation: language_translation,

        customize_checkout_publish: customize_checkout_publish,
    });
};

module.exports.preview_thankyou = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    // Get Store Customize Checkout
    let customize_checkout = await models.CustomizeCheckout.findOne({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
    });

    // Get Store Translations Details
    let language_translation = await models.Translations.findOne({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
    });

    // Get Store ShippingRates Details
    let shipping_options = await models.ShippingRates.findAll({
        where: {
            store_id: store_id,
            user_id: auth_user?.id,
        },
    });

    res.render("backend/CustomizeCheckout/preview_thankyou", {
        right_sides: [],
        store_id: store_id,
        auth_user: auth_user,
        auth_store: auth_store,

        version: customize_checkout?.template_code,
        body_class: `checkout-thankyou-${customize_checkout?.template_code}`,

        shipping_options: shipping_options,
        customize_checkout: customize_checkout,
        language_translation: language_translation,
    });
};

// Delete section
module.exports.delete_section = async (req, res, next) => {
    const { store_id } = req.params;

    if (req.method === "POST") {
        try {
            let request_body = req.body;

            let section = await models.CustomizeAboutSections.destroy({
                where: {
                    id: request_body.about_section_id,
                },
            });
            if (section) {
                return res.json({
                    status: true,
                    message: "Section Deleted Successfully",
                });
            } else {
                return res.json({
                    status: false,
                    message: "Unable to delete Section",
                });
            }
        } catch (error) {
            console.log("delete_section error----------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }
};

// Checkout PUBLISH On Shopify store
module.exports.get_shopToken = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    try {
        // Check Store Shipping Rate
        let shipping_rate_count = await models.ShippingRates.count({
            where: {
                store_id: store_id,
            },
        });
        if (shipping_rate_count === 0) {
            return res.json({
                status: false,
                message: "No Shipping Rate found!, Please add a Shipping Rate.",
            });
        }

        // Check Store PaymentMethods
        let payment_method_count = await models.PaymentMethods.count({
            where: {
                store_id: store_id,
            },
        });
        if (payment_method_count === 0) {
            return res.json({
                status: false,
                message: "No Payment method found!, Please add a Payment Method.",
            });
        }

        // Check Store UserSubscriptions
        let user_subscription_count = await models.UserSubscriptions.count({
            where: {
                store_id: store_id,
                user_id: auth_user.id,
            },
        });
        if (user_subscription_count === 0) {
            return res.json({
                status: false,
                message: "No Subscription found!, Please create a Subscription.",
            });
        }

        // Check Store CustomizeCheckout
        let customize_checkout = await models.CustomizeCheckout.findOne({
            raw: true,
            where: {
                store_id: store_id,
                user_id: auth_user.id,
            },
        });
        if (!customize_checkout?.store_logo && !customize_checkout?.favicon) {
            return res.json({
                status: false,
                message: "Please submit customize checkout",
            });
        }

        let store_detail = await models.Stores.findOne({
            where: { id: store_id },
        });

        let getScript = {
            json: true,
            method: "GET",
            uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-01/themes.json`,
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": store_detail.store_token,
            },
        };
        await request(getScript)
            .then(async function (response) {
                response.themes.forEach(async (element) => {
                    if (element.role.includes("main")) {
                        var theme_liquid = {
                            json: true,
                            cache: false,
                            method: "GET",
                            uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/themes/${element.id}/assets.json?asset[key]=layout/theme.liquid`,
                            headers: { "X-Shopify-Access-Token": store_detail.store_token, "Content-Type": "application/json" },
                        };
                        await request(theme_liquid)
                            .then(async function (theme_response) {
                                let custom_script = `<script type="text/javascript" src="${process.env.APP_URL}/assets/js/shopify/checkout-integration.js" data-master-x-id="${store_id}"></script>`;
                                var checkScript = theme_response.asset.value.match(/data-master-x-id/g);

                                if (!checkScript) {
                                    var position = theme_response.asset.value.indexOf("</head>");
                                    var output = [theme_response.asset.value.slice(0, position), custom_script, theme_response.asset.value.slice(position)].join("\n");

                                    var putThemeLiquid = {
                                        json: true,
                                        method: "PUT",
                                        uri: `https://${store_detail.store_name}.myshopify.com/admin/api/2022-10/themes/${theme_response.asset.theme_id}/assets.json`,
                                        body: {
                                            asset: {
                                                key: "layout/theme.liquid",
                                                value: output,
                                            },
                                        },
                                        headers: {
                                            "X-Shopify-Access-Token": store_detail.store_token,
                                            "Content-Type": "application/json",
                                        },
                                        json: true,
                                    };
                                    await request(putThemeLiquid)
                                        .then(async (put_theme_response) => {
                                            store_detail.customize_checkout_publish = true;
                                            store_detail.customize_checkout_publish_date = moment();
                                            store_detail.save();

                                            if (!auth_user?.first_store_publish_id) {
                                                await models.Users.update(
                                                    {
                                                        first_store_publish_id: store_detail?.id,
                                                        first_store_publish_date: moment(),
                                                    },
                                                    {
                                                        where: {
                                                            id: auth_user?.id,
                                                        },
                                                    }
                                                );
                                            }

                                            return res.json({
                                                status: true,
                                                token: store_detail,
                                                message: "Successfully Published ",
                                            });
                                        })
                                        .catch(function (error) {
                                            console.log("putThemeLiquid error ------------", error);
                                        });
                                } else {
                                    store_detail.customize_checkout_publish = true;
                                    store_detail.customize_checkout_publish_date = moment();
                                    store_detail.save();

                                    if (!auth_user?.first_store_publish_id) {
                                        await models.Users.update(
                                            {
                                                first_store_publish_id: store_detail?.id,
                                                first_store_publish_date: moment(),
                                            },
                                            {
                                                where: {
                                                    id: auth_user?.id,
                                                },
                                            }
                                        );
                                    }

                                    return res.json({
                                        status: true,
                                        token: store_detail,
                                        message: "Already Publish",
                                    });
                                }
                            })
                            .catch(function (error) {
                                console.log("themeLiquid error ------------", error);
                            });
                    }
                });
            })
            .catch(function (error) {
                console.log("getScript error ------------", error);
            });
    } catch (error) {
        console.log("script_section error----------", error);
        return res.json({
            status: false,
            message: "Something went wrong. Please try again.",
        });
    }
};