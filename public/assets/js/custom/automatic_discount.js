jQuery(document).ready(function () {
    jQuery("input[type=number]").bind("mousewheel DOMMouseScroll", function (e) {
        return false;
    });

    // show/hide discount usage field
    if (jQuery("#discountUsage").is(":checked")) {
        jQuery("#discountUsageChecked").show();
    } else {
        jQuery("#discountUsageChecked").hide();
    }

    // show/hide discount usage field
    jQuery("#discountUsage").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#discountUsageChecked").show();
            jQuery("#discount_usage").attr("required", true);
        } else {
            jQuery("#discountUsageChecked").hide();
            jQuery("#discount_usage").removeAttr("required");
        }
    });

    // Set a maximum discount usage Js
    if (jQuery("#maximum_discount_usage").is(":checked")) {
        jQuery("#maximum_discount_usage_section").show();
    } else {
        jQuery("#maximum_discount_usage_section").hide();
    }

    jQuery("#maximum_discount_usage").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#maximum_discount_usage_section").show();
            jQuery("#maximum_discount_usage").attr("required", true);
        } else {
            jQuery("#maximum_discount_usage_section").hide();
            jQuery("#maximum_discount_usage").removeAttr("required");
        }
    });

    // Set end date and time Js
    if (jQuery("#activeEndDate").is(":checked")) {
        jQuery("#end-datetime").show();
    } else {
        jQuery("#end-datetime").hide();
    }

    jQuery("#activeEndDate").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#end-datetime").show();
            jQuery("#active_to_date").attr("required", true);
            jQuery("#active_end_time").attr("required", true);

            if (jQuery("#active_to_date").val() === "") {
                jQuery("#active_to_date").val(moment().utc().local().format("YYYY-MM-DD"));
                jQuery("#active_end_time").val(moment().utc().local().format("HH:mm"));
            }
        } else {
            jQuery("#end-datetime").hide();
            jQuery("#active_to_date").removeAttr("required");
            jQuery("#active_end_time").removeAttr("required");
            $(":submit").removeAttr("disabled");
        }
    });

    jQuery("#active_from_date,#active_start_time,#active_end_time").on("change", function () {
        let fromdate = jQuery("#active_from_date").val();
        let active_start_time = jQuery("#active_start_time").val();
        let active_end_time = jQuery("#active_end_time").val();
        let todate = " to";
        if (jQuery("#activeEndDate").is(":checked") && jQuery("#active_to_date").val().length != 0) {
            let todates = jQuery("#active_to_date").val();

            todate = " to " + moment(todates + " " + active_end_time).format("DD MMM YYYY");

            // change min value of end date & time
            jQuery("#active_to_date").attr("min", fromdate);
            if (moment(jQuery("#active_to_date").val()).format("DD-MM-YYYY") == moment(fromdate).format("DD-MM-YYYY")) {
                jQuery("#active_end_time").attr("min", active_start_time);
            } else {
                jQuery("#active_end_time").removeAttr("min");
            }
        } else {
            todate = " to";
        }
        if (jQuery("#active_from_date").val().length != 0) {
            jQuery("#active_date").html("Active from " + moment(fromdate + " " + active_start_time).format("DD MMM YYYY") + todate);
        } else {
            jQuery("#active_date").html("Active from " + moment(fromdate + " " + active_start_time).format("DD MMM YYYY") + todate);
        }
    });

    jQuery("#active_to_date").on("change", function () {
        let fromdate = jQuery("#active_from_date").val();
        let active_start_time = jQuery("#active_start_time").val();
        let active_end_time = jQuery("#active_end_time").val();
        if (jQuery("#active_to_date").val().length != 0) {
            let todate = jQuery("#active_to_date").val();
            jQuery("#active_date").html("Active from " + moment(fromdate + " " + active_start_time).format("DD MMM YYYY") + " to " + moment(todate + " " + active_end_time).format("DD MMM YYYY"));
        } else {
            jQuery("#active_date").html("Active from " + moment(fromdate + " " + active_start_time).format("DD MMM YYYY") + " to");
        }
    });

    // Discount application criteria Js
    jQuery("#discount_cart").prop("checked", true);
    jQuery("#discount_cart").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#mini_quantity_cart_check_reached").show();
            jQuery("#amount_bool").prop("checked", false);
            jQuery("#mini_amount_cart_check").hide();
        }
    });

    if (jQuery("#amount_bool").is(":checked")) {
        jQuery("#mini_amount_cart_check").show();
        jQuery("#discount_cart").prop("checked", false);
        jQuery("#mini_quantity_cart_check_reached").hide();
    } else {
        jQuery("#mini_amount_cart_check").hide();
        jQuery("#mini_quantity_cart_check_reached").show();
    }

    jQuery("#amount_bool").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#mini_amount_cart_check").show();
            jQuery("#discount_cart").prop("checked", false);
            jQuery("#mini_quantity_cart_check_reached").hide();
        }
    });

    jQuery("#discount_cart, #amount_bool").on("change", function () {
        if (jQuery("#discount_cart").is(":checked")) {
            jQuery("#cart_limit").html("Minimum quantity reached in cart of " + jQuery("#cart_mini_quantity").val() + " items");
        } else {
            jQuery("#cart_limit").html("Minimum amount reached in cart of $" + jQuery("#cart_amt_quantity").val());
        }
    });

    if (jQuery("#exclude_shipping").is(":checked")) {
        jQuery("#exclude_shipping_amt").show();
    }
    jQuery("#exclude_shipping").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#exclude_shipping_amt").show();
        } else {
            jQuery("#exclude_shipping_amt").hide();
        }
    });

    // entire order select -check
    if (jQuery("#entire_order").is(":checked")) {
        jQuery("#specific_order_display_fixed").hide();
        jQuery("#discount_exclude").hide();
        jQuery("#specific_order").prop("checked", false);
        jQuery("#specific_order_display").hide();
    }

    // Entire order - prop set ,show/hide
    jQuery("#entire_order").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#specific_order").prop("checked", false);
            jQuery("#specific_order_display").hide();
            jQuery("#specific_order_display_fixed").hide();
            jQuery("#order_item").html("Entire Order");

            customer_discount_product_items = [];
            customer_discount_collection_items = [];
            load_customer_discount_product_items();
        }
    });

    // Specific order select -check
    if (jQuery("#specific_order").is(":checked")) {
        jQuery("#entire_order").prop("checked", false);
        jQuery("#specific_order_display").show();
    }

    jQuery("#specific_order").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#specific_order_display").show();
            jQuery("#specific_order_display_fixed").hide();
            jQuery("#order_item").html("Specific items");

            jQuery("#discount-percentage-products-listing").show();
            jQuery("#discount-percentage-collection-listing").show();
        }

        if (checked && jQuery("#discount_type_fixed").is(":checked")) {
            jQuery("#specific_order_display_fixed").show();
        } else {
            jQuery("#specific_order_display_fixed").hide();
        }
    });

    /// How to apply the discount
    jQuery("#all_items").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#discount_each_item").prop("checked", false);
        }
    });

    jQuery("#discount_each_item").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#all_items").prop("checked", false);
        }
    });

    jQuery("#percentage_discount_value").on("change", function () {
        let discount = jQuery("#percentage_discount_value").val();
        if (discount.length != 0) {
            jQuery("#discount_rate").html("Discounted " + discount + "%");
        } else {
            jQuery("#discount_rate").html("Discounted %");
        }
    });

    /*****************************************
     *** Buy X Get Y Discount Js
     *****************************************/
    // cart_minimum_amt  and  minimum_quantity_cart
    if (jQuery("#minimum_quantity_cart").is(":checked")) {
        jQuery("#minimum_amount_cart_check").hide();
        jQuery("#minimum_quantity_cart_check").show();
    }

    jQuery("#minimum_quantity_cart").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#minimum_quantity_cart_check").show();
            jQuery("#cart_minimum_amt").prop("checked", false);
            jQuery("#minimum_amount_cart_check").hide();
            // jQuery("#discount_free").prop("checked", false);
        }
        if (jQuery("#minimum_quantity_cart").is(":checked")) {
            jQuery("#cart_limit").html("Minimum quantity reached in cart of " + jQuery("#minimum_quantity_cart_check").val() + " items");
        } else {
            jQuery("#cart_limit").html("Minimum amount reached in cart of $" + jQuery("#minimum_amount_cart_check").val());
        }
    });

    if (jQuery("#cart_minimum_amt").is(":checked")) {
        jQuery("#minimum_amount_cart_check").show();
        jQuery("#minimum_quantity_cart_check").hide();
    }

    jQuery("#cart_minimum_amt").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#minimum_amount_cart_check").show();
            jQuery("#minimum_quantity_cart").prop("checked", false);
            jQuery("#minimum_quantity_cart_check").hide();
        }
        if (jQuery("#minimum_quantity_cart").is(":checked")) {
            jQuery("#cart_limit").html("Minimum quantity reached in cart of " + jQuery("#cart_minimum_quantity").val() + " items");
        } else {
            jQuery("#cart_limit").html("Minimum amount reached in cart of $" + jQuery("#cart_minimum_amount").val());
        }
    });

    jQuery("#cart_minimum_quantity, #cart_minimum_amount").change(function () {
        if (jQuery("#minimum_quantity_cart").is(":checked")) {
            jQuery("#cart_limit").html("Minimum quantity reached in cart of " + jQuery("#cart_minimum_quantity").val() + " items");
        } else {
            jQuery("#cart_limit").html("Minimum amount reached in cart of $" + jQuery("#cart_minimum_amount").val());
        }
    });

    if (jQuery(jQuery("#discount_free")).is(":checked")) {
        jQuery("#cus_p_discount").hide();
    }
    jQuery("#discount_free").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#discount_percentage").prop("checked", false);
            jQuery("#cus_p_discount").hide();
            jQuery("#discount_rate").html("Free");
        }
    });

    if (jQuery(jQuery("#discount_percentage")).is(":checked")) {
        jQuery("#cus_p_discount").show();
    }
    jQuery("#discount_percentage").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#discount_free").prop("checked", false);
            jQuery("#cus_p_discount").show();
            jQuery("#discount_rate").html("Discounted %");
        }
    });

    /// Additional options
    if (jQuery("#additionalOptions").is(":checked")) {
        jQuery("#additional_options").show();
    }
    jQuery("#additionalOptions").click(function () {
        var checked = jQuery(this).is(":checked");
        if (checked) {
            jQuery("#additional_options").show();
        } else {
            jQuery("#additional_options").hide();
        }
    });

    jQuery("#cart_mini_quantity").on("change", function () {
        let quantity = jQuery("#cart_mini_quantity").val();
        if (jQuery("#cart_mini_quantity").val().length != 0) {
            jQuery("#cart_limit").html("Minimum quantity reached in cart of " + quantity + " items");
        } else {
            jQuery("#cart_limit").html("Minimum quantity reached in cart of 1 items");
        }
    });

    jQuery("#customer_percentage_discount").on("change", function () {
        let discount = jQuery("#customer_percentage_discount").val();
        if (discount.length != 0) {
            jQuery("#discount_rate").html("Discounted " + discount + "%");
        } else {
            jQuery("#discount_rate").html("Discounted %");
        }
    });

    /*****************************************
     *** Change Discount Type Js
     *****************************************/
    jQuery(`input[name="discount_type"][value='${discount_type}']`).prop("checked", true);
    load_discount_type("on_load");

    jQuery('input[type=radio][name="discount_type"]').change(function () {
        load_discount_type("on_change");
    });

    /*****************************************
     ***** Select Specific Poducts Js
     *****************************************/
    jQuery(document).on("click", ".add_product_button", function () {
        action_type = jQuery(this).attr("action_type");

        jQuery("input[name='product_search']").val("");
        jQuery("#add_product_model .items_selected").html("0 items selected");

        load_shopify_product_modal();
        jQuery("#add_product_model").modal("show");
    });

    jQuery(document).on("change paste keyup", "input[name='product_search']", function (target, event) {
        load_shopify_product_modal();
    });

    jQuery("#trigger_selectall_products").click(function () {
        var is_checked = $(this).is(":checked");
        if (is_checked) {
            jQuery(".check-product").prop("checked", true);
            jQuery(".add_product_model_save").attr("disabled", false);
        } else {
            jQuery(".check-product").prop("checked", false);
            jQuery(".add_product_model_save").attr("disabled", true);
        }

        let selected_products = [];
        jQuery(".products-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });
        jQuery("#add_product_model .items_selected").html(`${selected_products.length} items selected`);
    });

    jQuery(document).on("click", ".checkbox-product", function (target, event) {
        var is_checked = jQuery("input[type='checkbox'].checkbox-product");

        if (is_checked.filter(":checked").length > 0) {
            jQuery(".add_product_model_save").attr("disabled", false);
        } else {
            jQuery(".add_product_model_save").attr("disabled", true);
        }

        if (is_checked.length == is_checked.filter(":checked").length) {
            jQuery("#trigger_selectall_products").prop("checked", true);
        } else {
            jQuery("#trigger_selectall_products").prop("checked", false);
        }

        let selected_products = [];
        jQuery(".products-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });

        jQuery("#add_product_model .items_selected").html(`${selected_products.length} items selected`);
    });

    jQuery(".add_product_model_cancel").click(function () {
        jQuery("#add_product_model").modal("toggle");
        jQuery(".checkbox-product").prop("checked", false);
        jQuery("#trigger_selectall_products").prop("checked", false);
        jQuery(".add_product_model_save").attr("disabled", true);
    });

    /////////////////////////// Add Checked products
    jQuery(".add_product_model_save").click(function () {
        let selected_products = [];
        jQuery(".products-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });

        if (action_type === "customer_buy_product_items") {
            selected_products.forEach(function (selected_product) {
                const product_found = product_details.find((product_detail) => product_detail.id == selected_product);
                if (product_found) {
                    customer_buy_product_items.push({
                        product_id: product_found?.id,
                        product_title: product_found?.title,
                        product_image: product_found?.image?.src,

                        product_variants: product_found?.variants,
                        selected_product_variants: array_column(product_found?.variants, "id"),
                    });
                }
            });
            load_customer_buy_product_items();
        }

        if (action_type === "customer_get_product_items") {
            selected_products.forEach(function (selected_product) {
                const product_found = product_details.find((product_detail) => product_detail.id == selected_product);
                if (product_found) {
                    customer_get_product_items.push({
                        product_id: product_found?.id,
                        product_title: product_found?.title,
                        product_image: product_found?.image?.src,

                        product_variants: product_found?.variants,
                        selected_product_variants: array_column(product_found?.variants, "id"),
                    });
                }
            });
            load_customer_get_product_items();
        }

        if (action_type === "customer_discount_product_items") {
            selected_products.forEach(function (selected_product) {
                const product_found = product_details.find((product_detail) => product_detail.id == selected_product);
                if (product_found) {
                    customer_discount_product_items.push({
                        product_id: product_found?.id,
                        product_title: product_found?.title,
                        product_image: product_found?.image?.src,

                        product_variants: product_found?.variants,
                        selected_product_variants: array_column(product_found?.variants, "id"),
                    });
                }
            });
            load_customer_discount_product_items();
        }

        jQuery("#add_product_model").modal("hide");
        jQuery(".checkbox-product").prop("checked", false);
        jQuery("#trigger_selectall_products").prop("checked", false);
        jQuery(".add_product_model_save").attr("disabled", true);
    });

    /*****************************************
     ***** Select Specific Collections Js
     *****************************************/
    jQuery(document).on("click", ".add_collection_button", function () {
        action_type = jQuery(this).attr("action_type");

        jQuery("input[name='category_search']").val("");
        jQuery("#add_category_modal .items_selected").html("0 items selected");

        load_shopify_collection_modal();
        jQuery("#add_category_modal").modal("show");
    });

    jQuery(document).on("change paste keyup", "input[name='category_search']", function (target, event) {
        load_shopify_collection_modal();
    });

    jQuery("#trigger_selectall_collections").click(function () {
        var is_checked = $(this).is(":checked");
        if (is_checked) {
            jQuery(".category_check").prop("checked", true);
            jQuery(".add_category_modal_save").attr("disabled", false);
        } else {
            jQuery(".category_check").prop("checked", false);
            jQuery(".add_category_modal_save").attr("disabled", true);
        }

        let selected_products = [];
        jQuery(".categories-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });
        jQuery("#add_category_modal .items_selected").html(`${selected_products.length} items selected`);
    });

    jQuery(document).on("click", ".category_check", function (target, event) {
        var is_checked = jQuery("input[type='checkbox'].category_check");

        if (is_checked.filter(":checked").length > 0) {
            jQuery(".add_category_modal_save").attr("disabled", false);
        } else {
            jQuery(".add_category_modal_save").attr("disabled", true);
        }

        if (is_checked.length == is_checked.filter(":checked").length) {
            jQuery("#trigger_selectall_collections").prop("checked", true);
        } else {
            jQuery("#trigger_selectall_collections").prop("checked", false);
        }

        let selected_products = [];
        jQuery(".categories-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });
        jQuery("#add_category_modal .items_selected").html(`${selected_products.length} items selected`);
    });

    jQuery(".add_category_modal_close").click(function () {
        jQuery("#add_category_modal").modal("hide");

        jQuery(".category_check").prop("checked", false);
        jQuery("#trigger_selectall_collections").prop("checked", false);
        jQuery(".add_category_modal_save").attr("disabled", true);
    });

    jQuery(document).on("click", ".add_category_modal_save", function () {
        let selected_products = [];
        jQuery(".categories-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });

        if (action_type === "customer_buy_collection_items") {
            selected_products.forEach(function (selected_product) {
                const product_found = collection_details.find((collection_detail) => collection_detail.id == selected_product);
                customer_buy_collection_items.push({
                    product_id: product_found?.id,
                    product_title: product_found?.title,
                    product_image: product_found?.image?.src,
                    product_description: product_found?.body_html,
                });
            });
            load_customer_buy_collection_items();
        }

        if (action_type === "customer_get_collection_items") {
            selected_products.forEach(function (selected_product) {
                const product_found = collection_details.find((collection_detail) => collection_detail.id == selected_product);
                customer_get_collection_items.push({
                    product_id: product_found?.id,
                    product_title: product_found?.title,
                    product_image: product_found?.image?.src,
                    product_description: product_found?.body_html,
                });
            });
            load_customer_get_collection_items();
        }

        if (action_type === "customer_discount_collection_items") {
            selected_products.forEach(function (selected_product) {
                const product_found = collection_details.find((collection_detail) => collection_detail.id == selected_product);
                customer_discount_collection_items.push({
                    product_id: product_found?.id,
                    product_title: product_found?.title,
                    product_image: product_found?.image?.src,
                    product_description: product_found?.body_html,
                });
            });
            load_customer_discount_collection_items();
        }

        jQuery("#add_category_modal").modal("hide");
        jQuery(".category_check").prop("checked", false);
        jQuery(".checkbox-product").prop("checked", false);
        jQuery("#upsell_trigger_selectall_collections").prop("checked", false);
        jQuery("#add_category").attr("disabled", true);
    });

    /*****************************************
     ***** Select Product Variants Js
     *****************************************/
    jQuery(document).on("click", ".product_varient_update", function () {
        let product_id = jQuery(this).attr("product_id");
        let discount_item_key = jQuery(this).attr("discount_item_key");

        let action_type = jQuery(this).attr("action_type");

        let selected_product_variants;
        if (action_type === "customer_buy_product_items") {
            let customer_buy_product_item = customer_buy_product_items[discount_item_key];
            selected_product_variants = customer_buy_product_item?.selected_product_variants;
        }

        if (action_type === "customer_get_product_items") {
            let customer_get_product_item = customer_get_product_items[discount_item_key];
            selected_product_variants = customer_get_product_item?.selected_product_variants;
        }

        if (action_type === "customer_discount_product_items") {
            let customer_discount_product_item = customer_discount_product_items[discount_item_key];
            selected_product_variants = customer_discount_product_item?.selected_product_variants;
        }

        jQuery(".items_selected").html(`${selected_product_variants.length} items selected`);

        const product_found = product_details.find((product_detail) => product_detail.id == product_id);

        let discount_product_varient_html = "";
        product_found?.variants.forEach((product_varient) => {
            let product_image = product_found?.images?.find((product) => product?.variant_ids?.includes(product_varient?.id));
            let image_src = product_image?.src || product_found?.image?.src;

            let is_checked = jQuery.inArray(product_varient?.id, selected_product_variants) !== -1 ? "checked" : "";
            discount_product_varient_html += `
                <label class="w-100 cursor-pointer">
                    <div class="flex items-center p-2 main-item space-x-5">
                        <input
                            type="checkbox"
                            class="product_variant_check"
                            value="${product_varient?.id}"
                            ${is_checked}
                        />
                        <img
                            src="${image_src}"
                            class="object-contain mx-3 object-center w-12 h-12 border rounded-lg border-black-400"
                        />
                        <span class="text-xs product_title">${product_varient?.title}</span>
                    </div>
                </label>
            `;
        });

        jQuery("#product_variant_picker_model").modal("show");
        jQuery("#product_variant_picker_model .modal-body").html(discount_product_varient_html);

        if (jQuery(".product-variant-body input:checked").length == product_found?.variants?.length) {
            jQuery("#trigger_variant_selectall").prop("checked", true);
        }

        jQuery("#product_variant_picker_model input[name='action_type']").val(action_type);
        jQuery("#product_variant_picker_model input[name='product_varient_index']").val(discount_item_key);
    });

    jQuery("#trigger_variant_selectall").click(function () {
        var is_checked = $(this).is(":checked");
        if (is_checked) {
            jQuery(".product_variant_check").prop("checked", true);
            jQuery(".product_variant_picker_model_save").attr("disabled", false);
        } else {
            jQuery(".product_variant_check").prop("checked", false);
            jQuery(".product_variant_picker_model_save").attr("disabled", true);
        }

        let selected_products = [];
        jQuery(".product-variant-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });
        jQuery("#product_variant_picker_model .items_selected").html(`${selected_products.length} items selected`);
    });

    jQuery(document).on("click", ".product_variant_check", function (target, event) {
        var is_checked = jQuery("input[type='checkbox'].product_variant_check");

        if (is_checked.filter(":checked").length > 0) {
            jQuery(".product_variant_picker_model_save").attr("disabled", false);
        } else {
            jQuery(".product_variant_picker_model_save").attr("disabled", true);
        }

        if (is_checked.length == is_checked.filter(":checked").length) {
            jQuery("#trigger_variant_selectall").prop("checked", true);
        } else {
            jQuery("#trigger_variant_selectall").prop("checked", false);
        }

        let selected_products = [];
        jQuery(".product-variant-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });

        jQuery("#product_variant_picker_model .items_selected").html(`${selected_products.length} items selected`);
    });

    jQuery(".product_variant_picker_model_close").click(function () {
        jQuery("#product_variant_picker_model").modal("hide");
        jQuery("#product_variant_picker_model .modal-body").html("");

        jQuery(".product_variant_check").prop("checked", false);
        jQuery("#trigger_variant_selectall").prop("checked", false);
        jQuery(".product_variant_picker_model_save").attr("disabled", true);
    });

    jQuery(document).on("click", ".product_variant_picker_model_save", function () {
        let selected_product_variants = [];
        jQuery(".product-variant-body input:checked").each(function (index, element) {
            if (!selected_product_variants.includes(element.value)) {
                selected_product_variants.push(parseInt(element.value));
            }
        });

        let action_type = jQuery("#product_variant_picker_model input[name='action_type']").val();
        let product_varient_index = jQuery("#product_variant_picker_model input[name='product_varient_index']").val();

        if (action_type === "customer_buy_product_items") {
            let customer_buy_product_item = customer_buy_product_items[product_varient_index];

            customer_buy_product_item.selected_product_variants = selected_product_variants;
            customer_buy_product_items[product_varient_index] = customer_buy_product_item;

            load_customer_buy_product_items();
        }

        if (action_type === "customer_get_product_items") {
            let customer_get_product_item = customer_get_product_items[product_varient_index];

            customer_get_product_item.selected_product_variants = selected_product_variants;
            customer_get_product_items[product_varient_index] = customer_get_product_item;

            load_customer_get_product_items();
        }

        if (action_type === "customer_discount_product_items") {
            let customer_discount_product_item = customer_discount_product_items[product_varient_index];

            customer_discount_product_item.selected_product_variants = selected_product_variants;
            customer_discount_product_items[product_varient_index] = customer_discount_product_item;

            load_customer_discount_product_items();
        }

        jQuery("#product_variant_picker_model").modal("hide");
        jQuery("#product_variant_picker_model .modal-body").html("");

        jQuery(".product_variant_check").prop("checked", false);
        jQuery("#trigger_variant_selectall").prop("checked", false);
        jQuery(".product_variant_picker_model_save").attr("disabled", true);
    });

    /*****************************************
     ***** Delete Product Js
     *****************************************/
    jQuery(document).on("click", ".product_item_delete", function () {
        let product_id = jQuery(this).attr("product_id");
        let action_type = jQuery(this).attr("action_type");

        if (action_type === "customer_buy_product_items") {
            customer_buy_product_items = jQuery.grep(customer_buy_product_items, function (customer_buy_product_item) {
                return customer_buy_product_item?.product_id != product_id;
            });
            load_customer_buy_product_items();
        }

        if (action_type === "customer_get_product_items") {
            customer_get_product_items = jQuery.grep(customer_get_product_items, function (customer_get_product_item) {
                return customer_get_product_item?.product_id != product_id;
            });
            load_customer_get_product_items();
        }

        if (action_type === "customer_discount_product_items") {
            customer_discount_product_items = jQuery.grep(customer_discount_product_items, function (customer_discount_product_item) {
                return customer_discount_product_item?.product_id != product_id;
            });
            load_customer_discount_product_items();
        }
    });

    /*****************************************
     ***** Delete Collection Js
     *****************************************/
    jQuery(document).on("click", ".collection_item_delete", function () {
        let product_id = jQuery(this).attr("product_id");
        let action_type = jQuery(this).attr("action_type");

        if (action_type === "customer_buy_collection_items") {
            customer_buy_collection_items = jQuery.grep(customer_buy_collection_items, function (customer_buy_collection_item) {
                return customer_buy_collection_item?.product_id != product_id;
            });
            load_customer_buy_collection_items();
        }

        if (action_type === "customer_get_collection_items") {
            customer_get_collection_items = jQuery.grep(customer_get_collection_items, function (customer_get_collection_item) {
                return customer_get_collection_item?.product_id != product_id;
            });
            load_customer_get_collection_items();
        }

        if (action_type === "customer_discount_collection_items") {
            customer_discount_collection_items = jQuery.grep(customer_discount_collection_items, function (customer_discount_collection_item) {
                return customer_discount_collection_item?.product_id != product_id;
            });
            load_customer_discount_collection_items();
        }
    });

    /////////////////////////// Create Automatic Discount Submit
    jQuery("#automatic_discount_create").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        rules: {
            cart_minimum_quantity: { min: 1 },
            cart_minimum_amount: { min: 1 },
            customer_percentage_discount: { min: 1 },
            maximum_discount_usage: { min: 1 },
            maximum_discount_usage_per_order: { min: 1 },
            cart_mini_quantity: { min: 1 },
            cart_amt_quantity: { min: 1 },
            active_end_time: {
                min: jQuery("input[id='active_from_date']").val() === jQuery("input[id='active_to_date']").val() ? jQuery("#active_start_time").val() : "",
            },
        },
        messages: {
            cart_minimum_quantity: {
                min: "Please enter a value greater than 0",
            },
            cart_minimum_amount: {
                min: "Please enter a value greater than 1",
            },
            customer_percentage_discount: {
                min: "Please enter a value greater than 1",
            },
            maximum_discount_usage: {
                min: "Please enter a value greater than 0",
            },
            maximum_discount_usage_per_order: {
                min: "Please enter a value greater than 0",
            },
            cart_mini_quantity: {
                min: "Please enter a value greater than 0",
            },
            cart_amt_quantity: {
                min: "Please enter a value greater than 1",
            },
            exclude_shipping_amount: {
                min: "Please enter a value greater than 1",
            },
            active_end_time: {
                min: "Can't be before start date and time",
            },
        },
        submitHandler: function (form) {
            jQuery("form#automatic_discount_create :submit").attr("disabled", true);
            let formData = new FormData(form);

            formData.append("customer_buy_product_items", JSON.stringify(customer_buy_product_items));
            formData.append("customer_buy_collection_items", JSON.stringify(customer_buy_collection_items));

            formData.append("customer_get_product_items", JSON.stringify(customer_get_product_items));
            formData.append("customer_get_collection_items", JSON.stringify(customer_get_collection_items));

            formData.append("customer_discount_product_items", JSON.stringify(customer_discount_product_items));
            formData.append("customer_discount_collection_items", JSON.stringify(customer_discount_collection_items));

            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: formData,
                url: `${ajax_url}/discount/create`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                    jQuery("form#automatic_discount_create :submit").attr("disabled", false);
                },
                error: function (response) {
                    jQuery.notify({ message: response.message }, { type: "danger" });
                    jQuery("form#automatic_discount_create :submit").attr("disabled", false);
                },
            });
        },
    });

    /////////////////////////// Update Automatic Discount Submit
    jQuery("#automatic_discount_update").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        rules: {
            cart_minimum_quantity: { min: 1 },
            cart_minimum_amount: { min: 1 },
            customer_percentage_discount: { min: 1 },
            maximum_discount_usage: { min: 1 },
            maximum_discount_usage_per_order: { min: 1 },
            cart_mini_quantity: { min: 1 },
            cart_amt_quantity: { min: 1 },
            active_end_time: {
                min: jQuery("input[id='active_from_date']").val() === jQuery("input[id='active_to_date']").val() ? jQuery("#active_start_time").val() : "",
            },
        },
        messages: {
            cart_minimum_quantity: {
                min: "Please enter a value greater than 0",
            },
            cart_minimum_amount: {
                min: "Please enter a value greater than 1",
            },
            customer_percentage_discount: {
                min: "Please enter a value greater than 1",
            },
            maximum_discount_usage: {
                min: "Please enter a value greater than 0",
            },
            maximum_discount_usage_per_order: {
                min: "Please enter a value greater than 0",
            },
            cart_mini_quantity: {
                min: "Please enter a value greater than 0",
            },
            cart_amt_quantity: {
                min: "Please enter a value greater than 1",
            },
            exclude_shipping_amount: {
                min: "Please enter a value greater than 1",
            },
            active_end_time: {
                min: "Can't be before start date and time",
            },
        },
        submitHandler: function (form) {
            jQuery("form#automatic_discount_update :submit").attr("disabled", true);
            let formData = new FormData(form);

            formData.append("customer_buy_product_items", JSON.stringify(customer_buy_product_items));
            formData.append("customer_buy_collection_items", JSON.stringify(customer_buy_collection_items));

            formData.append("customer_get_product_items", JSON.stringify(customer_get_product_items));
            formData.append("customer_get_collection_items", JSON.stringify(customer_get_collection_items));

            formData.append("customer_discount_product_items", JSON.stringify(customer_discount_product_items));
            formData.append("customer_discount_collection_items", JSON.stringify(customer_discount_collection_items));

            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: formData,
                url: `${ajax_url}/discount/edit`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                    jQuery("form#automatic_discount_update :submit").attr("disabled", false);
                },
                error: function (response) {
                    jQuery.notify({ message: response.message }, { type: "danger" });
                    jQuery("form#automatic_discount_update :submit").attr("disabled", false);
                },
            });
        },
    });

    /////////////////////////// Delete Automatic Discount Submit
    jQuery(document).on("click", "#delete_discount", function () {
        let automatic_discount_id = jQuery("input[name='automatic_discount_id']").val();

        bootbox.confirm({
            title: "Alert",
            message: "Are you sure you want to delete?",
            buttons: {
                confirm: {
                    label: "Delete",
                    className: "btn-success",
                },
                cancel: {
                    label: "Cancel",
                    className: "btn-danger",
                },
            },
            callback: function (result) {
                if (result) {
                    jQuery.ajax({
                        type: "POST",
                        dataType: "json",
                        url: `${ajax_url}/delete-discount`,
                        data: {
                            store_id: store_id,
                            id: automatic_discount_id,
                        },
                        success: function (response) {
                            if (response?.status) {
                                jQuery.notify({ message: response.message }, { type: "success" });
                                setTimeout(function () {
                                    window.location.href = response?.redirect_url;
                                }, 1500);
                            } else {
                                jQuery.notify({ message: response.message }, { type: "danger" });
                            }
                        },
                        error: function (response) {
                            jQuery.notify({ message: response.message }, { type: "danger" });
                        },
                    });
                }
            },
        });
    });
});

function load_discount_type(call_type) {
    discount_type = jQuery("input[name='discount_type']:checked").val();

    if (call_type == undefined) {
        jQuery(".discount_type_section").hide();

        jQuery("#percentage_discount_value").attr("required", false);

        jQuery("#specific_order_display_fixed").hide();
        jQuery("#all_items").prop("checked", false);

        // Discount Summary Section Html
        jQuery(".discount_summary").hide();
    }
    jQuery(".discount_type-buy_x_get_y").hide();
    let fromdate = jQuery("#active_from_date").val();

    if (jQuery("#activeEndDate").is(":checked") && jQuery("#active_to_date").val().length != 0) {
        let todate = jQuery("#active_to_date").val();
        let active_start_time = jQuery("#active_start_time").val();
        let active_end_time = jQuery("#active_end_time").val();
        jQuery("#active_date").html("Active from " + moment(fromdate + " " + active_start_time).format("DD MMM YYYY") + " to " + moment(todate + " " + active_end_time).format("DD MMM YYYY"));
    } else {
        jQuery("#active_date").html("Active from " + moment(fromdate).format("DD MMM YYYY"));
    }

    if (discount_type === "buy_x_get_y") {
        jQuery(".discount_type-buy_x_get_y").show();
        jQuery("#order_item").hide();

        if (jQuery("#cart_minimum_amt").is(":checked") === false) {
            jQuery("#cart_minimum_amt").prop("checked", false);
            jQuery("#minimum_quantity_cart").prop("checked", true);
        }
       
        if (jQuery("#discount_percentage").is(":checked") === false) {
            jQuery("#discount_free").prop("checked", true);
            jQuery("#discount_percentage").prop("checked", false);
            jQuery("#discount_rate").html("For Free").show();
        }else{
            jQuery("#discount_rate").html(`Discounted ${$("#customer_percentage_discount").val()}%`).show();
        }

        // Discount Summary Section Html
        jQuery("#active_date").show();
        jQuery("#discount_type").html("Buy X Get Y").show();
        // jQuery("#discount_rate").html("For Free").show();
        if (jQuery("#minimum_quantity_cart").is(":checked")) {
            jQuery("#cart_limit")
                .html(`Minimum quantity reached in cart of ${jQuery("#cart_minimum_quantity").val()} items`)
                .show();
        } else {
            jQuery("#cart_limit")
                .html(`Minimum amount reached in cart of $ ${jQuery("#cart_minimum_amount").val()}`)
                .show();
        }

        // not show
        jQuery(".discount_type-percentage").hide();
    }

    if (discount_type === "percentage") {
        jQuery(".discount_type-fixed_amount").hide();
        jQuery(".discount_type-percentage").show();
        jQuery("input[name='percentage_discount_value']").attr("min", 1);

        jQuery("#percentage_discount_value").attr("required", true);
        jQuery("#percentage_discount_value").attr("max", "100");

        // Discount Summary Section Html
        jQuery("#active_date").show();
        jQuery("#discount_type").html("Percentage").show();
        jQuery("#discount_rate").html("Discounted %").show();

        if (jQuery("#entire_order").is(":checked")) {
            jQuery("#order_item").html("Entire Order").show();
        } else {
            jQuery("#order_item").html("Specific items").show();
        }

        if (jQuery("#minimum_quantity_cart").is(":checked")) {
            jQuery("#cart_limit")
                .html(`Minimum quantity reached in cart of ${jQuery("#cart_minimum_quantity").val()} items`)
                .show();
        } else {
            jQuery("#cart_limit")
                .html(`Minimum amount reached in cart of $ ${jQuery("#cart_minimum_amount").val()}`)
                .show();
        }
    }

    if (discount_type === "fixed_amount") {
        jQuery(".discount_type-percentage").hide();
        jQuery(".discount_type-fixed_amount").show();
        jQuery("input[name='percentage_discount_value']").attr("min", 0.05);

        jQuery("#specific_order_display_fixed").show();
        jQuery("#all_items").prop("checked", true);

        // Discount Summary Section Html
        jQuery("#active_date").show();
        jQuery("#discount_rate").html("Discounted $").show();
        jQuery("#discount_type").html("Fixed Amount").show();
        if (jQuery("#entire_order").is(":checked")) {
            jQuery("#order_item").html("Entire Order").show();
        } else {
            jQuery("#order_item").html("Specific items").show();
        }
    }

    if (discount_type === "free_shipping") {
        jQuery(".discount_type-free_shipping").show();

        // Discount Summary Section Html
        jQuery("#active_date").show();
        jQuery("#discount_rate").hide();
        jQuery("#discount_type").html("Free Shipping").show();
        if (jQuery("#mini_amount_cart_check").is(":checked")) {
            jQuery("#cart_limit")
                .html(`Minimum amount reached in cart of $ ${jQuery("#cart_minimum_amount").val()}`)
                .show();
        } else {
            jQuery("#cart_limit")
                .html(`Minimum quantity reached in cart of ${jQuery("#cart_minimum_quantity").val()} items`)
                .show();
        }
    }

    load_customer_buy_product_items();
    load_customer_buy_collection_items();

    load_customer_get_product_items();
    load_customer_get_collection_items();

    load_customer_discount_product_items();
    load_customer_discount_collection_items();
}

function load_shopify_product_modal() {
    let trigger_product_ids = [];
    if (action_type === "customer_discount_product_items") {
        trigger_product_ids = jQuery(".customer_discount_product_item")
            .map(function () {
                return jQuery(this).attr("product_id");
            })
            .get();
    }

    let product_search = jQuery("input[name='product_search']").val();

    let product_display_count = 0;
    let shopify_product_html = "";
    product_details.forEach((product_detail, product_detail_key) => {
        if (trigger_product_ids.includes(product_detail?.id?.toString())) {
            return false;
        }

        if (product_search) {
            if (product_detail?.title.toLowerCase().indexOf(product_search.toLowerCase()) == -1) {
                return false;
            }
        }

        shopify_product_html += `
            <label class="w-100 cursor-pointer">
                <div class="flex items-center p-2 main-item space-x-5">
                    <input
                        type="checkbox"
                        class="check-product checkbox-product"
                        value="${product_detail.id}"
                    />
                    <img
                        style="max-height: 100px;"
                        src="${product_detail.image ? product_detail.image.src : ""}"
                        class="object-contain ms-3 object-center w-12 h-12 border rounded-lg border-black-400"
                    />
                    <span class="text-xs product_title">${product_detail.title}</span>
                </div>
            </label>
        `;

        product_display_count++;
    });

    if (product_display_count === 0) {
        shopify_product_html = `<span class="text-center">No result found</span>`;
    }

    jQuery("#add_product_model .modal-body").html(shopify_product_html);
}

function load_shopify_collection_modal() {
    let trigger_collection_ids = [];
    if (action_type === "customer_discount_collection_items") {
        trigger_collection_ids = jQuery(".customer_discount_collection_item")
            .map(function () {
                return jQuery(this).attr("product_id");
            })
            .get();
    }

    let category_search = jQuery("input[name='category_search']").val();

    let product_display_count = 0;
    let shopify_collection_html = "";
    collection_details.forEach((collection_detail, collection_detail_key) => {
        if (trigger_collection_ids.includes(collection_detail?.id?.toString())) {
            return false;
        }

        if (category_search) {
            if (collection_detail?.title.toLowerCase().indexOf(category_search.toLowerCase()) == -1) {
                return false;
            }
        }

        shopify_collection_html += `
            <label class="w-100 cursor-pointer">
                <div class="flex items-center p-2 main-item space-x-5">
                    <input
                        type="checkbox"
                        class="check-product category_check"
                        value="${collection_detail?.id}"
                    />
                    <img
                        src="${collection_detail?.image?.src}"
                        class="object-contain mx-3 object-center w-12 h-12 border rounded-lg border-black-400"
                    />
                    <span class="text-xs product_title">${collection_detail?.title}</span>
                </div>
            </label>
        `;

        product_display_count++;
    });

    if (product_display_count === 0) {
        shopify_collection_html = `<span class="text-center">No result found</span>`;
    }

    jQuery("#add_category_modal .modal-body").html(shopify_collection_html);
}

/*****************************************
 ***** Discount Type - Buy X Get Y Functions
 *****************************************/
function load_customer_buy_product_items() {
    let customer_buy_product_item_html = "";
    customer_buy_product_items.forEach((customer_buy_product_item, discount_item_key) => {
        customer_buy_product_item_html += `
            <div
                id="discount_item_${customer_buy_product_item.product_id}"
                class="flex items-center space-x-5 discount-product-item customer_buy_product_item"
                product_id="${customer_buy_product_item.product_id}"
            >
                <div class="main-contan-image">
                    <div class="add_ima">    
                        <img
                            src="${customer_buy_product_item?.product_image}"
                            class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
                        />
                    </div>
                    <div class="tital-add">
                        <p class="tital-add-upsal">${customer_buy_product_item?.product_title}</p>
                        <h6 class="product-variants mt-1 ms-2 text-gray-500" id="${customer_buy_product_item?.product_id}">
                            ${customer_buy_product_item?.selected_product_variants?.length}/${customer_buy_product_item?.product_variants?.length} variant selected
                        </h6>
                    </div>
                </div>
                <div class="delete_one">
                    <i
                        class="bi bi-pencil me-3 product_varient_update"
                        discount_item_key="${discount_item_key}"
                        action_type="customer_buy_product_items"
                        product_id="${customer_buy_product_item?.product_id}"
                    ></i>
                    <i
                        class="bi bi-trash product_item_delete"
                        discount_item_key="${discount_item_key}"
                        action_type="customer_buy_product_items"
                        product_id="${customer_buy_product_item?.product_id}"
                    ></i>
                </div>
            </div>
        `;
    });
    jQuery("#customer_buy_product_item_html").html(customer_buy_product_item_html);
}

function load_customer_buy_collection_items() {
    let customer_buy_collection_item_html = "";
    customer_buy_collection_items.forEach((discount_collection_item, collection_item_key) => {
        customer_buy_collection_item_html += `
            <div
                id="discount_item_${discount_collection_item.product_id}"
                class="flex items-center space-x-5 discount-collection-item customer_buy_collection_item"
                product_id="${discount_collection_item.product_id}"
            >
                <div class="main-contan-image">
                    <div class="add_ima">    
                        <img
                            src="${discount_collection_item?.product_image}"
                            class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
                        />
                    </div>
                    <div class="tital-add"><p class="tital-add-upsal">${discount_collection_item?.product_title}</p></div>
                </div>
                <div class="delete_one">
                    <i
                        class="bi bi-trash collection_item_delete"
                        collection_item_key="${collection_item_key}"
                        action_type="customer_buy_collection_items"
                        product_id="${discount_collection_item?.product_id}"
                    ></i>
                </div>
            </div>
        `;
    });

    jQuery("#customer_buy_collection_item_html").html(customer_buy_collection_item_html);
}

function load_customer_get_product_items() {
    let customer_get_product_item_html = "";
    customer_get_product_items.forEach((customer_get_product_item, discount_item_key) => {
        customer_get_product_item_html += `
            <div
                id="discount_item_${customer_get_product_item.product_id}"
                class="flex items-center space-x-5 discount-product-item customer_get_product_item"
                product_id="${customer_get_product_item.product_id}"
            >
                <div class="main-contan-image">
                    <div class="add_ima">    
                        <img
                            src="${customer_get_product_item?.product_image}"
                            class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
                        />
                    </div>
                    <div class="tital-add">
                        <p class="tital-add-upsal">${customer_get_product_item?.product_title}</p>
                        <h6 class="product-variants mt-1 ms-2 text-gray-500" id="${customer_get_product_item?.product_id}">
                            ${customer_get_product_item?.selected_product_variants?.length}/${customer_get_product_item?.product_variants?.length} variant selected
                        </h6>
                    </div>
                </div>
                <div class="delete_one">
                    <i
                        class="bi bi-pencil me-3 product_varient_update"
                        discount_item_key="${discount_item_key}"
                        action_type="customer_get_product_items"
                        product_id="${customer_get_product_item?.product_id}"
                    ></i>
                    <i
                        class="bi bi-trash product_item_delete"
                        discount_item_key="${discount_item_key}"
                        action_type="customer_get_product_items"
                        product_id="${customer_get_product_item?.product_id}"
                    ></i>
                </div>
            </div>
        `;
    });
    jQuery("#customer_get_product_item_html").html(customer_get_product_item_html);
}

function load_customer_get_collection_items() {
    let customer_get_collection_item_html = "";
    customer_get_collection_items.forEach((discount_collection_item, collection_item_key) => {
        customer_get_collection_item_html += `
            <div
                id="discount_item_${discount_collection_item.product_id}"
                class="flex items-center space-x-5 discount-collection-item customer_get_collection_item"
                product_id="${discount_collection_item.product_id}"
            >
                <div class="main-contan-image">
                    <div class="add_ima">    
                        <img
                            src="${discount_collection_item?.product_image}"
                            class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
                        />
                    </div>
                    <div class="tital-add"><p class="tital-add-upsal">${discount_collection_item?.product_title}</p></div>
                </div>
                <div class="delete_one">
                    <i
                        class="bi bi-trash collection_item_delete"
                        collection_item_key="${collection_item_key}"
                        action_type="customer_get_collection_items"
                        product_id="${discount_collection_item?.product_id}"
                    ></i>
                </div>
            </div>
        `;
    });

    jQuery("#customer_get_collection_item_html").html(customer_get_collection_item_html);
}

/*****************************************
 ***** Discount Type - Percentage Functions
 *****************************************/
function load_customer_discount_product_items() {
    let customer_discount_product_item_html = "";
    customer_discount_product_items.forEach((customer_discount_product_item, discount_item_key) => {
        customer_discount_product_item_html += `
            <div
                id="discount_item_${customer_discount_product_item.product_id}"
                class="flex items-center space-x-5 discount-product-item customer_discount_product_item"
                product_id="${customer_discount_product_item.product_id}"
            >
              <div class="main-contan-image">
                    <div class="add_ima">
                        <img
                            src="${customer_discount_product_item?.product_image}"
                            class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
                        />
                    </div>
                    <div class="tital-add">
                        <p class="tital-add-upsal">${customer_discount_product_item?.product_title}</p>
                        <h6 class="product-variants mt-1 ms-2 text-gray-500" id="${customer_discount_product_item?.product_id}">
                            ${customer_discount_product_item?.selected_product_variants?.length}/${customer_discount_product_item?.product_variants?.length} variant selected
                        </h6>
                    </div>
               </div> 
                <div class="delete_one me-2">
                    <i
                        class="bi bi-pencil me-3 product_varient_update"
                        discount_item_key="${discount_item_key}"
                        action_type="customer_discount_product_items"
                        product_id="${customer_discount_product_item?.product_id}"
                    ></i>
                    <i
                        class="bi bi-trash product_item_delete"
                        discount_item_key="${discount_item_key}"
                        action_type="customer_discount_product_items"
                        product_id="${customer_discount_product_item?.product_id}"
                    ></i>
                </div>
            </div>
        `;
    });
    jQuery("#customer_discount_product_item_html").html(customer_discount_product_item_html);
}

function load_customer_discount_collection_items() {
    let customer_discount_collection_item_html = "";
    customer_discount_collection_items.forEach((discount_collection_item, collection_item_key) => {
        customer_discount_collection_item_html += `
            <div
                id="discount_item_${discount_collection_item.product_id}"
                class="flex items-center space-x-5 discount-collection-item customer_discount_collection_item"
                product_id="${discount_collection_item.product_id}"
            >
                <div class="main-contan-image">
                    <div class="add_ima">    
                        <img
                            src="${discount_collection_item?.product_image}"
                            class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
                        />
                    </div>
                    <div class="tital-add"><p class="tital-add-upsal">${discount_collection_item?.product_title}</p></div>
                </div>
                <div class="delete_one">
                    <i
                        class="bi bi-trash collection_item_delete"
                        collection_item_key="${collection_item_key}"
                        action_type="customer_discount_collection_items"
                        product_id="${discount_collection_item?.product_id}"
                    ></i>
                </div>
            </div>
        `;
    });
    jQuery("#customer_discount_collection_item_html").html(customer_discount_collection_item_html);
}