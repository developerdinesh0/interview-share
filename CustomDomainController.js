const moment = require("moment");

const models = require("../models");

module.exports.custom_domain = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    // Post Action
    if (req.method === "POST") {
        try {
            let request_body = req.body;

            request_body.user_id = auth_user?.id;
            request_body.custom_domain = `${request_body?.subdomain_name}.${request_body?.domain_name}`;

            await models.CustomDomain.create(request_body);

            return res.json({
                status: true,
                message: "Domain setup successfully",
                redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/custom-domain/edit`,
            });
        } catch (error) {
            console.error("custom_domain error -----------------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    try {
        let domain_name = auth_store?.store_domain?.replace(/^www\./, "");
        if (domain_name.indexOf("myshopify.com") !== -1) {
            domain_name = "myshopify.com";
        }

        let custom_domain = await models.CustomDomain.findOne({
            where: {
                store_id: store_id,
            },
        });

        return res.render("backend/CustomDomain/index", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "custom-domain",

            domain_name: domain_name,
            custom_domain: custom_domain,
        });
    } catch (error) {
        console.error("custom_domain error -----------------", error);
        res.render("404");
    }
};

const dns = require("dns");
function hostnameExists(hostname) {
    return new Promise((resolve) => {
        dns.lookup(hostname, (error) => resolve({ hostname, exists: !error }));
    });
}

module.exports.edit_custom_domain = async (req, res, next) => {
    const { store_id } = req.params;
    const { auth_user, auth_store } = req;

    // Post Action
    if (req.method === "POST") {
        try {
            let request_body = req.body;

            let custom_domain = await models.CustomDomain.findOne({
                where: {
                    store_id: request_body?.store_id,
                },
            });
            if (!custom_domain?.custom_domain) {
                return res.json({
                    status: false,
                    message: "Record not found.",
                });
            }

            if (request_body?.action === "pending_verification") {
                let dns_response = await hostnameExists(custom_domain?.custom_domain);
                if (dns_response?.exists === true) {
                    if (process.env.Site_Environmental !== "local") {
                        let generate_domain_ssl = await GenerateDomainSSL(custom_domain?.custom_domain);
                        console.log("edit_custom_domain generate_domain_ssl------", generate_domain_ssl);
                    }

                    await models.CustomDomainSSL.create({
                        store_id: custom_domain?.store_id,
                        custom_domain_id: custom_domain?.id,
                        start_date: moment(),
                    });

                    custom_domain.verification_status = "pending";
                    // custom_domain.verification_status = "success";
                    custom_domain.save();

                    return res.json({
                        status: true,
                        message: "Your domain was submitted for verification. We'll notify you once the verification is done.",
                    });
                } else {
                    return res.json({
                        status: false,
                        message: "DNS CNAME record in your domain does not exist.",
                    });
                }
            }
        } catch (error) {
            console.error("edit_custom_domain error -----------------", error);
            return res.json({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    }

    try {
        let dns_point_to = "domain.checkout-master.com";
        if (process.env.Site_Environmental !== "production") {
            dns_point_to = "domaindev.checkout-master.com";
        }

        let custom_domain = await models.CustomDomain.findOne({
            where: {
                store_id: store_id,
            },
        });

        if (!custom_domain) {
            res.render("404");
        }

        return res.render("backend/CustomDomain/edit_custom_domain", {
            store_id: store_id,
            auth_user: auth_user,
            auth_store: auth_store,
            active_menu: "custom-domain",

            dns_point_to: dns_point_to,
            custom_domain: custom_domain,
        });
    } catch (error) {
        console.error("edit_custom_domain error -----------------", error);
        res.render("404");
    }
};

module.exports.delete_domain = async (req, res, next) => {
    let request_body = req.body;

    try {

        let custom_domain = await models.CustomDomain.findOne({
            where: {
                store_id: request_body?.store_id,
            },
        });
        if (custom_domain && custom_domain.verification_status == "success") {
            if (process.env.Site_Environmental !== "local") {
                let remove_domain_ssl = await RemoveDomiainSSL(custom_domain?.custom_domain);
                console.log("delete_domain remove_domain_ssl------", remove_domain_ssl);
            }
        }

        await models.CustomDomain.destroy({
            where: {
                store_id: request_body?.store_id,
                id: custom_domain?.id,
            },
        });

        return res.json({
            status: true,
            message: "Domain deleted Successfully",
            redirect_url: `${process.env.APP_URL}/${request_body?.store_id}/custom-domain`,
        });
    } catch (error) {
        console.error("delete_Upsell error------------", error);
        return res.json({
            status: false,
            message: error?.message ? error.message : "Something went wrong. Please try again.",
        });
    }
};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
const fs = require("fs");
const { exec, execFile, spawn, fork } = require("child_process");
const GenerateDomainSSL = async (domain_name) => {
    console.log("################ custom_domain GenerateDomainSSL ################");
    return new Promise(async (resolve, reject) => {
        try {
            let app_name = ``;
            let document_root_dir = ``;
            let apache2_logs_dir = ``;
            let site_url = "";
            let apache2_sites_available = ``;

            if (process.env.Site_Environmental === "development") {
                app_name = `dev`;
                document_root_dir = `/var/www/html/dev`;
                apache2_logs_dir = `/var/log/apache2`;

                site_url = `https://dev.checkout-master.com:8001/`;
                apache2_sites_available = `/etc/apache2/sites-available`;
            }

            if (process.env.Site_Environmental === "production") {
                app_name = `app`;
                document_root_dir = `/var/www/html/app`;
                apache2_logs_dir = `/var/log/apache2`;

                site_url = `https://app.checkout-master.com:8001/`;
                apache2_sites_available = `/etc/apache2/sites-available`;
            }

            let virtual_host_content = `
                #!/bin/bash

                # Domain name for new host
                #read -p "Enter the domain name for the new vhost: " domain_name

                # It will create apache config file for the vhost
                echo "<VirtualHost *:80>
                ServerName ${domain_name}
                DocumentRoot ${document_root_dir}
                ErrorLog ${apache2_logs_dir}/${domain_name}-error.log
                CustomLog ${apache2_logs_dir}/${domain_name}-access.log combined

                SSLProxyEngine on
                SSLProxyVerify none
                ProxyPass / ${site_url}
                ProxyPassReverse / ${site_url}

                </VirtualHost>" > ${apache2_sites_available}/${domain_name}.conf

                # To enable vhost
                a2ensite ${domain_name}

                # To reaload apache after new vhost activation
                systemctl reload apache2

                # Install SSL (Let's Encrypt) certbot if not already installed
                if ! command -v certbot &> /${app_name}/null
                then
                    echo "Certbot not found. Installing..."
                    apt update
                    apt install certbot python3-certbot-apache -y
                fi

                # Create SSL certificate
                certbot --apache -d ${domain_name} 

                # Restart apache service to activate SSL
                systemctl reload apache2
            `;
            console.log("GenerateDomainSSL virtual_host_content------------", virtual_host_content);

            let domian_sh = `/var/www/html/${domain_name}.sh`;
            console.log("GenerateDomainSSL domian_sh------------", domian_sh);

            let domain_sh_writeStream = await fs.createWriteStream(`${domian_sh}`);
            console.log("GenerateDomainSSL domain_sh_writeStream------------", domain_sh_writeStream);

            // Set Delay fucntional start
            await sleep(2000);
            // Set Delay fucntional End

            await fs.chmodSync(domian_sh, "755");

            domain_sh_writeStream.write(virtual_host_content);
            domain_sh_writeStream.end();

            // Set Delay fucntional start
            await sleep(5000);
            // Set Delay fucntional End

            console.log("GenerateDomainSSL exec domian_sh------------", domian_sh);
            await exec(domian_sh, (error, stdout, stderr) => {
                console.log(`custom_domain execFile enter-----`);
                fs.unlinkSync(domian_sh);

                if (error) {
                    console.log(`custom_domain execFile error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`custom_domain execFile stderr: ${stderr}`);
                    return;
                }
                console.log(`custom_domain execFile stdout: ${stdout}`);
            });

            resolve({
                status: true,
                message: "Working fine.",
            });
        } catch (error) {
            console.error("GenerateDomainSSL error -------------", error);
            reject({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    });
};

const RemoveDomiainSSL = async (domain_name) => {
    console.log("################ custom_domain RemoveDomiainSSL ################");
    return new Promise(async (resolve, reject) => {
        try {
            let remove_ssl_content = `
                #!/bin/bash

                # Domain name for new host
                #read -p "Enter the domain name for the new vhost: " domain_name
                
                # Stop the web server
                service apache2 stop
                
                # Remove the SSL certificate and configuration
                certbot delete --cert-name ${domain_name}
                
                # It will remove domain link from site-enable
                a2dissite ${domain_name}*
                
                # Remove SSL files from Certbot's archive directory
                rm -rf /etc/apache2/sites-available/${domain_name}*
                
                # Remove SSL files from Certbot's archive directory
                rm -rf /etc/letsencrypt/archive/${domain_name}
                
                # Remove symbolic links from Certbot's live directory
                rm -rf /etc/letsencrypt/live/${domain_name}
                
                # Remove Certbot's renewal configuration
                rm -rf /etc/letsencrypt/renewal/${domain_name}.conf
                
                # Restart the web server
                service apache2 start
            `;
            console.log("RemoveDomiainSSL remove_ssl_content-------", remove_ssl_content);

            let domian_sh = `/var/www/html/${domain_name}.sh`;
            console.log("RemoveDomiainSSL domian_sh------------", domian_sh);

            let domain_sh_writeStream = await fs.createWriteStream(`${domian_sh}`);
            console.log("RemoveDomiainSSL domain_sh_writeStream------------", domain_sh_writeStream);

            // Set Delay fucntional start
            await sleep(2000);
            // Set Delay fucntional End

            await fs.chmodSync(domian_sh, "755");

            domain_sh_writeStream.write(remove_ssl_content);
            domain_sh_writeStream.end();

            // Set Delay fucntional start
            await sleep(5000);
            // Set Delay fucntional End

            console.log("RemoveDomiainSSL exec domian_sh------------", domian_sh);
            await exec(domian_sh, (error, stdout, stderr) => {
                console.log(`RemoveDomiainSSL execFile enter-----`);
                fs.unlinkSync(domian_sh);

                if (error) {
                    console.log(`RemoveDomiainSSL execFile error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`RemoveDomiainSSL execFile stderr: ${stderr}`);
                    return;
                }
                console.log(`RemoveDomiainSSL execFile stdout: ${stdout}`);
            });

            resolve({ status: true, message: "Working fine." });
        } catch (error) {
            console.error("RemoveDomiainSSL error -------------", error);
            reject({
                status: false,
                message: error?.message ? error.message : "Something went wrong. Please try again.",
            });
        }
    });
}