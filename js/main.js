/**
 * Load Vega-Lite specs for Sections 1–4.
 */

const CHART_TITLE_STYLE = {
    fontSize: 17,
    fontWeight: 700,
    anchor: "start",
    offset: 22,
    color: "#2f2f2f"
};

/** Section 1 only — ~18% larger / heavier than default chart titles. */
/** Gap between the (top-pinned) title and the plot for Section 1 charts. */
const OVERVIEW_TITLE_OFFSET = 22;

const OVERVIEW_CHART_TITLE_STYLE = {
    fontSize: 17,
    fontWeight: 700,
    anchor: "start",
    offset: OVERVIEW_TITLE_OFFSET,
    color: "#2f2f2f"
};

const CHART_ANNOTATION_STYLE = {
    fontSize: 12,
    fontWeight: 600,
    font: 'Georgia, "Times New Roman", serif',
    color: "#1a1a1a"
};

var MIN_AXIS_LABEL_SIZE = 12;
var MIN_LEGEND_LABEL_SIZE = 11;

const CHART_PADDING_TOP = 36;

const EMBED_OPTIONS = {
    actions: false,
    renderer: "svg",
    resize: false,
    config: {
        background: "#fafafa",
        font: "Georgia, serif",
        axis: {
            labelFont: "Georgia, serif",
            titleFont: "Georgia, serif",
            labelFontSize: 12,
            labelColor: "#5a5a5a",
            titleFontSize: 12,
            titleFontWeight: "normal",
            titleColor: "#4a4a4a",
            grid: true,
            gridOpacity: 0.15
        },
        legend: {
            labelFont: "Georgia, serif",
            titleFont: "Georgia, serif",
            labelFontSize: 11,
            labelColor: "#555555",
            titleFontSize: 12,
            titleFontWeight: "normal",
            titleColor: "#4a4a4a"
        },
        title: {
            font: "Georgia, serif",
            fontSize: 17,
            fontWeight: 700,
            anchor: "start",
            offset: 22,
            color: "#2f2f2f"
        },
        view: { stroke: null },
        tooltip: {
            font: "Georgia, serif",
            fontSize: 12
        }
    }
};

function flattenTitleText(title) {
    if (!title) {
        return "";
    }
    if (typeof title === "string") {
        return title;
    }
    if (typeof title.text === "string") {
        return title.text;
    }
    if (Array.isArray(title.text)) {
        return title.text.join(" ");
    }
    return String(title.text || "");
}

function measureTitleWidth(el, spec) {
    var panel = el.closest(".chart-panel");
    var w = panel ? panel.clientWidth : el.clientWidth;
    var margin = 20;

    // Section 4 titles span the full card width (above the plot), so let them
    // use almost the whole card before wrapping.
    if (el.closest("#people")) {
        return Math.max(160, Math.floor(w) - 16);
    }
    if (el.closest("#migration") || el.closest("#people")) {
        margin = 30;
    }
    if (spec && spec.padding && spec.padding.right > 40) {
        margin = Math.max(margin, 36);
    }

    return Math.max(160, Math.floor(w) - margin);
}

/**
 * Vega lineBreak: " " puts each word on its own line. Build full horizontal
 * lines with canvas measurement instead, then pass a string or line array.
 */
/**
 * Section 2 (pad autosize): title pinned to card top, bigger gap to the
 * plot. Larger offset compensates for the reduced top padding so the plot
 * stays in roughly the same place.
 */
const GROWTH_CHART_TITLE_STYLE = Object.assign({}, CHART_TITLE_STYLE, {
    fontSize: 19,
    offset: 40
});

/**
 * Section 4 (three narrow cards): slightly tighter size so long titles fit
 * on fewer lines, with a bit more gap below the title. Shared by all three
 * charts for a consistent hierarchy.
 */
const PEOPLE_CHART_TITLE_STYLE = Object.assign({}, CHART_TITLE_STYLE, {
    fontSize: 15,
    offset: 26
});

function getChartTitleStyle(el) {
    if (el && el.closest("#overview")) {
        return OVERVIEW_CHART_TITLE_STYLE;
    }
    if (el && el.closest("#growth")) {
        return GROWTH_CHART_TITLE_STYLE;
    }
    if (el && el.closest("#people")) {
        return PEOPLE_CHART_TITLE_STYLE;
    }
    return CHART_TITLE_STYLE;
}

function wrapTitleToLines(text, maxWidthPx, fontSize, fontWeight) {
    var words = String(text).trim().split(/\s+/);

    if (!words.length) {
        return "";
    }

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    ctx.font =
        (fontWeight || 600) +
        " " +
        fontSize +
        'px Georgia, "Times New Roman", serif';

    var lines = [];
    var current = words[0];

    for (var i = 1; i < words.length; i++) {
        var candidate = current + " " + words[i];
        if (ctx.measureText(candidate).width <= maxWidthPx) {
            current = candidate;
        } else {
            lines.push(current);
            current = words[i];
        }
    }
    lines.push(current);

    return lines.length === 1 ? lines[0] : lines;
}

function applyChartTitle(spec, el) {
    if (!spec.title || typeof spec.title !== "object") {
        return;
    }

    var titleStyle = getChartTitleStyle(el);

    if (Array.isArray(spec.title.text) && spec.title.text.length > 1) {
        spec.title = Object.assign({}, spec.title, titleStyle, {
            text: spec.title.text
        });
        delete spec.title.lineBreak;
        return;
    }

    var raw = flattenTitleText(spec.title);
    var fontSize = titleStyle.fontSize;
    var wrapped = wrapTitleToLines(
        raw,
        measureTitleWidth(el, spec),
        fontSize,
        titleStyle.fontWeight
    );

    spec.title = Object.assign({}, spec.title, titleStyle, {
        text: wrapped
    });
    delete spec.title.lineBreak;
    delete spec.title.limit;
    delete spec.title.lineHeight;
}

function bumpAxisTypography(axis) {
    if (!axis || typeof axis !== "object") {
        return;
    }
    if (axis.labelFontSize && axis.labelFontSize < MIN_AXIS_LABEL_SIZE) {
        axis.labelFontSize = MIN_AXIS_LABEL_SIZE;
    }
    if (axis.titleFontSize && axis.titleFontSize < MIN_AXIS_LABEL_SIZE) {
        axis.titleFontSize = MIN_AXIS_LABEL_SIZE;
    }
}

function bumpLegendTypography(legend) {
    if (!legend || typeof legend !== "object") {
        return;
    }
    if (legend.labelFontSize && legend.labelFontSize < MIN_LEGEND_LABEL_SIZE) {
        legend.labelFontSize = MIN_LEGEND_LABEL_SIZE;
    }
    if (legend.titleFontSize && legend.titleFontSize < MIN_LEGEND_LABEL_SIZE) {
        legend.titleFontSize = MIN_LEGEND_LABEL_SIZE;
    }
}

function bumpSpecTypography(node) {
    if (!node || typeof node !== "object") {
        return;
    }

    if (Array.isArray(node)) {
        node.forEach(bumpSpecTypography);
        return;
    }

    if (node.axis) {
        bumpAxisTypography(node.axis);
    }

    if (node.encoding) {
        Object.keys(node.encoding).forEach(function (channel) {
            var enc = node.encoding[channel];
            if (!enc || typeof enc !== "object") {
                return;
            }
            if (enc.axis) {
                bumpAxisTypography(enc.axis);
            }
            if (enc.legend) {
                bumpLegendTypography(enc.legend);
            }
        });
    }

    if (node.layer) {
        bumpSpecTypography(node.layer);
    }
}

function applyAnnotationStyles(node) {
    if (!node || typeof node !== "object") {
        return;
    }

    if (Array.isArray(node)) {
        node.forEach(applyAnnotationStyles);
        return;
    }

    var isCallout =
        node.mark &&
        node.mark.type === "text" &&
        node.encoding &&
        node.encoding.text &&
        (node.encoding.text.value ||
            (node.data &&
                node.data.values &&
                Array.isArray(node.data.values)));

    if (isCallout) {
        node.mark = Object.assign({}, node.mark, CHART_ANNOTATION_STYLE);
    }

    if (node.layer) {
        applyAnnotationStyles(node.layer);
    }
}

function normalizeChartSpec(spec) {
    var next = JSON.parse(JSON.stringify(spec));
    if (next.padding && typeof next.padding === "object") {
        next.padding.top = Math.max(
            Number(next.padding.top) || 0,
            CHART_PADDING_TOP
        );
    }
    if (next.title) {
        if (Array.isArray(next.title.text) && next.title.text.length > 1) {
            next.title = Object.assign({}, next.title, CHART_TITLE_STYLE, {
                text: next.title.text
            });
        } else {
            next.title = Object.assign({}, next.title, CHART_TITLE_STYLE, {
                text: flattenTitleText(next.title)
            });
            delete next.title.lineHeight;
            delete next.title.limit;
        }
        delete next.title.subtitle;
        delete next.title.subtitleFontSize;
        delete next.title.subtitlePadding;
        delete next.title.lineBreak;
    }

    bumpSpecTypography(next);
    applyAnnotationStyles(next);
    return next;
}

function chartWidth(el) {
    var panel = el.closest(".chart-panel");
    var inset = el.id === "state-bar-vis" ? 18 : 4;
    var w = (panel ? panel.clientWidth : el.clientWidth) - inset;
    return Math.max(320, w);
}

var OVERVIEW_CHART_HEIGHT = 510;

function overviewChartHeight() {
    var section = document.getElementById("overview");
    if (!section) {
        return OVERVIEW_CHART_HEIGHT;
    }
    var raw = getComputedStyle(section).getPropertyValue(
        "--overview-chart-height"
    );
    var parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0
        ? parsed
        : OVERVIEW_CHART_HEIGHT;
}

var OVERVIEW_WIDTH_INSET = 8;

function overviewChartSize(el) {
    var panel = el.closest(".chart-panel");
    var insetW = el.id === "map-vis" ? 4 : OVERVIEW_WIDTH_INSET;
    var w = (panel ? panel.clientWidth : el.clientWidth) - insetW;
    var outerH = overviewChartHeight();

    return {
        width: Math.max(320, Math.floor(w)),
        height: outerH
    };
}

/**
 * Section 1 chart padding — tighter top for titles; bottom absorbs the
 * difference so plot area and projection scale stay unchanged.
 */
var OVERVIEW_MAP_PADDING = { left: 5, top: 24, right: 5, bottom: 62 };
var OVERVIEW_BAR_PADDING = { left: 8, top: 24, right: 52, bottom: 26 };

/** ~12% larger Australia within the same chart frame. */
var MAP_SCALE_BOOST = 1.12;

function tuneOverviewChartSpec(spec, specPath) {
    if (specPath.indexOf("state_map") !== -1) {
        spec.padding = Object.assign({}, OVERVIEW_MAP_PADDING);
        var legend =
            spec.encoding && spec.encoding.color && spec.encoding.color.legend;
        if (legend) {
            spec.encoding.color.legend = Object.assign({}, legend, {
                gradientLength: 268,
                offset: 8,
                labelFontSize: 13,
                titleFontSize: 14,
                titlePadding: 12
            });
        }
    } else if (specPath.indexOf("state_bar") !== -1) {
        spec.padding = Object.assign({}, OVERVIEW_BAR_PADDING);
    }
    return spec;
}

/** Scale mercator to fit plot height first (avoids top/bottom crop). */
function applyMapProjection(spec, size) {
    if (!spec.projection || !size) {
        return spec;
    }
    var padTop = OVERVIEW_MAP_PADDING.top + 28 + OVERVIEW_TITLE_OFFSET;
    var padBottom = OVERVIEW_MAP_PADDING.bottom + 28;
    var plotH = Math.max(220, size.height - padTop - padBottom);
    var plotW =
        size.width - OVERVIEW_MAP_PADDING.left - OVERVIEW_MAP_PADDING.right;
    // Height fit (no boost) keeps the full north–south extent — incl.
    // Tasmania — inside the plot. The boost only helps fill width on
    // narrow cards, so it can never overflow vertically.
    var byHeight = plotH * 1.46;
    var byWidth = plotW * 1.06 * MAP_SCALE_BOOST;
    var scale = Math.round(Math.min(byHeight, byWidth));
    scale = Math.max(470, Math.min(scale, 700));

    spec.projection = {
        type: "mercator",
        center: [134, -27.1],
        scale: scale
    };
    return spec;
}

function getChartSize(el) {
    if (el.closest("#migration") || el.closest("#people")) {
        return fourColChartSize(el);
    }
    if (el.closest("#overview")) {
        return overviewChartSize(el);
    }
    return { width: chartWidth(el), height: null };
}

var THREE_COL_CHART_HEIGHT = 400;

function threeColChartHeight(el) {
    var section = el.closest("#migration, #people");
    if (!section) {
        return THREE_COL_CHART_HEIGHT;
    }
    var raw = getComputedStyle(section).getPropertyValue(
        "--three-col-chart-height"
    );
    var parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0
        ? parsed
        : THREE_COL_CHART_HEIGHT;
}

function fourColChartSize(el) {
    var panel = el.closest(".chart-panel");
    var widthInset = 20;
    var w = (panel ? panel.clientWidth : el.clientWidth) - widthInset;
    return {
        width: Math.max(260, Math.floor(w)),
        height: threeColChartHeight(el)
    };
}

function applyChartSize(el, view) {
    if (!view || !view.width) {
        return;
    }
    var size = getChartSize(el);

    view.width(size.width);
    if (size.height) {
        view.height(size.height);
    }
    return view.runAsync();
}

function runAfterLayout(fn) {
    requestAnimationFrame(function () {
        requestAnimationFrame(fn);
    });
}

function embedChart(selector, specPath) {
    var el = document.querySelector(selector);
    if (!el) {
        return Promise.resolve();
    }

    return fetch(specPath)
        .then(function (res) {
            return res.json();
        })
        .then(function (spec) {
            return new Promise(function (resolve) {
                runAfterLayout(function () {
                    spec = normalizeChartSpec(spec);
                    if (spec.width === "container") {
                        var size = getChartSize(el);
                        spec = Object.assign({}, spec, { width: size.width });
                        if (size.height) {
                            spec = Object.assign({}, spec, {
                                height: size.height
                            });
                        }
                        if (
                            specPath.indexOf("state_map") !== -1 ||
                            specPath.indexOf("state_bar") !== -1
                        ) {
                            tuneOverviewChartSpec(spec, specPath);
                        }
                        if (specPath.indexOf("state_map") !== -1) {
                            applyMapProjection(spec, size);
                        }
                    }
                    applyChartTitle(spec, el);
                    vegaEmbed(el, spec, EMBED_OPTIONS)
                        .then(function (result) {
                            if (result && result.view) {
                                el.view = result.view;
                            }
                            resolve(result);
                        })
                        .catch(function (err) {
                            console.error(
                                "Failed to load chart:",
                                selector,
                                specPath,
                                err
                            );
                            resolve();
                        });
                });
            });
        })
        .catch(function (err) {
            console.error("Failed to load chart:", selector, specPath, err);
        });
}

function setupSectionChartResize(sectionId) {
    var slots = document.querySelectorAll("#" + sectionId + " .chart-slot");
    var timer;

    function reflow() {
        clearTimeout(timer);
        timer = setTimeout(function () {
            slots.forEach(function (slot) {
                if (slot.view) {
                    applyChartSize(slot, slot.view);
                }
            });
        }, 120);
    }

    slots.forEach(function (slot) {
        if (typeof ResizeObserver !== "undefined") {
            var observer = new ResizeObserver(reflow);
            observer.observe(slot);
        }
    });

    reflow();
}

window.addEventListener("load", function () {
    var charts = [
        { selector: "#map-vis", spec: "specs/state_map.json" },
        { selector: "#state-bar-vis", spec: "specs/state_bar.json" },
        { selector: "#line-vis", spec: "specs/growth_line.json" },
        { selector: "#area-vis", spec: "specs/growth_area.json" },
        { selector: "#lollipop-vis", spec: "specs/migration_lollipop.json" },
        { selector: "#bump-vis", spec: "specs/migration_bump.json" },
        { selector: "#program-vis", spec: "specs/migration_program_bar.json" },
        { selector: "#pyramid-vis", spec: "specs/people_pyramid.json" },
        { selector: "#dumbbell-vis", spec: "specs/people_dumbbell.json" },
        { selector: "#interstate-vis", spec: "specs/people_interstate.json" }
    ];

    Promise.all(
        charts.map(function (c) {
            return embedChart(c.selector, c.spec);
        })
    ).then(function () {
        requestAnimationFrame(function () {
            document.querySelectorAll(".chart-slot").forEach(function (slot) {
                if (slot.view) {
                    applyChartSize(slot, slot.view);
                }
            });
            setupSectionChartResize("migration");
            setupSectionChartResize("people");
        });
    });
});
