// readable.js | Beta v1.0
// Zulfeekar Cheriyampurath <zulu@bouvet.no> | (2018)
// API Fork of text-statistics.js by Christopher Giffard
// https://github.com/Bouvet

!(function (global) {

    "use strict";

    /**
     * The BOUVET global namespace object.  If BOUVET is already defined, the
     * existing BOUVET object will not be overwritten so that defined
     * namespaces are preserved.
     * @class BOUVET
     * @static
     */
    if (typeof global.BOUVET == "undefined") {
        global.BOUVET = {widgets: {enonic: {readable: {}}}};
    }


    /**
     * hasClass(el,class);
     * @param HTMLElement, string
     * @returns {boolean}
     */
    function hasClass(el, className) {
        return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
    }


    /**
     * addClass(el,class);
     * @param HTMLElement, string
     * @returns {boolean}
     */
    function addClass(el, className) {
        if (el.classList) el.classList.add(className);
        else if (!hasClass(el, className)) el.className += ' ' + className;
    }


    /**
     * removeClass(el,class);
     * @param HTMLElement, string
     * @returns {boolean}
     */
    function removeClass(el, className) {
        if (el.classList) el.classList.remove(className);
        else el.className = el.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
    }

    var widgetDocument = getWidgetDocument();
    var expanded = false;
    var uid = widgetDocument.baseURI.split('?uid=')[1];

    if (uid.indexOf('&') > -1) {
        uid = uid.split('&')[0];
    }

    function getWidgetDocument() {
        var script = window.HTMLImports ? window.HTMLImports.currentScript : undefined;

        if (!script && !!document.currentScript) {
            script = document.currentScript.__importElement || document.currentScript;
        }

        return script ? script.ownerDocument : document;
    };

    /*
     * @ Helpers;
     * Get containers by id;
     * */
    function getWidgetContainer(containerId) {
        containerId = containerId + "_" + uid;
        return document.getElementById(containerId) || widgetDocument.getElementById(containerId);
    };

    function getContentItemPreviewPanel() {
        return document.getElementById('ContentItemPreviewPanel')
            .getElementsByTagName('iframe')[0]
            .contentDocument.body;
    };

    function getContentItemIframe() {
        return document.getElementById('ContentItemPreviewPanel')
            .getElementsByTagName('iframe')[0];
    };

    function getContentItemIframeHtml() {
        return getContentItemIframe().getElementsByTagName('HTML')[0];
    }

    function getContentItemIframeWindow() {
        return document.getElementById('ContentItemPreviewPanel')
            .getElementsByTagName('iframe')[0]
            .contentWindow;
    };

    function getContentItemIframeDocument() {
        return document.getElementById('ContentItemPreviewPanel')
            .getElementsByTagName('iframe')[0]
            .contentDocument;
    };

    function getReadableWidgetElement() {
        return document.getElementsByClassName('com-bouvet-widgets-readable')[0];
    };

    function offset(el) {
        var rect = el.getBoundingClientRect(),
            scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return {top: rect.top + scrollTop, left: rect.left + scrollLeft}
    };


    /*
     * Assigning textstatistics to variable
     * */
    var textStatistics = global.textstatistics;


    /**
     * Readable(options);
     * @param options:Object
     * @returns {}
     */
    var Readable = function Readable(options) {
        /*
         @Private
         */
        var COLORS = {
            green: 'rgb(0,128,0)',
            greenYellow: 'rgb(173,255,47)',
            darkGreen: 'rgb(0,100,0)',
            gold: 'rgb(255,215,0)',
            orangeRed: 'rgb(255,69,0)',
            red: 'rgb(255,0,0)'
        }

        var SCORES = {
            max: 100,
            min: 0
        };


        /*
         @Options
         */
        this.options = options || {};
        this.options.colors = COLORS;
        this.options.scores = SCORES;
        this.options.tags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'DD'];

        /*
         @Properties
         */
        this.props = {};
        this.props.fleschKincaidReading = [];
        this.props.longString = '';
        this.props.elementsArray = [];
        this.props.UITimeout = null;
        this.props.startTimerId = null;
        this.props.chartTimerId = null;
        this.props.maximumTryNum = 5;
        this.props.chart = null;
        this.props.result = null;
        this.props.elementStyle = null;
        this.props.styleTimeoutId = null;

        /*
         @Binding event handlers
         */
        this.start = this.start.bind(this);
        this.mouseEnter = this.mouseEnter.bind(this);
        this.mouseLeave = this.mouseLeave.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
    };

    /**
     * getReadingLevelFromScore(props);
     * @param score:number
     * @returns { {label, color, id}  }
     */
    Readable.prototype.getReadingLevelFromScore = function (score) {

        if (score >= 90) {
            return {label: this.options.labels.readingLevel.veryEasy, color: this.options.colors.green, id: 0}

        } else if (score >= 80) {
            return {label: this.options.labels.readingLevel.easy, color: this.options.colors.darkGreen, id: 1}

        } else if (score >= 70) {
            return {label: this.options.labels.readingLevel.fairlyEasy, color: this.options.colors.darkGreen, id: 2}
        }
        else if (score >= 60) {
            return {label: this.options.labels.readingLevel.standard, color: this.options.colors.greenYellow, id: 3}
        }
        else if (score >= 50) {
            return {label: this.options.labels.readingLevel.fairlyDifficult, color: this.options.colors.gold, id: 4}
        }
        else if (score >= 30) {
            return {label: this.options.labels.readingLevel.difficult, color: this.options.colors.orangeRed, id: 5}
        }
        else {
            return {label: this.options.labels.readingLevel.veryConfusing, color: this.options.colors.red, id: 6}
        }
    }

    /**
     * getTotal(array);
     * @param score:number
     * @returns { score:number  }
     */
    Readable.prototype.getTotal = function (array) {
        return array.reduce(function (accumulator, currentItem) {
            return accumulator + currentItem.score;
        }, 0);
    }


    /**
     * getAverage(array);
     * @param array
     * @returns { average:number  }
     */
    Readable.prototype.getAverage = function (array) {
        var total = 0, average = 0, length = array.length;
        for (var i = 0; i < length; i++) {
            total += array[i].score;
        }
        average = (total / length);
        return average;
    };


    /**
     * start();
     * @param
     * @returns {}
     */
    Readable.prototype.start = function () {

        var self = this,
            elements,
            text,
            statistics,
            fleschKincaidReadingEaseScore,
            widgetElement = getReadableWidgetElement();

        self.props.fleschKincaidReading = [];


        /**
         * @foreach on tags;
         *
         */
        self.options.tags.forEach(function (tag) {

            elements = Array.prototype.slice.call(getContentItemPreviewPanel().getElementsByTagName(tag));

            if (elements.length > 0) {

                elements.forEach(function (element) {

                    try {
                        element.removeEventListener('mouseleave', self.mouseLeave);
                        element.removeEventListener('mouseenter', self.mouseEnter);

                    } catch (error) {
                        console.log('ERROR::', error);
                    }

                    element.addEventListener('mouseenter', self.mouseEnter);
                    element.addEventListener('mouseleave', self.mouseLeave);

                    text = element.innerHTML;

                    if ((text.length == 0)) return false;

                    statistics = new textStatistics(text);

                    self.props.longString += statistics.text + ' ';

                    fleschKincaidReadingEaseScore = Math.max(statistics.fleschKincaidReadingEase(text), 0);
                    self.props.fleschKincaidReading.push({
                        readingLevel: self.getReadingLevelFromScore(fleschKincaidReadingEaseScore),
                        score: fleschKincaidReadingEaseScore,
                        element: element
                    });
                });
            }
        });

        if (self.props.fleschKincaidReading.length < 1) {

            if (self.props.maximumTryNum < 5) {

                self.props.maximumTryNum += 1;

                if (self.props.startTimerId) {
                    clearTimeout(self.props.startTimerId)
                }
                self.props.startTimerId = setTimeout(function () {
                    console.log('could not reach the element - trying again ...');
                    self.start();
                }, 500);
            } else {
                if (self.props.startTimerId) {
                    clearTimeout(self.props.startTimerId)
                }
                self.props.maximumTryNum = 0;
            }
        } else {
            if (self.props.startTimerId) {
                clearTimeout(self.props.startTimerId)
            }
            self.showResult();
        }

    };


    /**
     * showResult();
     * @param
     * @returns {}
     */
    Readable.prototype.showResult = function () {

        var self = this,
            text = new textStatistics(self.props.longString),
            fleschKincaidReadingEaseScore,
            gradeLevel,
            chart = [],
            chartData = {};

        fleschKincaidReadingEaseScore = Math.min(100, text.fleschKincaidReadingEase());

        gradeLevel = function () {
            return (Math.max(text.gunningFogScore(), 1) +
                Math.max(text.fleschKincaidGradeLevel(), 1) +
                Math.max(text.colemanLiauIndex(), 1) +
                Math.max(text.smogIndex(), 1) +
                Math.max(text.automatedReadabilityIndex(), 1)) / 5;
        }


        for (var i = 0; i < 7; i++) {
            if (self.props.fleschKincaidReading[i].readingLevel) {
                var count = self.props.fleschKincaidReading.filter(function (item) {
                    return item.readingLevel.id == i
                });
                chart.push(count);
            }
        }

        chart = chart.map(function (item) {
            if (item && item.length > 0) {
                return {
                    count: item.length,
                    label: item[0].readingLevel.label,
                    id: item[0].readingLevel.id,
                    color: item[0].readingLevel.color
                };
            }
        }).filter(function (item) {
            if (item) {
                return item;
            }
        });


        chartData.total = self.props.fleschKincaidReading.length;
        chartData.label = chart.map(function (item) {
            if ((item && item.label)) {
                return item.label;
            }
        });

        chartData.data = chart.map(function (item) {
            if (item && item.count) {
                return item.count;
            }
        });

        chartData.color = chart.map(function (item) {
            if (item && item.color) {
                return item.color;
            }
        });

        this.props.result = {
            chartData: chartData,
            contentPanel: getContentItemPreviewPanel(),
            elements: self.props.fleschKincaidReading,
            gradeLevel: Math.ceil(gradeLevel()),
            fKincaidReadingScore: fleschKincaidReadingEaseScore,
            readingLevel: self.getReadingLevelFromScore(fleschKincaidReadingEaseScore)
        };

        //console.log("result :  ", this.result);
        self.buildUI();
    }


    /**
     * buildUI();
     * @param
     * @returns {}
     */
    Readable.prototype.buildUI = function () {
        this.destroyUI();
    }

    /**
     * destroyUI();
     * @param
     * @returns {}
     */
    Readable.prototype.destroyUI = function () {

        var self = this,
            length = self.props.elementsArray.length;

        for (var i = 0; i < length; i++) {
            var element = self.props.elementsArray[i];
            if (element && element.parentNode) {
                element.removeEventListener('mouseleave', self.mouseLeave);
                element.removeEventListener('mouseenter', self.mouseEnter);
                element.parentNode.removeChild(element);
            }
        }

        if (self.props.tooltip && self.props.tooltip.parentNode) {
            self.props.tooltip.parentNode.removeChild(self.props.tooltip);
        }

        getContentItemPreviewPanel().removeEventListener('mousemove', self.mouseMove);


        if (self.props.UITimeout) {
            clearTimeout(self.props.UITimeout);
        }

        self.props.UITimeout = setTimeout(function () {
            self.updateUI();
        }, 500);
    }

    /**
     * mouseEnter();
     * @param event
     * @returns {}
     */
    Readable.prototype.mouseEnter = function (event) {

        event.preventDefault();

        var self = this,
            target = event.target,
            dot,
            tooltipText,
            color;

        dot = target.getElementsByClassName('com-bouvet-widget-readable__dot')[0];
        tooltipText = dot.getAttribute('data-score') + '%  - ' + dot.getAttribute('data-readinglevel');
        color = dot.style.backgroundColor;

        if (dot && self.props.tooltip) {
            self.props.tooltip.style.display = 'inline-block';
            self.props.tooltip.innerHTML = tooltipText;
        }
        self.props.elementStyle = target.style;
        target.style.borderLeft = "3px solid " + color;
        target.style.backgroundColor = "#f1f1f1";
    }


    /**
     * mouseMove();
     * @param event
     * @returns {}
     */
    Readable.prototype.mouseMove = function (event) {
        var self = this;
        if (self.props.tooltip) {
            self.props.tooltip.style.top = (event.pageY - 50) + 'px';
            self.props.tooltip.style.left = event.pageX + 'px';
        }
    }

    /**
     * mouseLeave();
     * @param event
     * @returns {}
     */
    Readable.prototype.mouseLeave = function (event) {

        var self = this,
            target = event.target;

        if (self.props.tooltip) {
            self.props.tooltip.style.display = 'none';
            self.props.tooltip.innerHTML = '';
        }

        if (self.props.styleTimeoutId) {
            clearTimeout(self.props.styleTimeoutId);
        }

        self.props.styleTimeoutId = setTimeout(function () {
            clearTimeout(self.props.styleTimeoutId);
            target.style = self.props.elementStyle;
        }, 1);

        event.preventDefault();

    }

    /**
     * createChart();
     * @param ctx:2d context
     * @returns {}
     */
    Readable.prototype.createChart = function (ctx) {
        var self = this;
        self.props.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: self.props.result.chartData.label,
                datasets: [{
                    //label: self.result.chartData.label,
                    backgroundColor: self.props.result.chartData.color,
                    borderColor: 'rgb(255, 255, 255)',
                    borderWidth: 1,
                    showLine: true,
                    data: self.props.result.chartData.data
                }]
            },
            options: {
                responsive: true,
                legend: {
                    display: false
                }
            }
        });
    }


    /**
     * updateChart();
     * @param data:object
     * @returns {}
     */
    Readable.prototype.updateChart = function (data) {
        var self = this;
        self.props.chart.options.data = data;
        self.props.chart.update();
    }


    /**
     * updateUI();
     * @param
     * @returns {}
     */
    Readable.prototype.updateUI = function () {

        var self = this,
            elements,
            length,
            ctx,
            widgetElement = getReadableWidgetElement();

        if (self.props.UITimeout) {
            clearTimeout(self.props.UITimeout);
        }

        self.props.tooltip = document.createElement('div');
        self.props.tooltip.id = "com-bouvet-widget-readable__tooltip";
        self.props.tooltip.innerHTML = '<strong></strong>';
        self.props.tooltip.style.position = "absolute";
        self.props.tooltip.style.backgroundColor = '#333333';
        self.props.tooltip.style.color = '#ffffff';
        self.props.tooltip.style.borderRadius = '10px';
        self.props.tooltip.style.display = 'inline-block';
        self.props.tooltip.style.padding = '5px 10px';
        self.props.tooltip.style.fontSize = '14px';
        self.props.tooltip.style.border = '1px solid #f1f1f1'
        self.props.tooltip.style.fontStyle = 'italic';
        self.props.tooltip.zIndex = 999999999;
        self.props.tooltip.style.top = self.props.tooltip.style.left = '0px';
        getContentItemPreviewPanel().appendChild(self.props.tooltip);
        getContentItemPreviewPanel().addEventListener('mousemove', self.mouseMove);

        self.props.elementsArray = [];

        self.props.fleschKincaidReading.map(function (item) {
            var el = item.element,
                html,
                dot;

            html = item.element.innerHTML;
            dot = document.createElement('span');
            dot.style.backgroundColor = item.readingLevel.color;
            dot.className = "com-bouvet-widget-readable__dot";
            dot.setAttribute('data-readinglevel', item.readingLevel.label);
            dot.setAttribute('data-score', item.score);
            dot.style.display = 'inline-block';
            dot.style.position = 'static';
            dot.style.width = dot.style.height = '10px';
            dot.style.cursor = "pointer";
            dot.style.zIndex = el.style.zIndex + 1;
            dot.style.border = '1px dotted rgba(0,0,0,1)';
            dot.style.opacity = '1';
            dot.style.borderRadius = '100%';
            // getContentItemPreviewPanel().appendChild(dot);
            el.appendChild(dot);
        });

        elements = getContentItemIframeDocument().getElementsByClassName('com-bouvet-widget-readable__dot');
        length = elements.length;

        for (var i = 0; i < length; i++) {
            //var element = elements[i];
            self.props.elementsArray.push(elements[i]);
        }

        if (self.props.chartTimerId) {
            clearTimeout(self.props.chartTimerId);
        }

        if (self.props.chart) {
            self.props.chart.destroy();
            self.props.chart = null;
        }

        try {
            self.props.chartTimerId = setTimeout(function () {
                ctx = document.getElementById('com-bouvet-widgets-readable__chart').getContext('2d');
                self.createChart(ctx);
                // console.log('self.result.readingLevel: ', self.result.readingLevel);
                document.getElementById('com-bouvet-widgets-readable__score').innerHTML = self.props.result.fKincaidReadingScore + '%';
                document.getElementById('com-bouvet-widgets-readable__grade-level').innerHTML = self.options.labels.gradeLevel + ': ' + '<strong>' + self.props.result.gradeLevel + '</strong>';
                document.getElementById('com-bouvet-widgets-readable__reading-level').innerHTML = self.options.labels.readingLevel.title + ': ' + '<strong>' + self.props.result.readingLevel.label + '</strong>';
            }, 200);


        } catch (err) {
            console.log('chart-error: ', err);
        }

        if (hasClass(widgetElement, 'com-bouvet-widgets-readable--state-started')) {
            removeClass(widgetElement, 'com-bouvet-widgets-readable--state-started');
            addClass(widgetElement, 'com-bouvet-widgets-readable--state-finished');
        }
    }


    /*
     * Adding Readable class to Bouvet Namespace.
     * */
    BOUVET.widgets.enonic.readable = Readable;


    /*
     * new Readable Class instantiation
     * */
    (function () {

        var wContainer,
            contentItemPreviewPanel,
            contentIframeWindow,
            readable,
            update,
            run,
            analyzeButton,
            startTimeoutId = null,
            widgetElement;

        startTimeoutId = setTimeout(function () {

            clearTimeout(startTimeoutId);

            wContainer = getWidgetContainer('readableid'),
                contentItemPreviewPanel = getContentItemPreviewPanel(),
                contentIframeWindow = getContentItemIframeWindow();


            /*
             * Get Json object of labels
             * */
            var GLOBAL_CONFIG = JSON.parse(widgetDocument.getElementById('com-bouvet-widget_' + uid + '-config-json').firstChild.data);

            var LABELS = {
                gradeLevel: GLOBAL_CONFIG.labels.gradeLevel,
                readingLevel: {
                    title: GLOBAL_CONFIG.labels.readingLevel,
                    veryEasy: GLOBAL_CONFIG.labels.veryEasy,
                    easy: GLOBAL_CONFIG.labels.easy,
                    fairlyEasy: GLOBAL_CONFIG.labels.fairlyEasy,
                    standard: GLOBAL_CONFIG.labels.standard,
                    fairlyDifficult: GLOBAL_CONFIG.labels.fairlyDifficult,
                    difficult: GLOBAL_CONFIG.labels.difficult,
                    veryConfusing: GLOBAL_CONFIG.labels.veryConfusing
                }
            };


            /*
             * Creating new Readable instance
             * */
            readable = new BOUVET.widgets.enonic.readable({
                widgetContainer: wContainer,
                contentPanel: contentItemPreviewPanel,
                labels:LABELS
            });


            /*
             * update on window resize
             * */
            update = function (event) {
                event.preventDefault();
                if (readable && readable.props.elementsArray.length > 0) {
                    readable.buildUI();
                }
            };

            widgetElement = getReadableWidgetElement();

            analyzeButton = document.getElementById('com-bouvet-widgets-readable__analyze-button');

            analyzeButton.addEventListener('click', function () {

                if (hasClass(widgetElement, 'com-bouvet-widgets-readable--state-not-started')) {
                    removeClass(widgetElement, 'com-bouvet-widgets-readable--state-not-started');
                    addClass(widgetElement, 'com-bouvet-widgets-readable--state-started');
                }

                setTimeout(function () {
                    readable.start();
                }, 200);
            });

            contentIframeWindow.addEventListener('resize', update);

            window.onload = update;

            window.onresize = update;


        }, 100);

    }());


}(window));

