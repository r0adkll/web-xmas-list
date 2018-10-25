/**
 * Created by r0adkll on 11/20/16.
 */
'use strict';

var itemCount = 1;

function XmasList() {

    // Shortcuts to DOM Elements.
    this.xmasList = document.getElementById('xmas-items');

    this.titleInput = document.getElementById('gift-title');
    this.linkInput = document.getElementById('gift-link');
    this.priceInput = document.getElementById('gift-price');
    this.imageLinkInput = document.getElementById('gift-image-link');

    this.addButton = document.getElementById('add-action-button');
    this.addButton.addEventListener('click', this.addGift.bind(this));

    this.initFirebase();
}

function Gift() {
    this.number = 0;
    this.title = "";
    this.linkUrl = "";
    this.imageUrl = "";
    this.price = 0.0;
    this.subgifts = [];
}

function SubGift() {
    this.number = 0;
    this.title = "";
    this.linkUrl = "";
    this.imageUrl = "";
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
        this.displayMessage(data.key, val.number, val.title, val.linkUrl, val.price, val.imageUrl, val.subgifts);
    }.bind(this);

    this.messagesRef.on('child_added', function (snapshot) {
        setMessage(snapshot);
        itemCount++;
    });
    this.messagesRef.on('child_changed', setMessage);
};

XmasList.ITEM_TEMPLATE =
    '<div class="gift-card mdl-card mdl-shadow--4dp mdl-cell mdl-cell--4-col mdl-cell--12-col-phone">' +
        '<div class="mdl-card__media">' +
            '<img class="gift-image" src="" />' +
        '</div>' +
        '<div class="mdl-card__title mdl-card--border">' +
            '<span>' +
                '<h2 class="gift-title mdl-card__title-text"></h2>' +
                '<b class="gift-price"></b>' +
            '</span>' +
        '</div>' +
        '<div class="gift-dependents mdl-card__supporting-text">' +
            '<span>Dependent Gifts</span>' +
            '<ul class="gift-dependents-list mdl-list">' +
            '</ul>' +
        '</div>' +
        '<div class="mdl-card__actions mdl-card--border">' +
            // '<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">' +
            //     'Claim Item' +
            // '</button>' +
            '<button class="gift-purchase mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">' +
                'Purchase' +
            '</button>' +
        '</div>' +
    '</div>';

XmasList.SUBGIFT_TEMPLATE =
    '<li class="mdl-list__item">' +
        '<a href="#" target="_blank" class="item-link mdl-list__item-primary-content">' +
            '<b class="item-number"></b> &nbsp; <span class="item-title"></span>' +
        '</a>' +
        '<span class="mdl-list__item-secondary-content">' +
            '<b class="item-price"></b>' +
        '</span>' +
    '</li>';

XmasList.prototype.displayMessage = function(key, number, title, link, price, imageUrl, subgifts) {
    var div = document.getElementById(key);
    // If an element for that message does not exists yet we create it.
    if (!div) {
        var container = document.createElement('div');
        container.innerHTML = XmasList.ITEM_TEMPLATE;
        div = container.firstChild;
        div.setAttribute('id', key);
        this.xmasList.appendChild(div);
        div.style.order = number
    }

    div.querySelector('.gift-image').setAttribute("src", imageUrl);
    div.querySelector('.gift-title').textContent = title;
    div.querySelector('.gift-price').textContent = "$" + price;
    div.querySelector('.gift-purchase').addEventListener('click', function () {
        window.open(link, '_blank')
    });

    var dependentGifts = div.querySelector('.gift-dependents');
    var dependentGiftList = div.querySelector('.gift-dependents-list');
    if(subgifts && subgifts.length){
        for(var index in subgifts) {
            var subgift = subgifts[index];
            var subgiftKey = "subgift:" + key + ":" + subgift.number;

            var subDiv = document.getElementById(subgiftKey);
            if (!subDiv) {
                var subContainer = document.createElement('div');
                subContainer.innerHTML = XmasList.SUBGIFT_TEMPLATE;
                subDiv = subContainer.firstChild;
                subDiv.setAttribute('id', subgiftKey);
                dependentGiftList.appendChild(subDiv);
            }

            subDiv.querySelector('.item-number').textContent = "#" + subgift.number;
            subDiv.querySelector('.item-title').textContent = subgift.title;
            subDiv.querySelector('.item-price').textContent = "$" + subgift.price;
            subDiv.querySelector('.item-link').setAttribute("href", subgift.linkUrl);
        }
    } else {
        // empty
        dependentGifts.style.display = 'none'
    }

    div.style.order = number
    setTimeout(function() {div.classList.add('visible')}, 1);
};

XmasList.prototype.addGift = function() {
    if(this.titleInput.value && this.linkInput.value && this.priceInput.value && this.imageLinkInput.value){

        this.messagesRef.push({
            number: itemCount,
            title: this.titleInput.value,
            linkUrl: this.linkInput.value,
            price: this.priceInput.value,
            imageUrl: this.imageLinkInput.value
        }).then(function () {
            XmasList.resetMaterialTextfield(this.titleInput);
            XmasList.resetMaterialTextfield(this.linkInput);
            XmasList.resetMaterialTextfield(this.priceInput);
            XmasList.resetMaterialTextfield(this.imageLinkInput);
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
