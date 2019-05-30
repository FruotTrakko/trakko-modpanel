class Dashboard {

    constructor(parentElement, cols) {
        let widths = []
        for (let i = 0; i < cols; i++) {
            widths[i] = 100 / cols;
        }

        this.createDashboard(parentElement, cols, widths);
    }

    createDashboard(parentElement, cols, columnWidths, evenColums) {
        this.parentElement = parentElement;
        this.cols = cols;
        this.columnWidths = columnWidths;
        this.evenColums = evenColums === null || evenColums === undefined ? true : evenColums;
        this.columns = [];
        this.widgets = [];

        let standardWidgets = [
            ["Chat Widget", ChatWidget]
        ];

        this.availableWidgets = new Map(standardWidgets);

        this.parentElement.classList.add('dashboard-main');

        for (let i = 0; i < columnWidths.length; i++) {
            this.columns[i] = new Column(this.parentElement, this.columnWidths[i], this);
        }
    }

    getColumn(index) {
        return this.columns[index];
    }

    setCols(cols) {
        this.cols = cols;

        this.updateDashboard();
    }

    setColumnWidths(widths) {
        this.columnWidths = widths;

        this.updateDashboard();
    }

    addWidget(widget) {
        this.widgets.push(widget);
    }

    removeWidget(widget) {
        this.widgets.splice(this.widgets.indexOf(widget), 1);
    }

    getAvailableWidgets() {
        return this.availableWidgets;
    }

    registerWidgetType(name, classObject) {
        this.availableWidgets.set(name, classObject);
    }

    updateDashboard() {
        if (this.columns.length > this.cols) {
            for (let i = this.columns.length; i > this.cols; i--) {
                this.columns[i - 1].column.remove();
                this.columns.pop();
            }

        } else if (this.columns.length < this.cols) {
            for (let i = this.columns.length; i < this.cols; i++) {
                this.columns[i] = new Column(this.parentElement, this.columnWidths[i], this);
            }

        }

        if (this.evenColums) {
            this.columnWidths = this.getEvenColumnWidths(this.cols);
        }

        for (let i = 0; i < this.columns.length; i++) {
            this.columns[i].updateWidth(this.columnWidths[i]);
        }
    }

    getEvenColumnWidths(cols) {
        let widths = []
        for (let i = 0; i < cols; i++) {
            widths[i] = 100 / cols;
        }
        return widths;
    }

    setColumnMode(even) {
        this.evenColums = even;

        this.updateDashboard();
    }

    onMessage(message) {
        this.widgets.forEach((widget) => {
            widget.onMessage(message);
        });
    }
}

class Column {

    constructor(parentElement, width, dashboard) {
        this.parentElement = parentElement;
        this.width = width;
        this.dashboard = dashboard;

        let columnDiv = document.createElement('div');
        columnDiv.classList.add('dashboard-column');
        columnDiv.style.width = `${this.width}%`;
        this.column = columnDiv;

        this.parentElement.appendChild(columnDiv);

        this.newWidget = new NewWidget(this.column, dashboard);
    }

    updateWidth(width) {
        this.column.style.width = `${width}%`;
        this.width = width;
    }
}

class Widget {

    constructor(columnElement, title, dashboard) {
        this.columnElement = columnElement;
        this.title = title;

        let widgetDiv = document.createElement('div');
        widgetDiv.classList.add('widget-container');
        this.widget = widgetDiv;

        let widgetHandle = document.createElement('div');
        widgetHandle.classList.add('widget-handle');
        this.widgetHandle = widgetHandle;

        let widgetTitle = document.createElement('h3');
        widgetTitle.classList.add('widget-title', 'heading');
        widgetTitle.innerText = title.toUpperCase();
        this.widgetTitle = widgetTitle;
        let widgetMover = document.createElement('div');
        widgetMover.classList.add('widget-mover');
        widgetMover.addEventListener('mousedown', this.onDragMouseDown.bind(this));
        this.widgetMover = widgetMover;

        let widgetMoverIcon = document.createElement('span');
        widgetMoverIcon.classList.add('widget-icon', 'fas', 'fa-th');
        widgetMover.appendChild(widgetMoverIcon);

        widgetHandle.appendChild(widgetTitle);
        widgetHandle.appendChild(widgetMover);

        widgetDiv.appendChild(widgetHandle);

        let widgetContent = document.createElement('div');
        widgetContent.classList.add('widget-content');
        this.contentElement = widgetContent;

        widgetDiv.appendChild(widgetContent);

        this.columnElement.insertBefore(widgetDiv, this.columnElement.querySelector('.widget-new-container'));

        if (dashboard) {
            dashboard.addWidget(this)
        } else {
            window.dashboard.addWidget(this);
        }
    }

    onDragMouseDown(event) {
        event.preventDefault();

        this.widget.style.width = `${this.widget.clientWidth}px`;
        this.widget.style.position = 'absolute';
        this.widget.style.margin = '0';

        this.pos3 = event.clientX;
        this.pos4 = event.clientY;

        document.onmouseup = this.onCloseDragElement.bind(this);
        document.onmousemove = this.onDragElement.bind(this);
        this.onDragElement(event);
    }

    onCloseDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;

        let temp = document.querySelector('.widget-temp');
        if (temp) {
            temp.replaceWith(this.widget);
            this.widget.style = '';
        }
    }

    onDragElement(event) {
        event.preventDefault();

        this.pos1 = this.pos3 - event.clientX;
        this.pos2 = this.pos4 - event.clientY;
        this.pos3 = event.clientX;
        this.pos4 = event.clientY;

        this.widget.style.top = `${this.widget.offsetTop - this.pos2}px`;
        this.widget.style.left = `${this.widget.offsetLeft - this.pos1}px`;

        for (const node of document.elementsFromPoint(event.clientX, event.clientY)) {
            if (node.classList.contains('dashboard-column')) {
                for (const child of node.childNodes.values()) {
                    var flag = false;
                    if (child.classList.contains('widget-temp')) {
                        flag = true;
                    }
                }
                if (!flag) {
                    let prevoius = document.querySelector('.widget-temp');
                    if (prevoius) {
                        prevoius.remove();
                    }
                    new TempWidget(node, this.widget.clientHeight);
                }
            }
        }
    }

    setTitle(title) {
        this.title = title;
        this.widgetTitle.innerText = title.toUpperCase();
    }

    onMessage(message) { }

    addSettings() {
        if (this.widgetSettings) {
            return;
        }

        let widgetSettings = document.createElement('div');
        widgetSettings.classList.add('widget-settings');
        widgetSettings.addEventListener('click', this.toggleSettings.bind(this));
        this.widgetSettings = widgetSettings;

        let widgetSettingsIcon = document.createElement('span');
        widgetSettingsIcon.classList.add('widget-icon', 'fas', 'fa-cog');
        widgetSettings.appendChild(widgetSettingsIcon);

        this.widgetMover.style.margin = '0 0 0 .05em';

        this.widgetHandle.insertBefore(widgetSettings, this.widgetMover);
    }

    toggleSettings(event) { }
}