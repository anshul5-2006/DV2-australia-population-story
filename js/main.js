/**
 * Load Vega-Lite specs for Sections 1–4.
 */

const CHART_TITLE_STYLE = {
    fontSize: 16,
    fontWeight: "bold",
    anchor: "start",
    offset: 8
};

const CHART_PADDING_TOP = 38;

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
            titleFontSize: 13,
            grid: true,
            gridOpacity: 0.15
        },
        legend: {
            labelFont: "Georgia, serif",
            titleFont: "Georgia, serif",
            labelFontSize: 11,
            titleFontSize: 12
        },
        title: {
            font: "Georgia, serif",
            fontSize: 16,
            fontWeight: "bold",
            anchor: "start",
            offset: 8,
            color: "#1a1a1a"
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
function wrapTitleToLines(text, maxWidthPx, fontSize) {
    var words = String(text).trim().split(/\s+/);

    if (!words.length) {
        return "";
    }

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    ctx.font =
        "bold " + fontSize + 'px Georgia, "Times New Roman", serif';

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

    var raw = flattenTitleText(spec.title);
    var fontSize = spec.title.fontSize || CHART_TITLE_STYLE.fontSize;
    var wrapped = wrapTitleToLines(
        raw,
        measureTitleWidth(el, spec),
        fontSize
    );

    spec.title = Object.assign({}, CHART_TITLE_STYLE, spec.title, {
        text: wrapped
    });
    delete spec.title.lineBreak;
    delete spec.title.limit;
    delete spec.title.lineHeight;
}

function normalizeChartSpec(spec) {
    var next = JSON.parse(JSON.stringify(spec));
    if (next.padding && typeof next.padding === "object") {
        next.padding.top = CHART_PADDING_TOP;
    }
    if (next.title) {
        next.title = Object.assign({}, CHART_TITLE_STYLE, next.title, {
            text: flattenTitleText(next.title)
        });
        delete next.title.subtitle;
        delete next.title.subtitleFontSize;
        delete next.title.subtitlePadding;
        delete next.title.lineBreak;
        delete next.title.limit;
        delete next.title.lineHeight;
    }
    return next;
}

function chartWidth(el) {
    var panel = el.closest(".chart-panel");
    var w = (panel ? panel.clientWidth : el.clientWidth) - 4;
    return Math.max(320, w);
}

function fourColChartSize(el) {
    var panel = el.closest(".chart-panel");
    var w = (panel ? panel.clientWidth : el.clientWidth) - 20;
    var h = (el.clientHeight || 400) - 4;
    return {
        width: Math.max(260, Math.floor(w)),
        height: Math.max(300, Math.floor(h))
    };
}

function applyChartSize(el, view) {
    if (!view || !view.width) {
        return;
    }
    var isFourCol =
        el.closest("#migration") || el.closest("#people");
    var size = isFourCol
        ? fourColChartSize(el)
        : { width: chartWidth(el), height: null };

    view.width(size.width);
    if (size.height) {
        view.height(size.height);
    }
    return view.runAsync();
}

function embedChart(selector, specPath) {
    var el = document.querySelector(selector);
    if (!el) {
        return Promise.resolve();
    }

    var isFourCol =
        Boolean(el.closest("#migration")) || Boolean(el.closest("#people"));

    return fetch(specPath)
        .then(function (res) {
            return res.json();
        })
        .then(function (spec) {
            return new Promise(function (resolve) {
                requestAnimationFrame(function () {
                    spec = normalizeChartSpec(spec);
                    if (spec.width === "container") {
                        var size = isFourCol
                            ? fourColChartSize(el)
                            : { width: chartWidth(el), height: null };
                        spec = Object.assign({}, spec, { width: size.width });
                        if (isFourCol && size.height) {
                            spec = Object.assign({}, spec, {
                                height: size.height
                            });
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

function setupFourColResize(sectionId) {
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
            setupFourColResize("migration");
            setupFourColResize("people");
        });
    });
});
