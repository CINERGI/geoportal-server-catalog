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
        "dojo/on",
        "dojo/keys",
        "dojo/dom-class",
        'dojo/query',
        "dojo/text!./templates/SearchBox2.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/QClause",

   "app/etc/util" ],

function(declare, lang, on, keys, domClass,query,
         template, i18n, SearchComponent, QClause,
         Util

) {
  
  var oThisClass = declare([SearchComponent], {

    i18n: i18n,
    templateString: template,
    
    useSimpleQueryString: null,
   // script: 'custom/searchBoxTypeahead.js',
      script: 'custom/searchBoxTypeahead.js',
    postCreate: function() {
      this.inherited(arguments);
      this.own(on(this.searchTextBox,"keyup",lang.hitch(this,function(evt) {
        if (evt.keyCode === keys.ENTER) this.search();
      })));


        //this.taDone(query)
        //ready ( this.taDone(query));
    },
      startup:  function () {
          var  ascript = this.script;
          if (typeof ascript === "undefined" || ascript === null) {
              ascript ="custom/searchBoxTypeahead.js";
          }
       //require(["custom/searchBoxTypeahead.js",], function(){
               require([ascript,], function(){
// separate out this to custom to allow for easier customization.
       });
      } ,
    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      var v = this.searchTextBox.value;
      var analyzewildcard=true;
      if (v !== null && lang.trim(v).length > 0) {
        var tipPattern = i18n.search.appliedFilters.tipPattern;
        var tip = tipPattern.replace("{type}",i18n.search.searchBox.search).replace("{value}",v);
        var query = null, useSimpleQueryString = this.useSimpleQueryString;
        if (typeof useSimpleQueryString === "undefined" || useSimpleQueryString === null) {
          useSimpleQueryString = AppContext.appConfig.search.useSimpleQueryString;
        }
         var q = Util.escapeForLucene(lang.trim(v),analyzewildcard );
        if (useSimpleQueryString) {
          query = {"simple_query_string": {
            "analyze_wildcard": analyzewildcard,
            "query": q
          }};
        } else {
          query = {"query_string": {
            "analyze_wildcard": analyzewildcard,
            "query": q,

                  "fields": ["_source.title^5","_source.*_cat^10","_all"],
                  "default_operator": "and"
          }};
        }
        var qClause = new QClause({
          label: v,
          tip: tip,
          parentQComponent: this,
          removable: true,
          scorable: true,
          query: query
        });
        this.activeQClauses = [qClause];
        this.appendQClauses(params);
      } else {
        this.activeQClauses = null;
      }
    },
    
    whenQClauseRemoved: function(qClause) {
      if (this === qClause.parentQComponent) {
        this.searchTextBox.value = "";
      }
    },



  });
  return oThisClass;
});