import env from "$/server/env.js";
import common from "$/server/utils/common/index.ts";
import path from "path";
import root_paths from "../../dynamic_configuration/root_paths.ts";
const rs = common.Object_manipulation.rs;

const render = env.puppeteer.renderer.worker
    ? (await import("$/server/utils/render_engine/proxy/index.js")).default
    : (await import("$/server/utils/render_engine/index.js")).default;

/**s
 *
 * @param {String} title
 * @param {Array<DocumentPage>} pages
 * @returns {import('../render_engine/index.js').SectionDescriptor}
 */
function pages(title, pages) {
    const returned_object = {
        type: "page-div",
        style: {
            page_content: {
                direction: "rtl",
            },
        },
        pages: pages,
    };
    if (!(env.puppeteer.allow && env.puppeteer.pdf_rendering)) {
        returned_object.header = [
            {
                type: "div",
                style: {
                    margin: "0px",
                    width: "100%",
                    font_size: "12px",
                    z_index: "10000",
                    direction: "rtl",
                    display: "flex",
                    justify_content: "space-between",
                },
                content: [
                    {
                        type: "div",
                        style: {
                            margin: "0px",
                            width: "100%",
                            font_size: "8px",
                            z_index: "10000",
                        },
                        content: [
                            {
                                type: "div",
                                style: {
                                    display: "flex",
                                    justify_content: "space-between",
                                    flex_wrap: "nowrap",
                                    width: "100%",
                                    align_content: "center",
                                },
                                content: [
                                    {
                                        type: "img",
                                        src: process.env.CLIENT_ICON_URL || path.join(root_paths.src_path, "assets/images", env.client.logo.png),
                                        style: {
                                            max_height: "0.5cm",
                                            display: "flex",
                                            justify_content: "center",
                                            align_content: "center",
                                        },
                                    },
                                    {
                                        type: "div",
                                        content: [
                                            {
                                                type: "span",
                                                text: title,
                                                style: {
                                                    font_family: "arial",
                                                    font_weight: "600",
                                                    font_size: "14px",
                                                    color: "#00000099",
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        type: "div",
                                        content: [
                                            {
                                                type: "span",
                                                text: env.client.name,
                                                style: {
                                                    font_family: "arial",
                                                    font_weight: "700",
                                                    color: "#FE3C50",
                                                    font_size: "14px",
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: "hr",
                            },
                        ],
                    },
                ],
            },
        ];
        returned_object.footer = [
            {
                type: "header",
                style: {
                    main: {
                        position: "fixed",
                        buttom: "0px",
                        margin: "0px",
                        width: "100%",
                        font_size: "8px",
                        z_index: "10000",
                    },
                    container: {
                        display: "flex",
                        justify_content: "space-between",
                        flex_wrap: "nowrap",
                        // width: "100%",
                        align_content: "center",
                        margin: "0cm",
                    },
                    left: {
                        display: "flex",
                        justify_content: "center",
                        align_content: "center",
                    },
                    center: {},
                    right: {},
                    hr: {
                        height: "1px",
                    },
                },
                left: [
                    {
                        type: "span",
                        text: "By " + env.corp.name,
                        style: {
                            display: "block",
                            color: "#006EE9",
                            font_weight: "bold",
                        },
                    },
                    {
                        type: "img",
                        src: path.join(root_paths.app_path, "server/assets/images", env.corp.logo.png),
                        style: {
                            margin_left: "4px",
                            margin_top: "-1px",
                            display: "block",
                            height: "15px", 
                            text_align: null, // place it after the pre text
                        },
                    },
                ],
                center: [],
                right: [
                    {
                        type: "span",
                        classes: ["pageNumber"],
                        style: {},
                    },
                    {
                        type: "span",
                        classes: [],
                        text: "/",
                        style: {},
                    },
                    {
                        type: "span",
                        text: null,
                        classes: ["totalPages"],
                        style: {},
                    },
                ],
                hr_bottom: false,
                hr_top: true,
            },
        ];
    }

    return returned_object;
}
export { pages };

/**
 * @typedef {Object.<String, String|number>} TableData
 */
/**
 * @typedef {{text:string, value:(string|number|function)}} TableHeader
 */
/**
 * @typedef {Object} Table
 * @property {Array<TableHeader>} headers
 * @property {Array<TableData>} data
 * @property {(item: any)=>string[]} [coloring]
 */

/**
 *
 * @param {Table} table
 * @returns {import('../render_engine/index.js').SectionDescriptor}
 */
function table(table) {
    function read_cell(header_selector, row) {
        let val;
        if (typeof header_selector == "function") {
            val = header_selector(row);
        } else {
            val = rs(header_selector, row);
        }
        if (Number(val)) {
            val = Number(val);
            if (String(val).split(".")[1]?.length > 2) {
                return val.toFixed(2);
            } else {
                return val;
            }
        } else {
            return val;
        }
    }
    const headers = table.headers.map((header) => {
        return {
            text: header.text,
            value: header.text,
        };
    });

    const data = table.data.map((item) => {
        const returned_item = {};
        for (const header of table.headers) {
            returned_item[header.text] = read_cell(header.value, item);
        }
        if (table.coloring) {
            returned_item.classes = table.coloring(item);
        }
        return returned_item;
    });

    return {
        type: "table",
        headers: headers,
        data: data,
    };
}
export { table };

function empty_string(text) {
    if (text === null || text === undefined || String(text).trim() === "") {
        return "//";
    } else {
        if (parseFloat(text) == text) {
            text = common.math.fixed(text);
        } else if (parseInt(text) == text) {
            text = parseInt(text);
        }
        return String(text);
    }
}

/**
 *
 * @param {{text:string, value:string}} item
 * @returns {import('../render_engine/index.js').SectionDescriptor}
 */
function field(item) {
    return {
        type: "tr",
        style: {
            margin: "0px",
            page_break_before: "avoid !important",
            font_family: "arial",
            font_size: "12px",
            // background:"blue",
        },
        content: [
            {
                type: "div",
                style: {
                    margin: "0px",
                    margin_bottom: "3px",
                    padding: "0px",
                    // background: "red"
                },
                content: [
                    {
                        type: "span",
                        text: item.text,
                        style: {
                            page_break_before: "avoid",
                            margin: "0px !important",
                            padding: "4px !important",
                            font_size: "12px",
                            border_top_right_radius: "7px",
                            border_top_left_radius: "7px",
                            background_color: "#eeeeee",
                            color: "#00000088",
                        },
                    },
                ],
            },
            {
                type: "div",
                style: {
                    margin: "0cm",
                    padding: "0.12cm",
                    page_break_before: "avoid",
                    border: "solid #eeeeee 0.06cm",
                    border_radius: "2px",
                },
                content: [
                    {
                        type: "span",
                        text: empty_string(item.value),
                        style: {
                            color: "#000000aa",
                        },
                    },
                ],
            },
        ],
    };
}
export { field };

/**
 *
 * @param {Array<{text:string, value:string|number}>} data
 * @returns {import('../render_engine/index.js').SectionDescriptor}
 */
function fields(data) {
    function get_data(el) {
        return `${el.value}`;
    }
    function calculate_columns(el, next_item, accomulative) {
        const text = get_data(el);
        if (text.length > 35 || (!(accomulative.index % 2) && (!next_item || String(next_item?.value)?.length > 35))) {
            accomulative.index += 2;
            return "1 / 3";
        } else {
            accomulative.index += 1;
            return null;
        }
    }
    const accomulative = { index: 0 };
    return {
        type: "div",
        style: {
            display: "grid",
            width: "100%",
            grid_template_columns: "auto auto",
            gap: "0.4cm",
        },
        content: [
            data.map((el, index) => {
                return {
                    type: "div",
                    style: {
                        grid_column: calculate_columns(el, data[index + 1], accomulative),
                    },
                    content: [field(el)],
                };
            }),
        ],
    };
}
export { fields };
/**
 *
 * @param {string} text
 * @returns {import('../render_engine/index.js').SectionDescriptor}
 */
function subtitle(text) {
    return {
        type: "div",
        style: {
            page_break_inside: "avoid",
            page_break_after: "avoid",
            margin: "0.3cm 0cm",
            font_size: "16px",
            width: "100%",
            font_weight: "700",
            font_family: "arial",
            // background_color:"#eeeeee",
        },
        content: [
            {
                type: "span",
                text: text,
                style: {
                    // background_color: "white",
                    padding: "0.2cm",
                    // border_radius:"0.4cm"
                    border_bottom: "solid #FE3C5077 0.1cm",
                },
            },
            // {
            //     type: "div",
            //     style: {
            //         margin_top: "0.29cm",
            //         width: "100%",
            //         background_color: "#FE3C5077",
            //         height: "4px",
            //     },
            //     content: [],
            // },
        ],
    };
}
export { subtitle };
/**
 *
 * @param {string} text
 * @returns {import('../render_engine/index.js').SectionDescriptor}
 */
function title(text) {
    return {
        type: "div",
        style: {
            page_break_inside: "avoid",
            page_break_after: "avoid",
            margin: "0.3cm 0cm",
            font_size: "24px",
            width: "100%",
            font_weight: "700",
            font_family: "arial",
            // background_color:"#eeeeee",
        },
        content: [
            {
                type: "span",
                text: text,
                style: {
                    // background_color: "white",
                    padding: "0.2cm",
                    // border_radius:"0.4cm"
                    border_bottom: "solid #FE3C5077 0.2cm",
                },
            },
            {
                type: "div",
                style: {
                    margin_top: "0.29cm",
                    width: "100%",
                    background_color: "#FE3C5077",
                    height: "4px",
                },
                content: [],
            },
        ],
    };
}
export { title };
/**
 *
 * @param {string} text
 * @returns {DocumentPage}
 */
function cover_page(text) {
    return {
        content: [
            {
                type: "h1",
                text: text,
                style: {
                    display: "flex",
                },
            },
        ],
        style: {
            display: "flex",
            align_items: "center",
            justify_content: "center",
            height: "100%",
            width: "100%",
        },
    };
}
export { cover_page };
/**
 *
 * @param {string} text
 * @returns {import('../render_engine/index.js').SectionDescriptor}
 */
function paragraph(text) {
    return {
        type: "p",
        style: {},
        text: text,
    };
}
export { paragraph };

/**
 * @typedef {Object} DocumentPage
 * @property {Array<import('../render_engine/index.js').SectionDescriptor>} content
 * @property {Object.<string, Object.<string, string>>} [style]
 */

/**
 * @param {import('../render_engine/index.js').DirectoryPath} dir placement under public
 * @param {String} title document title
 * @param {Array<DocumentPage>} document_pages
 */
async function generate_document(dir, title, document_pages) {
    const Document = await render({
        content: [pages(title, document_pages)],
        data: {},
        no_puppeteer: !(env.puppeteer.pdf_rendering && env.puppeteer.allow),
        save: {
            skeleton: false,
            pdf: env.puppeteer.pdf_rendering && env.puppeteer.allow,
            rendered_template: true,
            dir: dir,
        },
        style: {
            load_images: true,
            load_css: true,
            paper: "A4",
            wrap: true,
        },
        template: {
            header: {
                section: "div",
                style: {
                    margin: "0px 0.4cm",
                    width: "100%",
                    font_size: "12px",
                    z_index: "10000",
                    direction: "rtl",
                    display: "flex",
                    justify_content: "space-between",
                },
                content: [
                    {
                        type: "div",
                        style: {
                            margin: "0px 0.4cm",
                            width: "100%",
                            font_size: "8px",
                            z_index: "10000",
                        },
                        content: [
                            {
                                type: "div",
                                style: {
                                    display: "flex",
                                    justify_content: "space-between",
                                    flex_wrap: "nowrap",
                                    width: "100%",
                                    align_content: "center",
                                },
                                content: [
                                    {
                                        type: "img",
                                        src: process.env.CLIENT_ICON_URL || "/../../assets/images/Aram.svg",
                                        style: {
                                            max_height: "0.5cm",
                                            display: "flex",
                                            justify_content: "center",
                                            align_content: "center",
                                        },
                                    },
                                    {
                                        type: "div",
                                        content: [
                                            {
                                                type: "span",
                                                text: title,
                                                style: {
                                                    font_family: "arial",
                                                    font_weight: "600",
                                                    font_size: "14px",
                                                    color: "#00000099",
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        type: "div",
                                        content: [
                                            {
                                                type: "span",
                                                text: "Aramtech",
                                                style: {
                                                    font_family: "arial",
                                                    font_weight: "700",
                                                    color: "#FE3C50",
                                                    font_size: "14px",
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: "hr",
                            },
                        ],
                    },
                ],
            },
            footer: {
                section: "header",
                style: {
                    main: {
                        margin: "0px 0.4cm",
                        width: "100%",
                        font_size: "8px",
                        z_index: "10000",
                        background_color: "",
                    },
                    container: {
                        display: "flex",
                        justify_content: "space-between",
                        flex_wrap: "nowrap",
                        // width: "100%",
                        align_content: "center",
                        margin: "0cm 0.3cm",
                    },
                    left: {
                        display: "flex",
                        justify_content: "center",
                        align_content: "center",
                    },
                    center: {},
                    right: {},
                    hr: {
                        height: "1px",
                    },
                },
                left: [
                    {
                        type: "span",
                        text: "By " + env.corp.name,
                        style: {
                            display: "block",
                            color: "#006EE9",
                            font_weight: "bold",
                        },
                    },
                    {
                        type: "img",
                        src: path.join(root_paths.app_path, "server/assets/images", env.corp.logo.png),
                        style: {
                            margin_left: "4px",
                            margin_top: "-1px",
                            display: "block",                            
                            height: "15px", 
                            text_align: null, // place it after the pre text
                        },
                    },
                ],
                center: [],
                right: [
                    {
                        type: "span",
                        classes: ["pageNumber"],
                        style: {},
                    },
                    {
                        type: "span",
                        classes: [],
                        text: "/",
                        style: {},
                    },
                    {
                        type: "span",
                        text: null,
                        classes: ["totalPages"],
                        style: {},
                    },
                ],
                hr_bottom: false,
                hr_top: true,
            },
            name: "main",
            margin: {
                bottom: "2cm",
                left: "1cm",
                // top: "0.3cm",
                right: "1.2cm",

                top: "1.8cm",
                // right: "32cm"
            },
            // padding: {
            //     bottom: "3cm",
            //     left: "3cm",
            //     top: "3cm",
            //     right: "3cm"
            // },
        },
        dont_respond: true,
    });
    return Document;
}
export { generate_document };
