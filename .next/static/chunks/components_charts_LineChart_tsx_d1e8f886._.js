(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/charts/LineChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$apexcharts$2f$dist$2f$react$2d$apexcharts$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-apexcharts/dist/react-apexcharts.min.js [app-client] (ecmascript)");
;
;
;
class LineChart extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"] {
    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.setState({
                options: {
                    ...this.state.options,
                    xaxis: {
                        ...this.state.options.xaxis,
                        categories: this.props.data.attendeeDates
                    },
                    title: {
                        text: this.props.title
                    }
                },
                series: [
                    {
                        name: 'training',
                        data: this.props.data.attendeeCount,
                        color: "#1A56DB"
                    }
                ]
            });
        }
    }
    render() {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$apexcharts$2f$dist$2f$react$2d$apexcharts$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                options: this.state.options,
                series: this.state.series,
                type: "area",
                width: "100%",
                height: "100%"
            }, void 0, false, {
                fileName: "[project]/components/charts/LineChart.tsx",
                lineNumber: 109,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/charts/LineChart.tsx",
            lineNumber: 108,
            columnNumber: 7
        }, this);
    }
    constructor(props){
        super(props);
        this.state = {
            options: {
                chart: {
                    id: 'basic-bar',
                    toolbar: {
                        show: false
                    }
                },
                grid: {
                    show: false
                },
                dataLabels: {
                    enabled: false
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shapeIntensity: 1,
                        opacityFrom: 0.5,
                        opacityTo: 0.2,
                        stops: [
                            0,
                            90,
                            100
                        ]
                    }
                },
                stroke: {
                    curve: 'smooth',
                    width: 1
                },
                tooltip: {
                    x: {
                        show: true
                    }
                },
                title: {
                    text: this.props.title
                },
                xaxis: {
                    categories: this.props.data.attendeeDates,
                    labels: {
                        show: false
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                yaxis: {
                    labels: {
                        show: false
                    }
                }
            },
            series: [
                {
                    name: 'training',
                    data: this.props.data.attendeeCount,
                    color: "#1A56DB"
                }
            ]
        };
    }
}
const __TURBOPACK__default__export__ = LineChart;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/charts/LineChart.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/charts/LineChart.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_charts_LineChart_tsx_d1e8f886._.js.map