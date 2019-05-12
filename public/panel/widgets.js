class TempWidget extends Widget {

    constructor(columnElement, height) {
        super(columnElement, '');

        this.widget.classList.add('widget-temp');
        this.widget.style.height = `${height}px`;
        this.widgetMover.remove();

        window.dashboard.removeWidget(this);
    }
}

/**
 *  Not fully implemented. Missing adding capability. A modal window should appear with a dropdown of possible widgets.
 */
class NewWidget extends Widget {

    constructor(columnElement, dashboard) {
        super(columnElement, '', dashboard);

        this.widget.querySelector('.widget-handle').remove();
        this.widget.classList.add('widget-new-container');

        let addIconWrapper = document.createElement('div');
        addIconWrapper.classList.add('widget-new-icon-wrapper');

        let addIcon = document.createElement('span');
        addIcon.classList.add('widget-icon', 'fa-stack');
        
        let plus = document.createElement('i');
        plus.classList.add('widget-icon-part', 'fas', 'fa-plus', 'fa-stack-1x')
        let circle = document.createElement('i');
        circle.classList.add('widget-icon-part', 'far', 'fa-circle', 'fa-stack-2x')
    
        addIcon.appendChild(plus);
        addIcon.appendChild(circle);

        addIconWrapper.appendChild(addIcon);

        this.contentElement.appendChild(addIconWrapper);
        this.contentElement.classList.add('widget-new-content');
    }
}

class StatusWidget extends Widget {

    constructor(columnElement) {
        super(columnElement, 'Status');

        let containerDiv = document.createElement('div');
        containerDiv.classList.add('widget-status-container');

        let infoText = document.createElement('p');
        infoText.classList.add('widget-status-infotext', 'heading');
        infoText.innerText = 'Twitch: ';
        let statusText = document.createElement('p');
        statusText.classList.add('widget-status-statustext', 'heading');
        statusText.innerText = 'WAITING';
        statusText.style.color = 'rgb(238, 169, 43)';
        this.statusText = statusText;

        containerDiv.appendChild(infoText);
        containerDiv.appendChild(statusText);

        let buttonDiv = document.createElement('div');
        buttonDiv.classList.add('widget-status-buttoncontainer');

        let statusButton = document.createElement('button');
        statusButton.classList.add('widget-status-statusbutton', 'blocked');
        statusButton.innerText = 'WAITING';
        statusButton.type = 'button';
        this.statusButton = statusButton;

        buttonDiv.appendChild(statusButton);

        this.contentElement.appendChild(containerDiv);
        this.contentElement.appendChild(buttonDiv);
    }

    setStatus(status, color, buttonText, buttonCallback, bind) {
        this.statusText.innerText = status.toUpperCase();
        this.statusText.style.color = color;

        this.statusButton.innerText = buttonText.toUpperCase();
        if(bind){
            this.statusButton.onclick = buttonCallback.bind(bind);
        } else {
            this.statusButton.onclick = buttonCallback
        }
    }

    setButtonBlocked(value) {
        if (value) {
            this.statusButton.classList.add('blocked');
        } else {
            this.statusButton.classList.remove('blocked');
        }
    }
}