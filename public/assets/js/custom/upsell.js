
var money_format = (customize_checkout) ? customize_checkout?.money_format : "${{amount}}";

jQuery(document).ready(function () {

    $('input[type=number]').bind('mousewheel DOMMouseScroll', function (e) { return false; });

    jQuery('#flexSwitchCheckDefault').change(function () {
        let upsell_status = jQuery(this).is(':checked');
        if (upsell_status === false) {
            jQuery(".upsell_status").html("Inactive");
        } else {
            jQuery(".upsell_status").html("Active");
        }
    });

    /*****************************************
     ***** Upsell Overlapping triggers Js
    *****************************************/
    jQuery(document).on("click", ".product_trigger_overlap_alert", function () {
        let trigger_product_key = jQuery(this).attr("trigger_product_key");

        let product_trigger_overlap_model_html = `
            <div class="row py-3">
                <div class="col-lg-3 col-sm-12">Title</div>
                <div class="col-lg-4 col-sm-12">Upsell Offers</div>
                <div class="col-lg-3 col-sm-12">Revenue Earned</div>
                <div class="col-lg-2 col-sm-12">Status</div>
            </div>
        `;

        let upsell_trigger = upsell_triggers[trigger_product_key];
        upsell_trigger?.product_trigger_overlaps.map((product_trigger_overlap_key) => {

            let product_trigger_overlap = exist_upsell_lists[product_trigger_overlap_key];

            let upsell_revenue = 0;
            let upsell_performances = product_trigger_overlap?.upsell_performances;
            for (let upsell_performance of upsell_performances) {
                upsell_revenue = parseFloat(upsell_revenue) + parseFloat(upsell_performance?.upsell_revenue);
            }

            let upsell_offers_html = `<div class="upsell_offer_td">`;
            product_trigger_overlap?.upsell_trigger_offers.map((trigger_offer, trigger_offer_key) => {
                upsell_offers_html += (trigger_offer_key > 0) ? `<i class="bi bi-chevron-right"></i>` : "";
                upsell_offers_html += `
                    <div class="upsell_offer product-trigger-overlap-offer">
                        <img src="${trigger_offer?.product_image}" />                
                    </div>
                `
            });
            upsell_offers_html += `</div>`;

            product_trigger_overlap_model_html += `
                <div class="row py-3 border-top">
                    <div class="col-lg-3 col-sm-12">${product_trigger_overlap?.upsell_title}</div>
                    <div class="col-lg-4 col-sm-12">${upsell_offers_html}</div>
                    <div class="col-lg-3 col-sm-12">$${upsell_revenue.toFixed(2)}</div>
                    <div class="col-lg-2 col-sm-12">
                        <div class="form-check form-switch">
                            <input
                                type="checkbox"
                                role="switch"
                                name="product_trigger_overlap_status"
                                class="form-check-input product_trigger_overlap_status"
                                ${product_trigger_overlap?.status == true ? "checked" : ""}
                                
                                upsell_id="${product_trigger_overlap?.id}"
                                trigger_product_key="${trigger_product_key}"
                                product_trigger_overlap_key="${product_trigger_overlap_key}"
                            />
                        </div>
                    </div>
                </div>
            `;
        });

        jQuery("#product_trigger_overlap_model").modal("show");
        jQuery("#product_trigger_overlap_model .modal-body").html(product_trigger_overlap_model_html);
    });

    jQuery(document).on("change", ".product_trigger_overlap_status", function () {

        let upsell_status = jQuery(this).is(':checked');
        let upsell_id = jQuery(this).attr("upsell_id");
        let trigger_product_key = jQuery(this).attr("trigger_product_key");
        let product_trigger_overlap_key = jQuery(this).attr("product_trigger_overlap_key");

        jQuery.ajax({
            type: "POST",
            dataType: "json",
            url: `${ajax_url}/upsell-update`,
            data: {
                store_id: store_id,
                upsell_id: upsell_id,
                upsell_status: upsell_status,
                action: "change_upsell_status"
            },
            success: function (response) {
                if (response?.status) {

                    let product_trigger_overlap = exist_upsell_lists[product_trigger_overlap_key];
                    product_trigger_overlap.status = upsell_status
                    exist_upsell_lists[product_trigger_overlap_key] = product_trigger_overlap;

                    jQuery.notify({ message: response.message }, { type: "success" });
                } else {
                    jQuery.notify({ message: response.message }, { type: "danger" });
                }
            },
            error: function (response) {
                jQuery.notify({ message: response.message }, { type: "danger" });
            },
        });
    });

    jQuery(document).on("click", "#product_trigger_overlap_model_close", function () {
        jQuery("#product_trigger_overlap_model").modal("hide");
    });

    /*****************************************
     ***** Upsell Triggers By product Js
    *****************************************/
    load_upsell_trigger_section();

    jQuery(document).on("click", "#add_product_button", function () {
        jQuery("input[name='product_search']").val("");
        jQuery("#add_product_model .items_selected").html("0 items selected");

        load_upsell_trigger_product();
        jQuery("#add_product_model").modal("show");
    });

    jQuery(document).on("change paste keyup", "input[name='product_search']", function (target, event) {
        load_upsell_trigger_product();
    });

    jQuery("#upsell_trigger_selectall_products").click(function () {
        var is_checked = $(this).is(':checked');
        if (is_checked) {
            jQuery('.check-product').prop("checked", true);
            jQuery('.add_product').attr('disabled', false);
        } else {
            jQuery('.check-product').prop("checked", false);
            jQuery('.add_product').attr('disabled', true);
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
            jQuery('.add_product').attr('disabled', false);
        } else {
            jQuery('.add_product').attr('disabled', true);
        }

        if (is_checked.length == is_checked.filter(":checked").length) {
            jQuery('#upsell_trigger_selectall_products').prop('checked', true)
        } else {
            jQuery('#upsell_trigger_selectall_products').prop('checked', false)
        }

        let selected_products = [];
        jQuery(".products-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });
        jQuery("#add_product_model .items_selected").html(`${selected_products.length} items selected`);
    });

    jQuery('#cancel_btn_products').click(function () {
        jQuery('#add_product_model').modal('toggle');
        jQuery('.checkbox-product').prop('checked', false);
        jQuery('#upsell_trigger_selectall_products').prop('checked', false);
        jQuery('.add_product').attr('disabled', true);
        jQuery('.category-check').prop('checked', false);
    });

    /////////////////////////// Add Checked products
    jQuery(".add_product").click(function () {

        let selected_products = [];
        jQuery(".products-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });

        selected_products.forEach(function (selected_product) {
            const product_found = product_details.find((product_detail) => product_detail.id == selected_product);
            if (product_found) {
                upsell_triggers.push({
                    trigger_type: "product",
                    trigger_id: product_found?.id,
                    trigger_title: product_found?.title,
                    trigger_image: product_found?.image?.src,
                });
            }
        });

        load_upsell_trigger_section();

        jQuery("#add_product_model").modal("hide");
        jQuery('.category-check').prop('checked', false);
        jQuery('.checkbox-product').prop('checked', false);
        jQuery('#selectall-categories').prop('checked', false);

        jQuery('.add_product').attr('disabled', true);
    });

    jQuery(document).on("click", ".upsell_trigger_delete", function (target, event) {
        let trigger_id = jQuery(this).attr("trigger_id");

        let upsell_trigger_id = jQuery(this).attr("upsell_trigger_id");
        if (upsell_trigger_id !== "undefined") {
            upsell_trigger_delete.push(upsell_trigger_id);
        }

        upsell_triggers = jQuery.grep(upsell_triggers, function (upsell_trigger) {
            return upsell_trigger?.trigger_id != trigger_id;
        });

        load_upsell_trigger_section();
    });



    /*****************************************
     ***** Upsell Triggers By category Js
    *****************************************/
    jQuery(document).on("click", "#add_category_button", function () {
        jQuery("input[name='category_search']").val("");
        jQuery("#add_category_modal .items_selected").html("0 items selected");

        load_upsell_trigger_category();
        jQuery("#add_category_modal").modal("show");
    });

    jQuery("#upsell_trigger_selectall_collections").click(function () {
        var is_checked = $(this).is(':checked');
        if (is_checked) {
            jQuery('.category_check').prop("checked", true);
            jQuery('#add_category').attr('disabled', false);
        } else {
            jQuery('.category_check').prop("checked", false);
            jQuery('#add_category').attr('disabled', true);
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
            jQuery('#add_category').attr('disabled', false);
        } else {
            jQuery('#add_category').attr('disabled', true);
        }

        if (is_checked.length == is_checked.filter(":checked").length) {
            jQuery('#upsell_trigger_selectall_collections').prop('checked', true)
        } else {
            jQuery('#upsell_trigger_selectall_collections').prop('checked', false)
        }

        let selected_products = [];
        jQuery(".categories-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });
        jQuery("#add_category_modal .items_selected").html(`${selected_products.length} items selected`);
    })

    jQuery(document).on("click", "#add_category", function () {

        let selected_products = [];
        jQuery(".categories-body input:checked").each(function (index, element) {
            if (!selected_products.includes(element.value)) {
                selected_products.push(element.value);
            }
        });

        selected_products.forEach(function (selected_product) {
            const product_found = collection_details.find((collection_detail) => collection_detail.id == selected_product);
            upsell_triggers.push({
                trigger_type: "category",
                trigger_id: product_found?.id,
                trigger_title: product_found?.title,
                trigger_image: product_found?.image?.src,
            });
        });

        load_upsell_trigger_section();

        jQuery("#add_category_modal").modal("hide");
        jQuery('.category_check').prop('checked', false);
        jQuery('.checkbox-product').prop('checked', false);
        jQuery('#upsell_trigger_selectall_collections').prop('checked', false);
        jQuery('#add_category').attr('disabled', true);
    });

    jQuery('#cancel_btn_categories').click(function () {
        jQuery('#add_category_modal').modal("hide");

        jQuery('.category_check').prop('checked', false);
        jQuery('.checkbox-product').prop('checked', false);
        jQuery('#upsell_trigger_selectall_collections').prop('checked', false);
        jQuery('#add_category').attr('disabled', true);
    });

    jQuery(document).on("change paste keyup", "input[name='category_search']", function (target, event) {
        load_upsell_trigger_category();
    });



    /*****************************************
     ***** Post-Purchase Upsell Offers Js
    *****************************************/
    load_upsell_offer_section();

    jQuery(".upsell_offer_sortable").sortable({
        opacity: 0.6,
        items: ".upsell_offer_sortable_item",
        stop: function (event, ui) {

            let new_trigger_offers = [];
            let old_trigger_offers = upsell_trigger_offers;
            jQuery('.upsell_offer_sortable_item').map(function (sortable_index) {
                let trigger_offer_key = jQuery(this).attr('trigger_offer_key');

                // Get Trigger Offer from array
                let upsell_trigger_offer = old_trigger_offers[trigger_offer_key];

                // Change the Price and compare at price value
                upsell_trigger_offer.sort_order = sortable_index;

                // Update the value in the same array
                new_trigger_offers.push(upsell_trigger_offer)
            });
            upsell_trigger_offers = new_trigger_offers;

            load_upsell_offer_section();
        }
    });

    /////////////////////////// Select a product to upsell
    jQuery(document).on("click", ".upsell_offer_product", function () {
        jQuery("input[name='offers_product_search']").val("");

        let trigger_offer_key = jQuery(this).closest(".upsell_offer_section").attr("trigger_offer_key");
        jQuery("#upsell_offer_product_modal input[name='sort_order']").val(trigger_offer_key);

        load_upsell_offer_product();
        jQuery("#upsell_offer_product_modal").modal("show");
    });

    jQuery(document).on("click", ".radio-upsell", function (target, event) {
        jQuery('#upsell_offer_product_add').attr('disabled', false);
    });

    jQuery(document).on("click", "#upsell_offer_product_add", function (target, event) {
        let trigger_offer_key = jQuery("#upsell_offer_product_modal input[name='sort_order']").val();
        let upsell_product = jQuery(".upsell_offer_product_body input:checked").val();

        const product_found = product_details.find((product_detail) => product_detail.id == upsell_product);

        let selected_variants = product_found?.variants[0];
        let product_price = selected_variants?.price
        let compare_at_price = selected_variants?.compare_at_price ? selected_variants?.compare_at_price : selected_variants?.price;

        upsell_trigger_offers[trigger_offer_key] = {
            sort_order: trigger_offer_key,

            product_quantity: 1,
            product_id: product_found?.id,
            product_title: product_found?.title,
            product_image: product_found?.image?.src,
            product_description: product_found?.body_html,

            product_varient_id: selected_variants?.id,
            product_variants: product_found?.variants,
            product_variant_count: product_found?.variants?.length,

            product_price: product_price,
            compare_at_price: compare_at_price,
        };

        load_upsell_offer_section();

        jQuery("#upsell_offer_product_modal").modal("hide");
    });

    jQuery('#upsell_offer_product_cancel').click(function () {
        jQuery('.radio-upsell').prop('checked', false);
        jQuery('#upsell_offer_product_modal').modal('hide');
    });

    jQuery(document).on("change paste keyup", "input[name='offers_product_search']", function (target, event) {
        load_upsell_offer_product();
    });

    /////////////////////////// Edit Upsell Product Variants
    jQuery(document).on("click", ".upsell_offer_variants_update", function (target, event) {
        let trigger_offer_key = jQuery(this).attr("trigger_offer_key");
        let upsell_trigger_offer = upsell_trigger_offers[trigger_offer_key];

        jQuery(".edit_upsell_variant_offer_body").html(`
            <div class="flex items-center px-3 space-x-5 offer_type">
                <input type="hidden" name="trigger_offer_key" value="${trigger_offer_key}" />
                <div class="add_ima">
                    <div class="image-add">
                        <img
                            class="object-contain img-respo object-center w-12 h-12 border rounded-lg border-black-400"
                            src="${upsell_trigger_offer?.product_image ? upsell_trigger_offer.product_image : ''}"
                        />
                    </div>
                    <div class="tital-add">
                        <span class="tital-add-upsal">${upsell_trigger_offer.product_title}</span>
                        <h6 class="product-variants mt-1 ms-2 text-gray-500" id="${upsell_trigger_offer.product_id}">
                            ${upsell_trigger_offer.product_variants.length}/${upsell_trigger_offer.product_variants.length} variant selected
                        </h6>
                    </div>
                </div>
                <div class="items-center">
                    <span class="text-xs font-bold">Default price for all variants</span>
                    <input
                        type="number"
                        step="any" min="0"
                        class="form-control required"
                        name="trigger_offer_price"
                        value="${upsell_trigger_offer?.product_price}"
                    />
                </div>
                <div class="items-center">
                    <span class="text-xs font-bold">Default compare price for all variants</span>
                    <input
                        type="number"
                        step="any" min="0"
                        class="form-control ms-2 required"
                        name="trigger_offer_compare_at_price"
                        value="${upsell_trigger_offer?.compare_at_price}"
                    />
                </div>
            </div>            
        `);

        jQuery('#edit_upsell_variant_offer_modal').modal('show');
    });

    jQuery('#edit_upsell_variant_offer_cancel').click(function () {
        jQuery('#edit_upsell_variant_offer_modal').modal('hide');
    });

    jQuery(document).on("click", "#edit_upsell_variant_offer_update", function (target, event) {
        let trigger_offer_price = jQuery("input[name='trigger_offer_price']").val();
        let trigger_offer_compare_at_price = jQuery("input[name='trigger_offer_compare_at_price']").val();
        let trigger_offer_key = jQuery(".edit_upsell_variant_offer_body input[name='trigger_offer_key']").val();

        // Get Trigger Offer from array
        let trigger_offer = upsell_trigger_offers[trigger_offer_key];

        // Change the Price and compare at price value
        trigger_offer.product_price = trigger_offer_price;
        trigger_offer.compare_at_price = trigger_offer_compare_at_price;

        // Update the value in the same array
        upsell_trigger_offers[trigger_offer_key] = trigger_offer;

        load_upsell_offer_section();

        jQuery('#edit_upsell_variant_offer_modal').modal('hide');
    });

    /////////////////////////// delete Upsell offer
    jQuery(document).on("click", ".upsell_offer_product_delete", function (target, event) {
        let product_id = jQuery(this).attr("product_id");

        let upsell_trigger_offer_id = jQuery(this).attr("upsell_trigger_offer_id");
        if (upsell_trigger_offer_id !== "undefined") {
            upsell_trigger_offers_delete.push(upsell_trigger_offer_id);
        }

        upsell_trigger_offers = jQuery.grep(upsell_trigger_offers, function (upsell_trigger_offer) {
            return upsell_trigger_offer?.product_id != product_id;
        });
        upsell_trigger_offers.push({});
        load_upsell_offer_section();
    });


    jQuery(document).on("change paste keyup", "input[name='upsell_title']", function () {
        let upsell_title = jQuery("input[name='upsell_title']").val();
        jQuery(".upsell_title_summery").html(upsell_title);
    })

    /////////////////////////// Create Upsell Submit
    jQuery(document).on("click", "#create_upsell", function () {
        let upsell_title = jQuery("input[name='upsell_title']").val();
        let upsell_status = jQuery('#flexSwitchCheckDefault').is(':checked');

        if (!upsell_title.trim()) {
            jQuery.notify({ message: "Upsell Title field is required" }, { type: "danger" });
        } else {
            jQuery("body").addClass("loader-animation");
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: `${ajax_url}/upsell/create`,
                data: {
                    store_id: store_id,
                    upsell_title: upsell_title,
                    upsell_status: upsell_status,
                    upsell_triggers: JSON.stringify(upsell_triggers),
                    upsell_trigger_offers: JSON.stringify(upsell_trigger_offers),
                },
                success: function (response) {
                    if (response?.status) {
                        window.location.href = response?.redirect_url;
                        return true;
                    } else {
                        jQuery("body").removeClass("loader-animation");
                        jQuery.notify({ message: response?.message }, { type: "danger" });
                    }
                },
                error: function (error) {
                    jQuery("body").removeClass("loader-animation");
                    jQuery.notify({ message: error.message }, { type: "danger" });
                },
            });
        }
    });

    /////////////////////////// Update Upsell Submit
    jQuery(document).on("click", "#update_upsell", function () {
        let upsell_title = jQuery("input[name='upsell_title']").val();
        let upsell_status = jQuery('#flexSwitchCheckDefault').is(':checked');

        if (!upsell_title.trim()) {
            jQuery.notify({ message: "Upsell Title field is required" }, { type: "danger" });
        } else {
            jQuery("body").addClass("loader-animation");
            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: `${ajax_url}/upsells/edit`,
                data: {
                    store_id: store_id,
                    upsell_id: upsell_id,
                    upsell_title: upsell_title,
                    upsell_status: upsell_status,

                    upsell_triggers: JSON.stringify(upsell_triggers),
                    upsell_trigger_delete: JSON.stringify(upsell_trigger_delete),

                    upsell_trigger_offers: JSON.stringify(upsell_trigger_offers),
                    upsell_trigger_offers_delete: JSON.stringify(upsell_trigger_offers_delete),
                },
                success: function (response) {
                    if (response?.status) {
                        window.location.href = window.location.href;
                        jQuery.notify({ message: response.message }, { type: "success" });
                        return true;
                    } else {
                        jQuery("body").removeClass("loader-animation");
                        jQuery.notify({ message: response?.message }, { type: "danger" });
                    }
                },
                error: function (error) {
                    jQuery("body").removeClass("loader-animation");
                    jQuery.notify({ message: error.message }, { type: "danger" });
                },
            });
        }
    });

    /////////////////////////// Delete Upsell Submit
    jQuery(document).on("click", "#delete_upsell", function () {
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
                    jQuery("body").addClass("loader-animation");
                    jQuery.ajax({
                        type: "delete",
                        dataType: "json",
                        url: `${ajax_url}/delete-upsell`,
                        data: {
                            store_id: store_id,
                            upsell_id: jQuery(".upsell_uuid").val(),
                        },
                        success: function (response) {
                            if (response?.status) {
                                jQuery.notify({ message: response.message }, { type: "success" });
                                setTimeout(function () { window.location.href = response?.redirect_url; }, 1500);
                            } else {
                                jQuery("body").removeClass("loader-animation");
                                jQuery.notify({ message: response.message }, { type: "danger" });
                            }
                        },
                        error: function (response) {
                            jQuery("body").removeClass("loader-animation");
                            jQuery.notify({ message: response.message }, { type: "danger" });
                        },
                    });
                }
            }
        });
    });


    /*****************************************
    ***** Upsell Performance Js
    *****************************************/
    jQuery(".performance_filter").flatpickr({
        allowInput: false,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        defaultDate: "today",
        maxDate: moment().format('YYYY-MM-DD'),
    });

    get_performance_filter_records();
    jQuery(document).on("change", ".performance_filter", function () {
        get_performance_filter_records();
    });
});

/*****************************************
 ***
 * Upsell Triggers Section HTML
 ***
*****************************************/
function load_upsell_trigger_section() {

    let upsell_trigger_product_html = "";
    let upsell_trigger_category_html = "";

    let trigger_summery_count = 0;
    let trigger_summery_html = "";
    let trigger_summery_more_html = "";

    upsell_triggers.forEach((upsell_trigger, upsell_trigger_key) => {

        // Check Product trigger overlaps
        let product_trigger_overlaps = [];
        exist_upsell_lists.filter((exist_upsell_list, exist_upsell_key) => {
            exist_upsell_list?.upsell_triggers.filter((exist_upsell_trigger) => {
                if (exist_upsell_trigger?.trigger_id == upsell_trigger?.trigger_id) {
                    product_trigger_overlaps.push(exist_upsell_key);
                }
            });
        });

        upsell_triggers[upsell_trigger_key]["product_trigger_overlaps"] = product_trigger_overlaps;

        let product_trigger_overlap_html = '';
        if (product_trigger_overlaps.length > 0) {
            product_trigger_overlap_html = `
            <div class="flex flex-col text-center md:text-left md:flex-row items-center space-y-2 md:space-y-0 product-trigger-overlap">
                <div class="text-sm text-gray-500">
                    <svg class="w-front-icons h-front-icons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="flex ml-1 text-xs font-medium text-gray-500 space-x-1"><div>Product trigger overlaps.</div></div>
                <button
                    type="button"
                    class="ml-1 text-xs text-green-500 what-css-txt product_trigger_overlap_alert"
                    trigger_id="${upsell_trigger?.trigger_id}" trigger_product_key="${upsell_trigger_key}">What's that?</button>
            </div>        
            `;
        }

        if (upsell_trigger?.trigger_type === "product") {
            upsell_trigger_product_html += `
				<div
					id="upsell_trigger_${upsell_trigger.trigger_id}"
					class="flex items-center space-x-5 upsell_triggers upsell_trigger_product"
					data-trigger-type="product"
					product_ids="${upsell_trigger.trigger_id}"
				>
					<div class="add_ima">    
						<img
							src="${upsell_trigger?.trigger_image}"
							class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
						/>
						<span class="text-xs" id="trigger_title" value="${upsell_trigger?.trigger_title}">
							${upsell_trigger?.trigger_title}
						</span>
					</div>
                    ${product_trigger_overlap_html}
					<div class="delete_one">
                        <img class="upsell_trigger_delete" src="/assets/img/deleet.png" 
                            trigger_id="${upsell_trigger?.trigger_id}" trigger_product_key="${upsell_trigger_key}"
                            upsell_trigger_id="${upsell_trigger?.id}" upsell_trigger_uuid="${upsell_trigger?.upsell_trigger_uuid}"
                        >
					</div>
				</div>
			`;
        }

        if (upsell_trigger?.trigger_type === "category") {
            upsell_trigger_category_html += `
				<div
					id="upsell_trigger_${upsell_trigger.trigger_id}"
					class="flex items-center space-x-5 upsell_triggers upsell_trigger_category"
					data-trigger-type="category"
					product_ids="${upsell_trigger.trigger_id}"
				>
					<div class="add_ima">    
						<img
							src="${upsell_trigger?.trigger_image}"
							class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
						/>
						<span class="text-xs" id="trigger_title" value="${upsell_trigger?.trigger_title}">
							${upsell_trigger?.trigger_title}
						</span>
					</div>
                    ${product_trigger_overlap_html}
					<div class="delete_one">
                    <img class="upsell_trigger_delete" src="/assets/img/deleet.png"
                        trigger_id="${upsell_trigger?.trigger_id}" trigger_product_key="${upsell_trigger_key}"
                        upsell_trigger_id="${upsell_trigger?.id}" upsell_trigger_uuid="${upsell_trigger?.upsell_trigger_uuid}"
                    >
					</div>
				</div>
			`;
        }

        if (upsell_trigger_key <= 2) {
            trigger_summery_html += (upsell_trigger_key > 0) ? `<span class="text-xs text-gray-500">OR</span>` : "";
            trigger_summery_html += `
                <div class="flex items-center trigger-${upsell_trigger?.trigger_id}">
                    <img
                        class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
                        src="${upsell_trigger?.trigger_image}"
                    />
                </div>
            `;
        } else {
            trigger_summery_count = parseInt(trigger_summery_count) + 1;
            trigger_summery_more_html += `
                <div class="upsell_trigger">
                    <div class="trigger_image"><img src="${upsell_trigger?.trigger_image}" /></div>
                    <div class="trigger_title">${upsell_trigger?.trigger_title}</div>
                </div>            
            `
        }
    });

    if (trigger_summery_count > 0) {
        trigger_summery_html += `
            <div class="trigger_more">
                <span class="text-xs text-gray-500">OR</span>
                <span class="show-item"> [+ ${trigger_summery_count} more]</span>
                <div class="has-inline-tooltip">
                    ${trigger_summery_more_html}
                </div>
            </div>
        `;
    }

    jQuery(".trigger_summery_section").html(trigger_summery_html);
    jQuery(".selected-products").html(upsell_trigger_product_html);
    jQuery(".selected_collections").html(upsell_trigger_category_html);

    if (jQuery('.upsell_triggers').length && jQuery('.trigger_offer_0').length) {
        jQuery('#create_upsell').prop('disabled', false);
        jQuery('#update_upsell').prop('disabled', false);
    } else {
        jQuery('#create_upsell').prop('disabled', true);
        jQuery('#update_upsell').prop('disabled', true);
    }
}

/*****************************************
 ***** Upsell Triggers By product functions
*****************************************/
function load_upsell_trigger_product() {

    let upsell_trigger_product_ids = jQuery('.upsell_trigger_product').map(function () {
        return jQuery(this).attr('product_ids');
    }).get();

    let product_search = jQuery("input[name='product_search']").val();

    let product_display_count = 0;
    let upsell_trigger_products = "";
    product_details.forEach((product_detail, product_detail_key) => {

        if (upsell_trigger_product_ids.includes(product_detail?.id?.toString())) {
            return false;
        }

        if (product_search) {
            if (product_detail?.title.toLowerCase().indexOf(product_search.toLowerCase()) == -1) {
                return false;
            }
        }

        upsell_trigger_products += `
            <label class="w-100 cursor-pointer">
                <div class="flex items-center p-2 main-item space-x-5">
                    <input
                        type="checkbox"
                        class="check-product checkbox-product"
                        value="${product_detail.id}"
                    />
                    <img
                        style="max-height: 100px;"
                        src="${product_detail.image ? product_detail.image.src : ''}"
                        class="object-contain ms-3 object-center w-12 h-12 border rounded-lg border-black-400"
                    />
                    <span class="text-xs product_title">${product_detail.title}</span>
                </div>
            </label>
        `;

        product_display_count++;
    });

    if (product_display_count === 0) {
        upsell_trigger_products = `<span class="text-center">No result found</span>`;
    }

    jQuery("#add_product_model .modal-body").html(upsell_trigger_products);
}

/*****************************************
 ***** Upsell Triggers By category functions
*****************************************/
function load_upsell_trigger_category() {

    let upsell_trigger_category_ids = jQuery('.upsell_trigger_category').map(function () {
        return jQuery(this).attr('product_ids');
    }).get();

    let category_search = jQuery("input[name='category_search']").val();

    let product_display_count = 0;
    let upsell_trigger_category = "";
    collection_details.forEach((collection_detail, collection_detail_key) => {

        if (upsell_trigger_category_ids.includes(collection_detail?.id?.toString())) {
            return false;
        }

        if (category_search) {
            if (collection_detail?.title.toLowerCase().indexOf(category_search.toLowerCase()) == -1) {
                return false;
            }
        }

        upsell_trigger_category += `
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
        upsell_trigger_category = `<span class="text-center">No result found</span>`;
    }

    jQuery("#add_category_modal .modal-body").html(upsell_trigger_category);
}

/*****************************************
 ***** Post-Purchase Upsell Offers Functions
*****************************************/
function load_upsell_offer_section() {

    let upsell_offers_active = "";
    let trigger_offer_count = 1;

    let upsell_offer_html = '';
    let offer_summery_section_count = 1;
    let offer_summery_section_html = '';
    upsell_trigger_offers.forEach((upsell_trigger_offer, upsell_trigger_offer_key) => {

        let upsell_offer_sortable_item_class = "";
        let upsell_offer_product_content_html = "";

        if (upsell_trigger_offer?.product_title) {

            upsell_offers_active = upsell_trigger_offer_key;
            upsell_offer_sortable_item_class = "upsell_offer_sortable_item";

            upsell_offer_product_content_html = `
                <div
                    product_id="${upsell_trigger_offer.product_id}"
                    class="flex items-center px-3 py-2 space-x-5 offer_type purchase_upsell_offers_product trigger_offer_${upsell_trigger_offer_key}"
                >
                    <div class="add_ima">
                        <div class="image-add">
                            <svg class="w-front-icons h-front-icons" fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                                <path d="M0 0h24v24H0V0z" fill="none"></path>
                                <path
                                    d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                                ></path>
                            </svg>
                            <img
                            src="${upsell_trigger_offer?.product_image ? upsell_trigger_offer?.product_image : ''}"
                                class="object-contain ms-3 img-respo object-center w-12 h-12 border rounded-lg border-black-400"
                            />
                        </div>
                        <div class="tital-add">
                            <p class="tital-add-upsal">${upsell_trigger_offer?.product_title}</p>
                            <h6 class="product-variants mt-1 ms-2 text-gray-500" id="${upsell_trigger_offer?.product_id}">
                                ${upsell_trigger_offer?.product_variants?.length}/${upsell_trigger_offer?.product_variants?.length} variant selected
                            </h6>
                        </div>
                    </div>
                    <div class="delete_one me-2 action-upsells">
                        <img class="me-3 upsell_offer_variants_update" src="/assets/img/editt-logo.svg" product_id="${upsell_trigger_offer?.product_id}"
                        trigger_offer_key="${upsell_trigger_offer_key}"
                        upsell_trigger_offer_id="${upsell_trigger_offer?.id}"
                        upsell_trigger_offer_uuid="${upsell_trigger_offer?.upsell_trigger_offer_uuid}">

                        <img class="upsell_offer_product_delete" src="/assets/img/deleet.png" product_id="${upsell_trigger_offer?.product_id}"
                        trigger_offer_key="${upsell_trigger_offer_key}"
                        upsell_trigger_offer_id="${upsell_trigger_offer?.id}"
                        upsell_trigger_offer_uuid="${upsell_trigger_offer?.upsell_trigger_offer_uuid}">
                    </div>
                </div>        
            `;

            if (offer_summery_section_count > 1) {
                offer_summery_section_html += `
                    <div class="offer-summery-item-svg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-front-icons h-front-icons" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                            <path d="M0 0h24v24H0V0z" fill="none"></path>
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"></path>
                        </svg>
                    </div>
                `;
            }

            offer_summery_section_html += `
                <div class=" items-center py-4 px-2 offer-summery-item offer-${upsell_trigger_offer?.product_id}">
                    <img
                        src="${upsell_trigger_offer?.product_image ? upsell_trigger_offer?.product_image : ''}"
                        class="object-contain object-center w-12 h-12 border rounded-lg border-black-400"
                    />
                    <p>Offer ${offer_summery_section_count}</p>
                </div>
            `;
            offer_summery_section_count++;

        } else {
            upsell_offer_product_content_html = `
                <button
                    type="button"
                    class="upsell_offer_product add-btn-upp-iteam bg-white border-0"
                    id="add_upsell_offer_product_button_${upsell_trigger_offer_key}"
                >
                    <div class="text-sm text-gray d-flex align-items-center">
                        <span class="text-green">
                            <svg class="plusImg" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M1.17157 1.17157C0 2.34315 0 4.22876 0 8V10C0 13.7712 0 15.6569 1.17157 16.8284C2.34315 18 4.22876 18 8 18H10C13.7712 18 15.6569 18 16.8284 16.8284C18 15.6569 18 13.7712 18 10V8C18 4.22876 18 2.34315 16.8284 1.17157C15.6569 0 13.7712 0 10 0H8C4.22876 0 2.34315 0 1.17157 1.17157ZM8 4V8L4 8V10H8V14H10V10H14V8H10V4H8Z" fill="#333333"/>
                            </svg>
                        
                        </span>
                        <span class="text-gray">Select a product to upsell</span>
                    </div>
                </button>
            `;
        }

        upsell_offer_html += `
            <div
                class="pt-0 space-y-2 col-lg-12 mb-3 upsell_offer_section ${upsell_offer_sortable_item_class}"
                trigger_offer_key="${upsell_trigger_offer_key}" product_id="${upsell_trigger_offer?.product_id}"
            >
                <span class="block text-sm font-bold">Offer #${trigger_offer_count}</span>
                <div class="offerClass border mt-2 rounded">
                    <div class="d-flex justify-content-center w-100">
                        ${upsell_offer_product_content_html}
                    </div>
                </div>
            </div>
        `;

        trigger_offer_count++;
    });

    jQuery(".upsell_offer_html").html(upsell_offer_html);
    jQuery(".offer_summery_section").html(offer_summery_section_html);

    if (jQuery('.upsell_triggers').length && jQuery('.trigger_offer_0').length) {
        jQuery('#create_upsell').prop('disabled', false);
        jQuery('#update_upsell').prop('disabled', false);
    } else {
        jQuery('#create_upsell').prop('disabled', true);
        jQuery('#update_upsell').prop('disabled', true);
    }

    jQuery(".upsell_offer_product").attr('disabled', false);
    if (upsell_offers_active !== "") {
        if (upsell_offers_active == 0) {
            jQuery("#add_upsell_offer_product_button_2").attr('disabled', true);
        }
    } else {
        jQuery("#add_upsell_offer_product_button_1").attr('disabled', true);
        jQuery("#add_upsell_offer_product_button_2").attr('disabled', true);
    }
}

function load_upsell_offer_product() {

    let purchase_upsell_offers_product_ids = jQuery('.purchase_upsell_offers_product').map(function () {
        return jQuery(this).attr('product_id');
    }).get();

    let offers_product_search = jQuery("input[name='offers_product_search']").val();

    let product_display_count = 0;
    let upsell_offer_product_html = "";
    product_details.forEach((product_detail, product_detail_key) => {

        if (purchase_upsell_offers_product_ids.includes(product_detail?.id?.toString())) {
            return false;
        }

        if (offers_product_search) {
            if (product_detail?.title.toLowerCase().indexOf(offers_product_search.toLowerCase()) == -1) {
                return false;
            }
        }

        upsell_offer_product_html += `
            <label class="w-100 cursor-pointer">
                <div class="flex items-center p-2 main-item space-x-5">
                    <input
                        type="radio"
                        class="radio-upsell"
                        name="upsell-product1"
                        value="${product_detail.id}"
                    />
                    <img
                        class="object-contain ms-3 object-center w-12 h-12 border rounded-lg border-black-400"
                        style="max-height: 100px;"
                        src="${product_detail.image ? product_detail.image.src : ''}"
                    />
                    <span class="text-xs product_title">${product_detail.title}</span>
                </div>
            </label>
        `;

        product_display_count++;
    });

    if (product_display_count === 0) {
        upsell_offer_product_html = `<span class="text-center">No result found</span>`;
    }

    jQuery("#upsell_offer_product_modal .modal-body").html(upsell_offer_product_html);
}

/*****************************************
***** Upsell Performance Functions
*****************************************/
function get_performance_filter_records() {

    let performance_start = jQuery("input[name='performance_start']").val();
    let performance_end = jQuery("input[name='performance_end']").val();

    if (performance_end < performance_start) {
        jQuery.notify({ message: "Start date can't be greater than End date" }, { type: "danger" });
        return
    }

    if (performance_start && performance_end) {
        jQuery.ajax({
            type: "post",
            dataType: "json",
            url: `${ajax_url}/upsell/performance`,
            data: {
                store_id: store_id,
                upsell_id: upsell_id,
                performance_end: performance_end,
                performance_start: performance_start,
            },
            success: function (response) {
                if (response?.status) {
                    upsell_performance_record = response?.data;
                    load_upsell_performance_section();
                } else {
                    jQuery.notify({ message: response.message }, { type: "danger" });
                }
            },
            error: function (response) {
                jQuery.notify({ message: response.message }, { type: "danger" });
            },
        });
    }
}

async function load_upsell_performance_section() {
    jQuery(".upsell_performance_section").html(`
        <div class="col-lg-3 col-md-6">
            <div class="data-prst persnt pt-4 px-3 pb-3">
                <h2 class="text-degin-prtisht">${upsell_performance_record?.upsell_conversion_rate?.toFixed(2)}%</h2>
                <p class="p_degin-pertisht">CONVERSION RATE</p>
            </div>
        </div>
        <div class="col-lg-3 col-md-6">
            <div class="data-prst persnt pt-4 px-3 pb-3">
                <h2 class="text-degin-prtisht">${upsell_performance_record?.upsell_times_shown}</h2>
                <p class="p_degin-pertisht">TIMES SHOWN</p>
            </div>
        </div>
        <div class="col-lg-3 col-md-6">
            <div class="data-prst persnt pt-4 px-3 pb-3">
                <h2 class="text-degin-prtisht">${upsell_performance_record?.upsell_purchased}</h2>
                <p class="p_degin-pertisht">TIMES PURCHASED</p>
            </div>
        </div>
        <div class="col-lg-3 col-md-6">
            <div class="data-prst persnt pt-4 px-3 pb-3">
                <h2 class="text-degin-prtisht">${await shopify_money_format(upsell_performance_record?.upsell_revenue, money_format)}</h2>
                <p class="p_degin-pertisht">UPSELL REVENUE</p>
            </div>
        </div>
    `);
}