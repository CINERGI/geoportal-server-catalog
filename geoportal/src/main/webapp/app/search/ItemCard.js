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

  Change log
  SMR2018-08-18
  uniqueLinks looks at distribution_links_s
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
  "dojo/dom-class",
  "dojo/dom-construct",
  "dijit/_WidgetBase",
  "dijit/_AttachMixin",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/Tooltip",
  "dijit/TooltipDialog",
  "dijit/popup",
  "dojo/text!./templates/ItemCard.html",
  "dojo/i18n!app/nls/resources",
  "app/context/AppClient",
  "app/etc/ServiceType",
  "app/etc/util",
  "app/common/ConfirmationDialog",
  "app/content/ChangeOwner",
  "app/content/DeleteItems",
  "app/content/MetadataEditor",
  "app/context/metadata-editor",
  "app/content/SetAccess",
  "app/content/SetApprovalStatus",
  "app/content/SetField",
  "app/content/UploadMetadata",
  "app/preview/PreviewUtil",
  "app/preview/PreviewPane",

    "app/prov/Prov",

      "app/common/JupyterDialog",
    "app/collection/CollectionBase",
      // "app/collection/CollectionScripts",
    ],
function(declare, lang, array, string, topic, xhr, request, on, appTopics, domClass, domConstruct,
  _WidgetBase,_AttachMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Tooltip, TooltipDialog, popup,
  template, i18n, AppClient, ServiceType, util, ConfirmationDialog, ChangeOwner, DeleteItems,
  MetadataEditor, gxeConfig, SetAccess, SetApprovalStatus, SetField, UploadMetadata, 
  PreviewUtil, PreviewPane, prov,JupyterDialog, CollectionBase, Collection) {
  
  var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
 
    i18n: i18n,
    templateString: template,

    isItemCard: true,
    item: null,
    itemsNode: null,
    searchPane: null,
    itemIsSaved: false,

  //    script: 'custom/localCollectionSaveEvents.js',
  //    script2: 'custom/localCollectionSaveUI.js',

    allowedServices: {
      "featureserver":"agsfeatureserver",
      "imageserver":"agsimageserver",
      "mapserver":"agsmapserver",
      "csw": "csw",
      "ims": "image",
      "sos": "sos",
      "wcs": "wcs",
      "wfs": "wfs",
      "wms": "wms"
    },
     // "jupyter_hubs_file":require.toUrl("custom/jupyter_hubs.json"),
     //  jupyter_hubs_json: hubs,
     //  jupyter_hubs: dojo.fromJson(hubs),

    postCreate: function() {
      this.intializeToolTip();
      this.inherited(arguments);
      var self = this;
      this.own(topic.subscribe(appTopics.ItemOwnerChanged,function(params){
        if (self.item && self.item === params.item) {
          self._renderOwnerAndDate(self.item);
        }
      }));
      this.own(topic.subscribe(appTopics.ItemApprovalStatusChanged,function(params){
        if (self.item && self.item === params.item) {
          self._renderOwnerAndDate(self.item);
        }
      }));
      this.own(topic.subscribe(appTopics.ItemAccessChanged,function(params){
        if (self.item && self.item === params.item) {
          self._renderOwnerAndDate(self.item);
        }
      }));


      this.own(topic.subscribe(appTopics.itemStatusChanged,function(params){
        if (self.item && self.item._id === params.item._id && params.status) {
          self._renderItemsSaveStatus(self.item, params.status);
        }
      }));
      //collection
       //  on(this,"click", setSavedCard);
      // use a publish/subscribe? for assignEvent, setSavedCard
     // on(this,"click", assignEvent);

       // setSavedCard();
        // assignEvent();

    },

    // startup:  function () {

    //   },

    render: function(hit) {

        var item = this.item = hit._source;
      var highlight = hit.highlight;
      item._id = hit._id;
      this.itemIsSaved = CollectionBase.isSavedItem(item._id).isSaved;
      var links = this._uniqueLinks(item);
     // util.setNodeText(this.titleNode,item.title);
        this._renderTitle(item, highlight);
        //this._renderOwnerAndDate(item);
        this._renderSourceAndDate(item);
        this._renderCollectionAndDate(item);
        //util.setNodeText(this.descriptionNode,item.description);
        this._renderDescription(item,highlight);
      this._renderThumbnail(item);
     // this._renderItemLinks(hit._id,item);
      var itemsDropdown = this._renderItemDropdown(hit._id,item);
      this._renderCinergiAddToDropdown(itemsDropdown, item);
      this._renderLinksDropdown(item,links);
      this._renderOptionsDropdown(hit._id,item);
      this._renderAddToMap(item,links);
      this._renderServiceStatus(item);
      this._renderUrlLinks(item);


      this._renderWbLink(item);
      //  this._renderCinergiLinks(hit._id,item);
      //  this._renderSchemaOrg(item);
      this._renderId(item);
      var status = "save";
      if (this.itemIsSaved){
        status="saved"
      } else {
        status = "not saved";
      }
      this._renderItemsSaveStatus(item, status);
    },
    
    _canEditMetadata: function(item,isOwner,isAdmin,isPublisher) {
      var v;
      if ((isOwner && isPublisher) || isAdmin) {
        v = item.sys_metadatatype_s;
        if (typeof v === "string") {
          if (gxeConfig.editable.geoportalTypes.indexOf(v) !== -1) {
            if (gxeConfig.editable.allowNonGxeDocs) {
              return true;
            }
            v = item.app_editor_s;
            if (typeof v === "string" && v === "gxe") {
              return true;
            }
          }
        }
      }
      return false;
    },
    
    _isOwner: function(item) {
      var username = AppContext.appUser.getUsername();
      if (typeof username === "string" && username.length > 0) {
        return (username === item.sys_owner_s);
      }
      return false;
    },
    
    _mitigateDropdownClip: function(dd,ddul) {
      // Bootstrap dropdown menus clipped by scrollable container
      var self = this;
      var reposition = function() {
        //console.warn($(dd).offset());
        var t = $(dd).offset().top + 15 - $(window).scrollTop();
        var l = $(dd).offset().left;
        $(ddul).css('top',t);
        $(ddul).css('left',l);
        
        var position = dd.getBoundingClientRect().top;
        var buttonHeight = dd.getBoundingClientRect().height;
        var menuHeight = $(ddul).outerHeight();
        var winHeight = $(window).height();
        if (position > menuHeight && winHeight - position < buttonHeight + menuHeight) {
          //console.warn("dropup","position:",position,"t",t,"buttonHeight",buttonHeight,"menuHeight",menuHeight);
          t = t - menuHeight - buttonHeight - 4;
          $(ddul).css('top',t);
        } 
      };
      $(ddul).css("position","fixed");
      $(dd).on('click', function() {reposition();});
      //$(window).scroll(function() {reposition();});
      //$(this.itemsNode).scroll(function() {reposition();});
      //$(window).resize(function() {reposition();});
    },
    
    _mouseenter: function(e) {
      topic.publish(appTopics.OnMouseEnterResultItem,{item:this.item});
    },

    _mouseleave: function(e) {
      topic.publish(appTopics.OnMouseLeaveResultItem,{item:this.item});
    },
    
    _renderPreview: function(item, actionsNode, serviceType) {
      
      // declare preview pane
      var previewPane;
      
      // create preview area 
      var previewArea = domConstruct.create("div");
      var tooltipDialog = new TooltipDialog({
          style: "width: 470px; height: 320px;",
          content: previewArea,
          
          onBlur: function() {
            // cause to hide dialog whenever user clicks outside the map
            popup.close(tooltipDialog);
          },
          
          onKeyPress: function(event) {
            // cause to hide dialog whenever ESC key is being pressed
            if (event.keyCode === 27) {
              popup.close(tooltipDialog);
            }
          },
          
          onShow: function() {
            // focus automatically
            tooltipDialog.focus();
            
            // create new preview pane
            previewPane = new PreviewPane({serviceType: serviceType}, previewArea);
            previewPane.startup();
          },
          
          onHide: function() {
            // destroy preview pane
            previewPane.destroy();
            previewPane = null;
          }
      });
      this.own(tooltipDialog);
      
      // create clickable link to launch preview dialog
      var previewNode = domConstruct.create("a",{
        href: "javascript:void(0)",
        title: string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.preview, title: item.title}),
        "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.preview, title: item.title}),
        innerHTML: i18n.item.actions.preview
      },actionsNode);
      
      // install 'onclick' event handler to show tooltip dialog
      this.own(on(previewNode, "click", function() {
        popup.open({
          popup: tooltipDialog,
          around: previewNode
        });
      }));
    },
    
    _renderAddToMap: function(item,links) {
      if (links.length === 0) return;
      var endsWith = function(v,sfx) {return (v.indexOf(sfx,(v.length-sfx.length)) !== -1);};
      var actionsNode = this.actionsNode;
      array.some(links, lang.hitch(this, function(u){
        var serviceType = new ServiceType();
        serviceType.checkUrl(u);
        //console.warn("serviceType",serviceType.isSet(),serviceType);
        if (serviceType.isSet()) {
          domConstruct.create("a",{
            href: "javascript:void(0)",
            innerHTML: i18n.item.actions.addToMap,
            title: string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.addToMap, title: item.title}),
            "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.addToMap, title: item.title}),
            onclick: function() {
              topic.publish(appTopics.AddToMapClicked,serviceType);
            }
          },actionsNode);
          
          // create clickable 'Preview' link if allowes
          if (PreviewUtil.canPreview(serviceType)) {
            this._renderPreview(item, actionsNode, serviceType);
          }
          
          return true;
        }
      }));
    },
    
    _renderItemLinks: function(itemId,item) {
      if (AppContext.appConfig.searchResults.showLinks) {
        var metadataNode = this.metadataNode;
        var htmlNode = domConstruct.create("a",{
          href: util.createRestMDLink(itemId, "/html"),
          target: "_blank",
          title: string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.html, title: item.title}),
          "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.html, title: item.title}),
          innerHTML: i18n.item.actions.html
        },metadataNode);
        var xmlNode = domConstruct.create("a",{
          href: util.createRestMDLink(itemId, "/xml"),
          target: "_blank",
          title: string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.xml, title: item.title}),
          "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.xml, title: item.title}),
          innerHTML: i18n.item.actions.xml
        },metadataNode);
        var jsonNode = domConstruct.create("a",{
          href: util.createRestMDLink(itemId, "?pretty=true"),
          target: "_blank",
          title: string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.json, title: item.title}),
          "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.json, title: item.title}),
          innerHTML: i18n.item.actions.json
        },metadataNode);

        var v = item.sys_metadatatype_s;
        if (typeof v === "string" && v === "json") {
          htmlNode.style.visibility = "hidden";
          xmlNode.style.visibility = "hidden";
        }
      }
    },


    _renderItemDropdown: function(itemId,item) {
      if (AppContext.appConfig.searchResults.showLinks) {
        var actionName = "Item Details";
        var metadataNode = this.metadataNode;
        var dd = domConstruct.create("div",{
          "class": "dropdown",
          "style": "display:inline-block;"
        },metadataNode);
        var ddbtn = domConstruct.create("a",{
          "class": "dropdown-toggle",
          "href": "#",
          "data-toggle": "dropdown",
          "aria-haspopup": true,
          "aria-expanded": true,
          title: string.substitute(i18n.item.actions.titleFormat, {action: actionName, title: item.title}),
          "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: actionName, title: item.title}),
          innerHTML: actionName
        },dd);
        domConstruct.create("span",{
          "class": "caret"
        },ddbtn);
        var ddul = domConstruct.create("ul",{
          "class": "dropdown-menu",
        },dd);

        var ddli = domConstruct.create("li",{},ddul);
        var htmlNode = domConstruct.create("a",{
          href: util.createRestMDLink(itemId, "/html"),
          target: "_blank",
          title: string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.html, title: item.title}),
          "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.html, title: item.title}),
          innerHTML: i18n.item.actions.html
        },ddli);
        var ddli2 = domConstruct.create("li",{},ddul);
        var xmlNode = domConstruct.create("a",{
          href: util.createRestMDLink(itemId, "/xml"),
          target: "_blank",
          title: string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.xml, title: item.title}),
          "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.xml, title: item.title}),
          innerHTML: i18n.item.actions.xml
        },ddli2);
        var ddli3 = domConstruct.create("li",{},ddul);
        var jsonNode = domConstruct.create("a",{
          href: util.createRestMDLink(itemId, "?pretty=true"),
          target: "_blank",
          title: string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.json, title: item.title}),
          "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.json, title: item.title}),
          innerHTML: i18n.item.actions.json
        },ddli3);

        var v = item.sys_metadatatype_s;
        if (typeof v === "string" && v === "json") {
          htmlNode.style.visibility = "hidden";
          xmlNode.style.visibility = "hidden";
        }
      }
      return ddul; // hook to add more items
    },

    _renderLinksDropdown: function(item,links) {
      if (links.length === 0) return;
      var dd = domConstruct.create("div",{
        "class": "dropdown",
        "style": "display:inline-block;"
      },this.actionsNode);
      var ddbtn = domConstruct.create("a",{
        "class": "dropdown-toggle",
        "href": "#",
        "data-toggle": "dropdown",
        "aria-haspopup": true,
        "aria-expanded": true,
        title: string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.links, title: item.title}),
        "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: i18n.item.actions.links, title: item.title}),
        innerHTML: i18n.item.actions.links
      },dd);
      domConstruct.create("span",{
        "class": "caret"
      },ddbtn);
      var ddul = domConstruct.create("ul",{
        "class": "dropdown-menu",
      },dd);

     /*
      use the dist_links_nst to get more link information
      */
      var dist_links=item.dist_link_nst;

      function getdistname (url) {
          //console.log("getdistname");
          var result="";

          if (lang.isArray(url)) {
            array.forEach(url, function(alink){
               //console.log(alink);
               if (typeof alink.url_s === "string" ) {
                   if (typeof alink.url_name_s === "string"){
                        result = alink.url_name_s;
                      }
                    } else {
                   url = alink.url_s;
               }
               }
            );
          } else if (lang.isObject(url)) {
            if (typeof url.url_s === "string" ) {
             if (typeof url.url_name_s === "string"){
                  result = url.url_name_s;
                }
                else {
                  url = url.url_s;
             }
              };
          }
          if (result === ""){
            return url;
            } else {
            return result;
            }
      };

      array.forEach(links, function(u){
        var ddli = domConstruct.create("li",{},ddul);
        var thelabel = getdistname(u);
        var url ;
        if (lang.isObject(u)){
          if (u.url_s) url = u.url_s;
        } else if (typeof u === "string")
        { url = u;}
        domConstruct.create("a",{
          "class": "small",
          href: url,
          target: "_blank",
          title: string.substitute(i18n.item.actions.titleFormat, {action: u, title: item.title}),
          "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: u, title: item.title}),
          innerHTML: thelabel
        },ddli);
      });
      this._mitigateDropdownClip(dd,ddul);
    },
    
    _renderOptionsDropdown: function(itemId,item) {
      var self = this;
      var isOwner = this._isOwner(item);
      var isAdmin = AppContext.appUser.isAdmin();
      var isPublisher = AppContext.appUser.isPublisher();
      var supportsApprovalStatus = AppContext.geoportal.supportsApprovalStatus;
      var supportsGroupBasedAccess = AppContext.geoportal.supportsGroupBasedAccess;
      var links = [];
      
      if (this._canEditMetadata(item,isOwner,isAdmin,isPublisher)) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.item.actions.options.editMetadata,
          onclick: function() {
            var editor = new MetadataEditor({itemId:itemId});
            editor.show();
          }
        }));
      }
      
      var canManage = ((isOwner && isPublisher) || isAdmin);
      
      if (canManage) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.item.actions.options.uploadMetadata,
          onclick: function() {
            (new UploadMetadata({itemId:itemId})).show();
          }
        }));
      }
      
      if (isAdmin) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.content.changeOwner.caption,
          onclick: function() {
            var dialog = new ChangeOwner({item:item,itemCard:self});
            dialog.show();
          }
        }));
      }
      
      if (supportsApprovalStatus && canManage) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.content.setApprovalStatus.caption,
          onclick: function() {
            var dialog = new SetApprovalStatus({item:item,itemCard:self});
            dialog.show();
          }
        }));
      }
      
      if (supportsGroupBasedAccess && canManage) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.content.setAccess.caption,
          onclick: function() {
            var dialog = new SetAccess({item:item,itemCard:self});
            dialog.show();
          }
        }));
      }
      
      if (canManage && AppContext.appConfig.edit && AppContext.appConfig.edit.setField && 
          AppContext.appConfig.edit.setField.allow && 
          (isAdmin || !AppContext.appConfig.edit.setField.adminOnly)) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.content.setField.caption,
          onclick: function() {
            var dialog = new SetField({item:item,itemCard:self});
            dialog.show();
          }
        }));        
      }
      
      if (canManage) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.content.deleteItems.caption,
          onclick: function() {
            var dialog = new DeleteItems({item:item,itemCard:self});
            dialog.show();
          }
        }));
      }
      
//      if (canManage) {
//        links.push(domConstruct.create("a",{
//          "class": "small",
//          href: "javascript:void(0)",
//          innerHTML: i18n.item.actions.options.deleteItem,
//          onclick: function() {
//            var dialog = new ConfirmationDialog({
//              title: i18n.item.actions.options.deleteItem,
//              content: item.title,
//              okLabel: i18n.general.del,
//              status: "danger"
//            });
//            dialog.show().then(function(ok){
//              if (ok) {
//                dialog.okCancelBar.showWorking(i18n.general.deleting,false);
//                var client = new AppClient();
//                client.deleteItem(itemId).then(function(response){
//                  topic.publish(appTopics.ItemDeleted,{
//                    itemId: itemId,
//                    searchPane: self.searchPane
//                  });
//                  self.domNode.style.display = "none";
//                  dialog.hide();
//                }).otherwise(function(error){
//                  var msg = i18n.general.error;
//                  console.warn("deleteItem.error",error);
//                  dialog.okCancelBar.showError(msg,false);
//                });
//              }
//            });
//          }
//        }));        
//      }

      if (links.length === 0) return;
      
      var dd = domConstruct.create("div",{
        "class": "dropdown",
        "style": "display:inline-block;"
      },this.actionsNode);
      var ddbtn = domConstruct.create("a",{
        "class": "dropdown-toggle",
        "href": "#",
        "data-toggle": "dropdown",
        "aria-haspopup": true,
        "aria-expanded": true,
        innerHTML: i18n.item.actions.options.caption
      },dd);
      domConstruct.create("span",{
        "class": "caret"
      },ddbtn);
      var ddul = domConstruct.create("ul",{
        "class": "dropdown-menu",
      },dd);
      array.forEach(links,function(link){
        var ddli = domConstruct.create("li",{},ddul);
        ddli.appendChild(link);
      });
      this._mitigateDropdownClip(dd,ddul);
    },
    
    _renderOwnerAndDate: function(item) {
      var owner = item.sys_owner_s;
      var date = item.sys_modified_dt;
      var idx, text = "", v;
      if (AppContext.appConfig.searchResults.showDate && typeof date === "string" && date.length > 0) {
        idx = date.indexOf("T");
        if (idx > 0) date =date.substring(0,idx);
        text = date;
      }
      if (AppContext.appConfig.searchResults.showOwner && typeof owner === "string" && owner.length > 0) {
        if (text.length > 0) text += " ";
        text += owner;
      }
      
      if (AppContext.appUser.isAdmin() || this._isOwner(item)) {
        if (AppContext.appConfig.searchResults.showAccess && 
            AppContext.geoportal.supportsGroupBasedAccess) {
          v = item.sys_access_s;
          if (text.length > 0) text += " - ";
          if (v === "private") {
            text += i18n.content.setAccess._private;
          } else {
            text += i18n.content.setAccess._public;
          }
        }
        if (AppContext.appConfig.searchResults.showApprovalStatus && 
            AppContext.geoportal.supportsApprovalStatus) {
          v = item.sys_approval_status_s;
          if (typeof v === "string" && v.length > 0) {
            v = i18n.content.setApprovalStatus[v];
          }
          if (typeof v === "string" && v.length > 0) {
            if (text.length > 0) text += " - ";
            text += v;
          }
        }
      }
      
      if (text.length > 0) {
        util.setNodeText(this.ownerAndDateNode,text);
      }
    },
    
    _renderThumbnail: function(item) {
      var show = AppContext.appConfig.searchResults.showThumbnails;
      var thumbnailNode = this.thumbnailNode;
      if (show && typeof item.thumbnail_s === "string" && item.thumbnail_s.indexOf("http") === 0) {
        setTimeout(function(){
          thumbnailNode.src = util.checkMixedContent(item.thumbnail_s);
        },1);
      } else {
        thumbnailNode.style.display = "none";
      }
      //thumbnailNode.src = "http://placehold.it/80x60";
    },
    
    _uniqueLinks: function(item) {
      var links = [];
      //smr 2018-08-18 update to use distribution_links_s
      if (lang.isArray(item.dist_link_nst)) {
        array.forEach(item.dist_link_nst, function(u){
          if (links.indexOf(u) === -1) links.push(u);
        });
      } else if ( item.dist_link_nst) // there is one
       // (typeof item.dist_link_nst === "string"  )
        {
            links = [item.dist_link_nst];
      }
      else if  (item.links_s) {
          if (typeof item.links_s === "string") {
              links = [item.links_s];
          } else if (lang.isArray(item.links_s)) {
              array.forEach(item.links_s, function(u){
                  if (links.indexOf(u) === -1) links.push(u);
              });
          }
      }
      return links;
    },
    
    _renderServiceStatus: function(item) {
      var type;
      var authKey = AppContext.appConfig.statusChecker.authKey;
      if (authKey && string.trim(authKey).length>0) {
        if (item && item.resources_nst) {
          if (item.resources_nst.length) {
            for (var i=0; i<item.resources_nst.length; i++) {
              type = this._translateService(item.resources_nst[i].url_type_s);
              if (type) {
                this._checkService(item._id,type);
                break;
              }
            }
          } else {
            type = this._translateService(item.resources_nst.url_type_s);
            if (type) {
              this._checkService(item._id,type);
            }
          }
        }
      }
    },
    
    _checkService: function(id,type) {
      console.log("Service check for: ", id, type);
      xhr.get("viewer/proxy.jsp?"+AppContext.appConfig.statusChecker.apiUrl,{
        query: {
          auth: AppContext.appConfig.statusChecker.authKey,
          type: type,
          id: id
        },
        handleAs: "json"
      }).then(lang.hitch({self: this, id: id, type: type},this._drawStatusIcon));
    },
    
    _drawStatusIcon: function(response) {
      if (response.error) {
        console.error(response.error);
      } else if (response.data!=null && response.data.constructor==Array && response.data.length>0) {
        var score = response.data[0].summary.scoredTest.currentScore;
        this.self._setServiceCheckerIcon(score,this.id,this.type);
      }    
    },
    
    _setServiceCheckerIcon: function(score,id,type) {
      console.log("SCORE", score);
      var imgSrc;
      var info;
      if(!score || score < 0) {
        imgSrc = "Unknown16.png";
        info = i18n.item.statusChecker.unknown;
      } else if(score <= 25) {
        imgSrc = "VeryBad16.png";
      } else if(score <= 50 ) {
        imgSrc = "Bad16.png";
      } else if(score <= 75 ) {
        imgSrc = "Good16.png";
      } else if(score > 75 && score <= 100) {
        imgSrc = "Excellent16.png";
      } else {
        imgSrc = "Unknown16.png";
        info = i18n.item.statusChecker.unknown;
      }
      if (!info) {
        info = string.substitute(i18n.item.statusChecker.status,{score: score});
      }
      
      var link = domConstruct.create("a",{
        href: AppContext.appConfig.statusChecker.infoUrl+"?auth="+AppContext.appConfig.statusChecker.authKey+"&uId="+id+"&serviceType="+type, 
        target: "_blank",
        alt: info,
        "class": "g-item-status"
      });
      domConstruct.place(link,this.titleNode,"first");
      
      var iconPlace = domConstruct.create("img",{
        src: "images/serviceChecker"+imgSrc, 
        alt: info, 
        height: 16, 
        width: 16
      });
      domConstruct.place(iconPlace,link);
      
      var tooltip = new Tooltip({
        connectId: link,
        label: info,
        position: ['below']
      });
      tooltip.startup();
    },
    
    _translateService: function(service) {
      if (service) {
        service = service.toLowerCase();
        if (this.allowedServices[service]) {
          return this.allowedServices[service];
        }
      }
      return null;
    },
    
    _renderUrlLinks: function(item) {
      if (AppContext.appConfig.searchResults.showCustomLinks) {
        this._renderUrlLink(item.url_thumbnail_s, i18n.item.actions.urlLinks.thumbnail);
        this._renderUrlLink(item.url_website_s, i18n.item.actions.urlLinks.website);
        this._renderUrlLink(item.url_project_metadata_s, i18n.item.actions.urlLinks.projectMetadata);
        this._renderUrlLink(item.url_granule_s, i18n.item.actions.urlLinks.granule);
        this._renderUrlLink(item.url_http_download_s, i18n.item.actions.urlLinks.downloadHTTP);
        this._renderUrlLink(item.url_ftp_download_s, i18n.item.actions.urlLinks.downloadFTP);
      }
    },
    
    _renderUrlLink: function(href, caption) {
      var actionsNode = this.actionsNode;
      
      if (href && href.length > 0) {
        var link = domConstruct.create("a",{
          href: href, 
          target: "_blank",
          "class": "g-item-status",
          innerHTML: caption
        }, actionsNode);
      }
    },
    _renderSourceAndDate: function(item) {
/*          var owner = item.src_source_name_s;
          var date = item.sys_modified_dt;*/
          var author = item.cited_individual_s;
          var date = "";
          var dataCenter=item.dataCentre_s;
          var idx, text = "";

/*SMR 2018-08-20 modify to display the authors and creation date
 * Authors (cited_individual_s apparently might be string or array
 * have to handle both
 */


          if (Array.isArray(author)){
           author.forEach(function(element) {
               if (typeof element === "string") {

                   if (text.length == 0) {
                       text = "Authors: " + element;
                   } else {
                       text = text + ", " + element;
                   }
                   ;
               }


               else {
                   if (typeof author === "string" && author.length > 0) {
                       if (text.length > 0) text += " ";
                       text = "Author: " + author;
                   }
               }
           } )

           if (text.length == 0  ) {
                  text = "<span>"+ text + "</span>"
           }
          }
/*  SMR 2018-08-20
            * report either the publication(available, release) date or reported creation date
            *
*/
            if (typeof item.apiso_PublicationDate_dt === "string" && item.apiso_PublicationDate_dt.length > 0){
             date = item.apiso_PublicationDate_dt;
             idx = date.indexOf("T");
                if (idx > 0) date =date.substring(0,idx);
                idx = date.indexOf("-01-01");
                if (idx > 0) date =date.substring(0,idx);


                date = "Publication: " + date;
            }
            else if (typeof item.apiso_CreatedDate_dt === "string" && item.apiso_CreatedDate_dt.length > 0 ){
             date = item.apiso_CreatedDate_dt;
             idx = date.indexOf("T");
                if (idx > 0) date =date.substring(0,idx);
                idx = date.indexOf("-01-01");
                if (idx > 0) date =date.substring(0,idx);

                date = "Created: " + date;
            }
        if (date.length > 0  ) {
            date = "<span>"+ date + "</span>";
    }
             if (AppContext.appConfig.searchResults.showDate && typeof date === "string" && date.length > 0) {
                 text += date;
             }

             if (text.length > 0) {
                 util.setNodeHtml(this.ownerAndDateNode,text);
             }

   /*  original code
          if (typeof owner === "string" && owner.length > 0) {
              if (text.length > 0) text += " ";
              text = "Source: " + owner;
          }
          if (AppContext.appConfig.searchResults.showDate && typeof date === "string" && date.length > 0) {
              idx = date.indexOf("T");
              if (idx > 0) date =date.substring(0,idx);
              text += " Last Modified: " + date;
          }          if (text.length > 0) {
              util.setNodeText(this.ownerAndDateNode,text);
          }
   */
      },
      _renderCollectionAndDate: function(item) {
          var owner = item.src_source_name_s;
          var date = item.sys_modified_dt;
           var text = "";



                 if (typeof owner === "string" && owner.length > 0) {
                     if (text.length > 0) text += " ";
                     text = "<span> Source: " + owner + "</span>";
                 }
                 if (AppContext.appConfig.searchResults.showDate && typeof date === "string" && date.length > 0) {
                     idx = date.indexOf("T");
                     if (idx > 0) date =date.substring(0,idx);
                     text += " <span>Last Modified: " + date+ "</span>";
                 }
                 if (text.length > 0) {
                   var existing = this.ownerAndDateNode.innerHTML;
                   if (existing) {
                     text = existing + text;
                   }
              util.setNodeHtml(this.ownerAndDateNode, text);
          }

      },



    _renderCinergiLinks: function(itemId,item) {
          // if categories_cat exists, then these should exist
          if (item.categories_cat) {

              var cinergiNode = this.cinergiNode;
              var uri = "app/prov/templates/Prov.html?source=" + encodeURIComponent(item.fileid);
              var htmlNode = domConstruct.create("a", {
                  href: uri + "&ttl=" + encodeURIComponent(item.title),
                  target: "_blank",
                  innerHTML: "Provenance"
              }, cinergiNode);
              var uri2 = "http://mdeditor.usgin.org/?docId=" + encodeURIComponent(item.fileid);
              var htmlNode = domConstruct.create("a", {
                  href: uri2,
                  target: "_blank",
                  innerHTML: "Edit"
              }, cinergiNode);
              //https://mybinder.org/v2/gh/CINERGI/jupyter-cinergi.git/master?urlpath=%2Fnotebooks%2FCinergiDispatch.ipynb
              var uri3 = "https://"+ "mybinder.org" +
                  "/v2/gh/CINERGI/jupyter-cinergi.git/master?urlpath=%2Fnotebooks%2FCinergiDispatch.ipynb"+
                  "?documentId=" + encodeURIComponent(item._id);
              // var uri3 = "http://"+ "suave-jupyterhub.com" +
              //     "/user/zeppelin-v/notebooks/CinergiDispatch.ipynb"+
              //     "?documentId=" + encodeURIComponent(item._id);
              // var htmlNode = domConstruct.create("a", {
              //     href: uri3,
              //     target: "_blank",
              //     innerHTML: "Workbench Demo"
              // }, cinergiNode);

          }

      },

    _renderSchemaOrg: function (item){
          var metadataNode = this.metadataNode;
          if (item.sys_metadatatype_s && item.sys_metadatatype_s.startsWith("iso19115") ) {
              var uri3 = "https://search.google.com/structured-data/testing-tool/u/0/#url=" +
                  encodeURIComponent(
                      "http://cinergi.sdsc.edu/geoportal/rest/metadata/item/" + item._id + "/html");
              var htmlNode = domConstruct.create("a", {
                  href: uri3,
                  target: "_blank",
                  innerHTML: "Schema.Org"
              }, metadataNode);
          }
      },


    _renderCinergiAddToDropdown: function (ddul, item) {
      if (item.sys_metadatatype_s && item.sys_metadatatype_s.startsWith("iso19115")) {
        var actionName = "Schema.Org Test"

      var ddli = domConstruct.create("li", {}, ddul);
      var schemaNode = domConstruct.create("a", {
        href: "https://search.google.com/structured-data/testing-tool/u/0/#url=" +
            encodeURIComponent(
                "http://cinergi.sdsc.edu/geoportal/rest/metadata/item/" + item._id + "/html"),
        target: "_blank",
        title: string.substitute(i18n.item.actions.titleFormat, {action: actionName, title: item.title}),
        "aria-label": string.substitute(i18n.item.actions.titleFormat, {action: actionName, title: item.title}),
        innerHTML: actionName
      }, ddli);
       };
      if (item.categories_cat) {
        var ddli2 = domConstruct.create("li", {}, ddul);

        var uri = "app/prov/templates/Prov.html?source=" + encodeURIComponent(item.fileid);
        var provNode = domConstruct.create("a", {
          href: uri + "&ttl=" + encodeURIComponent(item.title),
          target: "_blank",
          innerHTML: "Provenance"
        }, ddli2);
        var ddli3 = domConstruct.create("li", {}, ddul);
        var uri2 = "http://mdeditor.usgin.org/?docId=" + encodeURIComponent(item.fileid);
        var editNode = domConstruct.create("a", {
          href: uri2,
          target: "_blank",
          innerHTML: "Edit"
        }, ddli3);
      }
    },
      /*

           DVW 2018-80-23 Restore Logic to allow for highlighting of HTML.
           */
      _renderDescription: function (item, highlight) {
          var desc = item.description;
          if (desc && desc.indexOf("REQUIRED FIELD") > -1 ) {
              desc = "";
          }
          if (typeof highlight != "undefined" ) {

              if (typeof highlight.description != "undefined") {

                  desc = highlight.description;
                  util.setNodeHtml(this.descriptionNode, desc);
              } else {
                  util.setNodeText(this.descriptionNode,desc);
              }
          } else {util.setNodeText(this.descriptionNode,desc);}

      },
      /*
      SMR 2018-08-20 adjust logic to always render something
      DVW 2018-80-23 Restore Logic to allow for highlighting of HTML.
      */
      _renderTitle: function (item, highlight) {
          var title = item.title;
          if (!title || 0 === title.length){
            title = "Title Not Provided. Identifier: " + item._id;
          }
          if (typeof highlight != "undefined") {

              if (typeof highlight.title != "undefined") {

                  title = highlight.title;
                  util.setNodeHtml(this.titleNode, title);
              } else {
                  util.setNodeText(this.titleNode,title);
              }
          } else
          {
            util.setNodeText(this.titleNode,title);
            this.titleNode.href = util.createRestMDLink(item._id, "/html");
          }


      },
      intializeToolTip: function() {
        if (this.ToolTip) {
            var node = this;
            //  var node = dom.byId('someNode');
            this.ToolTip.set("connectId", [node]);
            this.ToolTip.set("showDelay", 1000);
            if (this.extendedToolTip) {
                this.ToolTip.label = this.extendedToolTip + this.ToolTip.label;
            }
        }
    },

      _renderId: function(item) {
      /* This node will allow jquery to
      grab identifiers, without having to resort to parsing URLS
       */
          var idNode = this.idNode;
          var esId = item._id;
          var fid = item.fileid;

          dojo.attr(idNode,{ 'esId': esId } );

          if (fid) {
              dojo.attr(idNode,{ 'fileid': fid } );
          }

      },

    _renderWbLink: function(item) {
      var jupyterNode = this.jupyterNode;

      var link = domConstruct.create("a",{
        // href: href,
        //  target: "_blank",
        "class": "g-item-status",
        innerHTML: "Studio",
        onclick: function(e) {
          var dialog = new JupyterDialog();
          dialog.show(item);
        }
      }, jupyterNode);

    },
    _renderItemsSaveStatus: function(item, status) {
      var saveNode = this.saveNode;
      domConstruct.empty(saveNode);
      var btnText = "Add to Collection";
      var btnClass ="btn btn-primary  btn-xs"
      var self = this;


      switch (status) {
        case "saved":
          btnText = "Added";
          var btnClass ="btn btn-success  btn-xs"
          break;
        default:
          btnText = "Add to Collection";
          var btnClass ="btn btn-primary  btn-xs"
      }
      var link = domConstruct.create("a",{
        // href: href,
        //  target: "_blank",
        "class": btnClass,
        innerHTML: btnText,
        onclick: function(e) {
          if (self.itemIsSaved){
            topic.publish(appTopics.itemRemove, {item:item, collection:'default'})
          } else {
            topic.publish(appTopics.itemSave, {item:item, collection:'default'})
          }
        },
      }, saveNode);

    },

  });
  
  return oThisClass;
});