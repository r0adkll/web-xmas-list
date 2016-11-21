/**
 * Created by r0adkll on 11/20/16.
 */
'use strict';

var itemCount = 1;

function XmasList() {

    // Shortcuts to DOM Elements.
    this.xmasList = document.getElementById('xmas-items');
    this.xmasTable = document.getElementById('xmas-table-items');

    this.titleInput = document.getElementById('gift-title');
    this.linkInput = document.getElementById('gift-link');
    this.priceInput = document.getElementById('gift-price');

    this.addButton = document.getElementById('add-action-button');
    this.addButton.addEventListener('click', this.addGift.bind(this));

    this.initFirebase();
}

function Gift() {
    this.number = 0;
    this.title = "";
    this.linkUrl = "";
    this.price = 0.0;
}

// Loads chat messages history and listens for upcoming ones.
XmasList.prototype.loadMessages = function() {
    // Reference to the /messages/ database path.
    this.messagesRef = this.database.ref('gifts');
    // Make sure we remove all previous listeners.
    this.messagesRef.off();

    // Loads the last 12 messages and listen for new ones.
    var setMessage = function(data) {
        var val = data.val();
        this.displayMessage(data.key, val.number, val.title, val.linkUrl, val.price);
    }.bind(this);

    this.messagesRef.on('child_added', function (snapshot) {
        setMessage(snapshot);
        itemCount++;
    });
    this.messagesRef.on('child_changed', setMessage);
};

XmasList.ITEM_TEMPLATE =
    '<li class="mdl-list__item mdl-list__item--two-line">' +
        '<span class="pad-right-normal mdl-list__item-secondary-action mdl-typography--title">' +
            '<b class="item-number"></b>' +
        '</span>' +
        '<span class="mdl-list__item-primary-content ">' +
            '<span class="item-title mdl-typography--title"></span>' +
            '<span class="mdl-list__item-sub-title truncate">' +
                '<a target="_blank" class="item-link" ></a>' +
            '</span>' +
        '</span>' +
        '<span class="item-price pad-left-normal mdl-list__item-secondary-action mdl-typography--title"></span>' +
    '</li>';

XmasList.ITEM_TABLE_TEMPLATE =
    '<tr>' +
        '<td class="item-title mdl-data-table__cell--non-numeric"></td>' +
        '<td class="mdl-data-table__cell--non-numeric"><a class="item-link truncate" target="_blank" ></a></td>' +
        '<td class="item-price"></td>' +
    '</tr>';

XmasList.prototype.displayMessage = function(key, number, title, link, price) {
    var div = document.getElementById(key);
    // If an element for that message does not exists yet we create it.
    if (!div) {
        var container = document.createElement('div');
        container.innerHTML = XmasList.ITEM_TEMPLATE;
        div = container.firstChild;
        div.setAttribute('id', key);
        this.xmasList.appendChild(div);
    }

    div.addEventListener('click', function () {
        window.open(link, '_blank')
    })

    div.querySelector('.item-title').textContent = title;
    div.querySelector('.item-number').textContent = "#" + itemCount;

    var linkElement = div.querySelector('.item-link');
    linkElement.textContent = link;
    linkElement.setAttribute('href', link);

    div.querySelector('.item-price').textContent = "$" + price;
    setTimeout(function() {div.classList.add('visible')}, 1);


};

XmasList.prototype.addGift = function() {
    if(this.titleInput.value && this.linkInput.value && this.priceInput.value){

        this.messagesRef.push({
            number: itemCount,
            title: this.titleInput.value,
            linkUrl: this.linkInput.value,
            price: this.priceInput.value
        }).then(function () {
            XmasList.resetMaterialTextfield(this.titleInput);
            XmasList.resetMaterialTextfield(this.linkInput);
            XmasList.resetMaterialTextfield(this.priceInput);
        }.bind(this)).catch(function(error) {
            console.error('Error writing new message to Firebase Database', error);
        });

    }
    dialog.close();
};

// Sets up shortcuts to Firebase features and initiate firebase auth.
XmasList.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    // Initiates Firebase auth and listen to auth state changes.
    // this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

    // We load currently existing chant messages.
    this.loadMessages();
};

// Resets the given MaterialTextField.
XmasList.resetMaterialTextfield = function(element) {
    element.value = '';
    element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

window.onload = function() {
    window.xmasList = new XmasList()
};
