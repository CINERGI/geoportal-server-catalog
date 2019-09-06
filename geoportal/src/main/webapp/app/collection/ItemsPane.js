/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/topic",
        "dojo/aspect",
        "dojo/dom-construct",
        "dijit/registry",
        "app/common/Templated",
        "dojo/text!./templates/ItemsPane.html",
        "dojo/i18n!app/nls/resources",
        "app/collection/CollectionComponent",
        "app/collection/CollectionBase",
        "app/collection/SavedItemCard",
        "app/collection/PagingCollections",
        "app/search/DropPane",
        "dojox/widget/Standby",
        "app/collection/CollectionRunInJupyter"],
    function (declare, lang, array, topic, aspect, domConstruct, registry, Templated, template, i18n, CollectionComponent, CollectionBase, SavedItemCard,
              PagingCollections, DropPane, Standby, jupyterHub) {

        var oThisClass = declare([CollectionComponent], {
//var oThisClass = declare([Templated], {
            i18n: i18n,
            templateString: template,

            label: "Collection Items",
            // label: i18n.search.results.label,
            open: true,
            paging: null,
            sortField: null,
            sortDir: null,


            postCreate: function () {
                var self = this;
                this.inherited(arguments);
                // this.addSort();
                this.paging = new PagingCollections({});
                this.paging.placeAt(this.dropPane.toolsNode);
                this.collectionStatusNode.target = this.dropPane.domNode;

                if (typeof this.numPerPage === "undefined" || this.numPerPage === null) {
                    this.numPerPage = 10;
                }
                if (typeof this.showPageCount === "undefined" || this.showPageCount === null) {
                    this.showPageCount = AppContext.appConfig.searchResults.showPageCount;
                }
                if (typeof this.showPageCount === "undefined" || this.showPageCount === null) {
                    this.showPageCount = false;
                }

                if (typeof this.maxShowPageCount === "undefined" || this.maxShowPageCount === null) {
                    this.maxShowPageCount = AppContext.appConfig.searchResults.maxShowPageCount;
                }
                if (typeof this.maxShowPageCount === "undefined" || this.maxShowPageCount === null) {
                    this.maxShowPageCount = 9999;
                }
                // We refresh on clicking view, not select.
                this.own(topic.subscribe("app/collection/selectCollection",function(params){
                  var menu = registry.byId("collectionMenuNode");
                  var coll = menu.get("displayedValue");
                  self.dropPane.set("label" ,  "Collection Items from " + coll);

                  self.dropPane.set("title" ,  "Collection Items from " + coll);

                }));
                //  document.body.appendChild(this.statusNode.domNode);
                // this.statusNode.target = this.dropPane.domNode;
                //  this.own(topic.subscribe("app/collection/assignEvent",function(item){
                //
                //      self.assignEvent(item);
                //    }
                //  ));

                //setSavedCard();
            },

            processSavedResults: function (records, totalRecords, nextPage, startRec, endRec) {
                var self = this;
                this.destroyItems();
                this.paging.collectionPane = this.collectionPane;
                this.paging.processSavedResults(records, totalRecords, nextPage, startRec, endRec);

                if (Array.isArray(records)) {

                    array.forEach(records, function (md) {
                        var itemCard = new SavedItemCard({
                            itemsNode: self.itemsNode,
                            itemsPane: self.itemsPane,
                            mdRecord: md
                        });
                        itemCard.render(md.val);
                        itemCard.placeAt(self.itemsNode);

                    })
                } else {
                    var itemCard = new SavedItemCard({
                        itemsNode: self.itemsNode,
                        itemsPane: self.itemsPane,
                        mdRecord: md
                    });
                    itemCard.render(item.val);
                    itemCard.placeAt(self.itemsNode);

                }
            },
            destroyItems: function (searchContext, searchResponse) {
                this.noMatchNode.style.display = "none";
                this.noMatchNode.innerHTML = "";
                var rm = [];
                array.forEach(this.dropPane.getChildren(), function (child) {
                    if (child.isItemCard){
                        child.mdRecord = null;
                        rm.push(child);
                    }
                });
                array.forEach(rm, function (child) {
                    this.dropPane.removeChild(child);
                }, this);
            },

            addSort: function () {
                var self = this, dd = null;
                var addOption = function (parent, ddbtn, label, field, sortDir) {
                    var ddli = domConstruct.create("li", {}, parent);
                    domConstruct.create("a", {
                        "class": "small",
                        "href": "javascript:void(0)",
                        innerHTML: label,
                        onclick: function (e) {
                            var dir = sortDir;
                            if (field !== null && field === self.sortField) {
                                if (self.sortDir === "asc") dir = "desc";
                                else dir = "asc";
                            }
                            self.sortField = field;
                            self.sortDir = dir;
                            if (dir === null) {
                                ddbtn.innerHTML = label + "<span class='glyphicon glyphicon-triangle-right'></span>";
                            } else if (dir === "asc") {
                                ddbtn.innerHTML = label + "<span class='glyphicon glyphicon-triangle-top'></span>";
                            } else {
                                ddbtn.innerHTML = label + "<span class='glyphicon glyphicon-triangle-bottom'></span>";
                            }
                            //ddbtn.innerHTML = label+"<span class='caret'></span>";
                            $(dd).removeClass('open');
                            self.search();
                        }
                    }, ddli);
                };

                dd = domConstruct.create("div", {
                    "class": "dropdown g-sort-dropdown"
                }, this.dropPane.toolsNode);
                var ddbtn = domConstruct.create("a", {
                    "class": "dropdown-toggle",
                    "href": "#",
                    "data-toggle": "dropdown",
                    "aria-haspopup": true,
                    "aria-expanded": true,
                    innerHTML: i18n.search.sort.byRelevance,
                    onclick: function (e) {
                        if ($(dd).hasClass('open')) {
                            $(dd).removeClass('open');
                        } else {
                            $(dd).addClass('open');
                        }
                        e.stopPropagation();
                    }
                }, dd);
                domConstruct.create("span", {"class": "glyphicon glyphicon-triangle-right"}, ddbtn);
                var ddul = domConstruct.create("ul", {"class": "dropdown-menu"}, dd);

                addOption(ddul, ddbtn, i18n.search.sort.byRelevance, null, null);
                addOption(ddul, ddbtn, i18n.search.sort.byTitle, "title.sort", "asc");
                addOption(ddul, ddbtn, i18n.search.sort.byDate, "sys_modified_dt", "desc");
            },


        });

        return oThisClass;
    });