/*

*/
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/string",
        "dojo/topic",
        "dojo/request/xhr",
        "dojo/request",
        "dojo/on",
        "app/context/app-topics",
        "dojo/dom",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dijit/registry",
        "dijit/_WidgetBase",
        "dijit/_AttachMixin",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/Tooltip",
        "dijit/TooltipDialog",
        "dijit/popup",
        "app/collection/CollectionBase",
        "app/collection/SavedCollections",
        "app/collection/SavedSearches",
        "dojo/text!./templates/SavedItemCard.html",
        "dojo/i18n!app/nls/resources",
        "app/etc/util",

    ],
    function (declare, lang, array, string, topic, xhr, request, on, appTopics, dom, domClass, domConstruct, registry,
              _WidgetBase, _AttachMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Tooltip, TooltipDialog, popup,
              CollectionBase, SavedCollections,SavedSearches,
              template, i18n,  util) {

        var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            i18n: i18n,
            templateString: template,

            isItemCard: true,
            mdRecord: null,
            itemsNode: null,
            itemsPane: null,
            itemIsSaved: true,


            postCreate: function () {
                this.inherited(arguments);
                var self = this;
                this.own(topic.subscribe("app/collection/selectCollection", function (params) {
                    self._renderActionStatus(self.mdRecord);
                }));
                // this.own(topic.subscribe(appTopics.ItemOwnerChanged,function(params){
                //     if (self.item && self.item === params.item) {
                //         self._renderOwnerAndDate(self.item);
                //     }
                // }));
                // this.own(topic.subscribe(appTopics.ItemApprovalStatusChanged,function(params){
                //     if (self.item && self.item === params.item) {
                //         self._renderOwnerAndDate(self.item);
                //     }
                // }));
                // this.own(topic.subscribe(appTopics.ItemAccessChanged,function(params){
                //     if (self.item && self.item === params.item) {
                //         self._renderOwnerAndDate(self.item);
                //     }
                // }));


                // this.own(topic.subscribe(appTopics.itemStatusChanged,function(params){
                //     if (self.item && self.item._id === params.item._id && params.status) {
                //         self._renderItemsSaveStatus(self.item, params.status);
                //     }
                // }));
                //collection
                //  on(this,"click", setSavedCard);
                // use a publish/subscribe? for assignEvent, setSavedCard
                // on(this,"click", assignEvent);

                // setSavedCard();
                // assignEvent();

            },

            // startup:  function () {

            //   },

            render: function (mdRecord) {
                this.mdRecord = mdRecord;

                this._renderTitle(mdRecord);

                this._renderDescription(mdRecord);
                this._renderCollections(mdRecord);
                this._renderActionStatus(mdRecord); // enable/disable buttons

            },

            _mouseenter: function (e) {
                topic.publish("app/collection/OnMouseEnterSavedItem", {item: this.mdRecord});
            },

            _mouseleave: function (e) {
                topic.publish("app/collection/OnMouseLeaveSavedItem", {item: this.mdRecord});
            },
            onAddCollectionClicked: function (evt) {
             //   var collTxtBox = registry.byId("collectionMenuNode");
                var coll = this.getSelectedCollectionValue();
                CollectionBase._addCollectionMdRecord(this.mdRecord, coll);
                this._renderCollections(this.mdRecord)
                this._renderActionStatus(this.mdRecord);
                // this.myTempDialog.show();
            },
            onRemoveCollectionClicked: function (evt) {
               // var collTxtBox = registry.byId("collectionMenuNode");
                var coll =this.getSelectedCollectionValue();
                CollectionBase._removeCollectionMdRecord(this.mdRecord, coll);
                this._renderCollections(this.mdRecord)
                this._renderActionStatus(this.mdRecord);
                // this.myTempDialog.show();
            },
            onRemoveMDRecordClicked: function (evt) {

                CollectionBase.removeMdRecord(this.mdRecord);
                this.mdRecord.title = 'deleted';
                this._renderTitle(this.mdRecord)
            },

            _renderCollections: function (mdRecord) {
                var collections = mdRecord.collections;
                if (collections !== null && collections instanceof Array && collections.length > 0) {
                    var collString = "collections:"
                    array.forEach(collections, function (coll) {
                        var collName = CollectionBase.getCollectionNameById(coll);
                        collString = collString + ", " + collName;
                    })
                    util.setNodeText(this.collectionsNode, collString);
                }

            },

            _renderDescription: function (mdRecord, highlight) {
                var desc = mdRecord.description;
                if (desc && desc.indexOf("REQUIRED FIELD") > -1) {
                    desc = "";
                }
                if (typeof highlight != "undefined") {

                    if (typeof highlight.description != "undefined") {

                        desc = highlight.description;
                        util.setNodeHtml(this.descriptionNode, desc);
                    } else {
                        util.setNodeText(this.descriptionNode, desc);
                    }
                } else {
                    util.setNodeText(this.descriptionNode, desc);
                }

            },
            _renderTitle: function (mdRecord, highlight) {
                var title = mdRecord.title;
                if (!title || 0 === title.length) {
                    title = "Title Not Provided. Identifier: " + mdRecord.id;
                }

                if (typeof highlight != "undefined") {
                    if (typeof highlight.title != "undefined") {
                        title = highlight.title;
                    }
                }

                var titleElement = domConstruct.create("a", {
                    // href: mdRecord.mdlink +"/html",
                    href: mdRecord.mdlink,
                    target: "_blank",
                    title: title,
                    "aria-label": title,
                    innerHTML: title
                }, this.titleNode);

            },
            _renderActionStatus: function (mdRecord) {
                var add = this.addButton;
                var rmColl = this.rmCollectionButton;
                var rmMd = this.rmMdRecordButton;
                var recSaved = CollectionBase.isSavedItem(mdRecord.id);

              //  var collTxtBox = registry.byId("collectionMenuNode");
              //  var coll = collTxtBox.value;
                var coll = this.getSelectedCollectionValue();
                switch (CollectionBase._inCollectionMdRecord(mdRecord, coll)) {
                    case true:
                        add.disabled = true;
                        add.title = "item in " + coll;
                        rmColl.disabled = false;
                        rmColl.title = "remove item from " + coll;

                        break;
                    case false:
                        add.disabled = false;
                        add.title = "add item to " + coll;
                        rmColl.disabled = true;
                        rmColl.title = " not in " + coll;
                        break;
                    default:
                        add.disabled = true;
                        add.title = "Select a collection";
                        rmColl.disabled = true;
                        rmColl.title = "Select a collection";
                        break;
                }
                if (recSaved.isSaved) {
                    rmMd.disabled = false;
                    rmMd.visibility = "visible";
                } else {
                    rmMd.disabled = true;
                    rmMd.visibility = "hidden";
                    rmMd.title = "Search Items cannot be saved, at present";
                    add.disabled = true;
                    add.title = "Search Items cannot be saved, at present";
                    rmColl.disabled = true;
                    rmColl.title = "Search Items cannot be saved, at present";
                }


            },
            // dojo.form.select can only produce a dropdown, and not a scrolling select box
            // can't use dojo/registry, so these isolates code for future change.
            getSelectedCollectionValue: function () {
                var collMenuNode = dom.byId("collectionMenuNode");
                return collMenuNode.value;
            }
            ,
            setSelectedCollectionValue: function (value) {
                var collMenuNode = dom.byId("collectionMenuNode");
                this.collMenuNode.value = value;
            },
            getSelectedCollectionDisplayedValue: function () {
                var collMenuNode = dom.byId("collectionMenuNode");
                return collMenuNode.selectedOptions[0].label;
            },

            getSelectedSearchValue: function () {
                var collMenuNode = dom.byId("savedSearchMenu");
                return collMenuNode.value;
            }
            ,
            setSelectedSearchValue: function (value) {
                var collMenuNode = dom.byId("savedSearchMenu");
                this.collMenuNode.value = value;
            },
            getSelectedSearchDisplayedValue: function () {
                var collMenuNode = dom.byId("savedSearchMenu");
                return collMenuNode.selectedOptions[0].label;
            },
        });

        return oThisClass;

    });