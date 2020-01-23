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

J.evaluators.dataset = {

  version: "schema.org.dataset.v1",

  evaluate: function(task) {
    this.evalBase(task);
    this.evalTitleAndDescription(task);
   // this.evalService(task);
    this.evalSpatial(task);
   // this.evalTemporal(task);
   // this.evalDoi(task);
   // this.evalReferences(task);
  },

  evalBase: function(task) {
    var item = task.item, doc = task.mdoc.getSuppliedJson();
      // var dsc = G.getNode(task,root,"rdf:Description | ../oai_dc:dc");

      //G.evalProp(task,item,dsc,"fileid","dc:identifier[contains(text(),'doi:')] |dc:identifier");
    J.evalProp(task,item,doc,"fileid","$.@id");
    J.evalProp(task,item,doc,"title","$['name','title']");
      // //G.evalProps(task,item,root,"description","dct:abstract | dc:description");
    J.evalProp(task,item,doc,"description","$.description");

      // G.evalProps(task,item,root,"keywords_s","//dc:subject");
    J.evalProps(task,item,doc,"keywords_s","$['keywords']");
      // G.evalProps(task,item,root,"links_s","//dct:references | dc:relations");
    // or dcat:accessUrl but that might make many duplicates
    J.evalProps(task,item,doc,"links_s","$['distribution'][*]['url']");
      // G.evalProp(task,item,dsc,"thumbnail_s","dct:references[@scheme='urn:x-esri:specification:ServiceType:ArcIMS:Metadata:Thumbnail']");
      //
      // G.evalProps(task,item,dsc,"contact_organizations_s","dc:creator | dc:contributor");
    J.evalProps(task,item,doc,"contact_organizations_s","$['creator'][*]['creator']['name']");
      // G.evalProps(task,item,dsc,"contact_people_s","dc:creator | dc:contributor");
    J.evalProps(task,item,doc,"contact_people_s","$['creator'][*]['creator']['name']");
      // G.evalProps(task,item,dsc,"type_s","dc:type");
    //J.evalProps(task,item,doc,"type_s","dc:type");
      // G.evalProps(task,item,dsc,"format_s","dc:format");
    //J.evalProps(task,item,doc,"format_s","dc:type");
      // // time.. use first element found. Others in timeperiod_nst

      // G.evalProp(task,item,dsc,"apiso_CreationDate_dt","dct:created | //dct:issued");
    J.evalProp(task,item,doc,"apiso_CreationDate_dt","$.datePublished");
      // //G.evalProp(task,item,root,"apiso_RevisionDate_dt","dc:format");
      // G.evalProp(task,item,dsc,"apiso_PublicationDate_dt","//dct:issued | //dct:dateCopyrighted | //dct:created ");
    J.evalProp(task,item,doc,"apiso_PublicationDate_dt","$.datePublished");
      // // core returnables
      // G.evalProps(task,item,dsc,"publisher_s","dc:publisher | dct:publisher");
    J.evalProp(task,item,doc,"publisher_s","$.publisher"); // is this repeatable? Might need to modify evalProps to check if string is returned.
      // G.evalProps(task,item,dsc,"contributor_s","dc:contributor | dct:contributor");
      // G.evalProps(task,item,dsc,"creator_s","dc:creator | dct:creator ");
    J.evalProps(task,item,doc,"creator_s","$['creator'][*]['creator']['name']");
  },
    evalTitleAndDescription: function(task){
        var item = task.item, doc=task.mdoc.getSuppliedJson();
        var dsc = J.JSONPATH.read(doc, "$.description");
        item.description = dsc;
        var title = J.JSONPATH.read(doc, "$['name','title']");
       // print (title);
        if (title['title']){
          task.mdoc.title = title['title'];
        } else {
          task.mdoc.title = title['name'];
        }
        J.evalProp(task,item,doc,"title","$['name','title']");
        //
        // // can't guarentee order of xpath, so we need to force it.
        // // title dc:title | rdf:Description/@rdf:about
        // if (G.hasNode(task,dsc,"dc:title ")){
        //     G.evalProp(task,item,dsc,"title","dc:title");
        // } else if (G.hasNode(task,root,"rdf:Description/@rdf:about ")){
        //     G.evalProp(task,item,root,"title","rdf:Description/@rdf:about ");
        // }
        //
        // if (G.hasNode(task,dsc,"dct:abstract ")){
        //     G.evalProp(task,item,dsc,"description","dct:abstract");
        // } else if (G.hasNode(task,dsc,"dc:description")){
        //     G.evalProp(task,item,dsc,"description","dc:description");
        // }
    },

  evalService: function(task) {
    var item = task.item, root = task.root;
    // G.evalResourceLinks(task,item,root,"//dct:references| dc:relations");
  },

  evalSpatial: function(task) {
    var item = task.item, doc=task.mdoc.getSuppliedJson();
    //$.spatialCoverage[?(@.@type=='Place')].geo.[?(@.@type=='GeoShape')].box
    J.forEachNode(task,doc,"$.spatialCoverage[?(@.@type=='Place')].geo.[?(@.@type=='GeoShape')].box", function(node){
      print (node);
      var lc= node.trim().split(" ");

        if (lc.length === 4) {
          var xmin = J.Val.chkDbl(lc[0].replace(",",""),null);
          var ymin = J.Val.chkDbl(lc[1].replace(",",""),null);
          var xmax = J.Val.chkDbl(lc[2].replace(",",""),null);
          var ymax = J.Val.chkDbl(lc[3].replace(",",""),null);
          var result = J.makeEnvelope(xmin,ymin,xmax,ymax);
          if (result && result.envelope) {
            J.writeMultiProp(task.item,"envelope_geo",result.envelope);
            // if (result.center) {
            //   G.writeMultiProp(task.item,"envelope_cen_pt",result.center);
            // }
          }
        }

    });
    // placenames
    J.forEachNode(task,doc,"$.spatialCoverage[?(@.@type=='Place')].alternateName", function(node) {
      J.writeMultiProp(item,"places_s",node,null);
    });

    // some items have just "spatial"

    J.forEachNode(task,doc,"$.spatial", function(node) {
      J.writeMultiProp(item,"places_s",node,null);
    });
  },

  evalTemporal: function(task) {
    var item = task.item, doc=task.mdoc.getSuppliedJson();
    var chk = function(v) {
      var params = null, n;
      if (typeof v === "string" && v.length > 0) {
        n = v.indexOf("/");
        if (n !== -1) {
          params = {
            begin: {
              date: v.substring(0,n),
              indeterminate: null
            },
            end: {
              date: v.substring(n+1),
              indeterminate: null
            }
          };
        } else {
          params = {
            instant: {
              date: v,
              indeterminate: null
            }
          };
        }
      }
      if (params) J.analyzeTimePeriod(task,params);
    };


    // fails, beause string gets turned into individual characters.
    // J.forEachNode(task,doc,"$.temporalCoverage",function(node){
    //   print (node);
    //   var v = node;
    //   chk(v);
    // });
    var temporal = J.getNode(task,doc,"$.temporalCoverage");
     if (temporal) {
      chk(temporal);
    }
    // G.forEachNode(task,root,"//dc:date",function(node){
    //   var v = G.getNodeText(node);
    //   chk(v);
    // });
    // // this reall needs to be ap_iso_published, created, etc
    //   G.forEachNode(task,root," //dct:created | //dct:issued | //dct:dateCopyrighted ",function(node){
    //       var v = G.getNodeText(node);
    //       chk(v);
    //   });

    // temporal:
    // some items have just "temporal"
    J.forEachNode(task,doc,"$.temporal", function(node) {
      chk(node);
    });
  },

    evalDoi: function(task){
        var item = task.item, root = task.root;
        // if (G.hasNode(task, root, "dc:identifier[contains(text(),'doi:')] ")) {
        //     var name = G.getString(task, root, "dc:identifier[contains(text(),'doi:')] ");
        //     name = name.trim().substr(4);
        //     name = "http://doi.org/".concat(name);
        //     G.writeMultiProp(task.item, "links_s", name);
        // }
    },

    evalReferences: function(task){
        var item = task.item, root = task.root;
        // var urls = [], name = "resources_nst";
        // //"url_s": info.linkUrl,
        // //"url_type_s": info.linkType
        // // url_title:
        // G.forEachNode(task,root,"//dct:references", function(node) {
        //    // print("dctnode:"+G.getString(task, node, "@dct:scheme | @scheme"));
        //
        //   if (G.hasText(task,node,"@dct:scheme | @scheme")){
        //
        //       var ref = G.getString(task, node, "@dct:scheme| @scheme");
        //     //  print("dctref:"+ref);
        //       var url = G.getNodeText(node);
        //       G.writeMultiProp(task.item, "links_s", url);
        //       if (url && ref) {
        //           if (urls.indexOf(url) === -1) {
        //               urls.push(url);
        //               G.writeMultiProp(task.item,name,{
        //                   "url_s": url,
        //                   "url_type_s": ref
        //               });
        //           }
        //       }
        //
        //   }
        //   else if (G.hasNode(task,node,"dc:identifier[contains(text(),'doi:')] ")) {
        //       var doi = G.getString(task, node, ".");
        //       doi = doi.trim().substr(4);
        //       doi = "http://doi.org/".concat(name);
        //       G.writeMultiProp(task.item, "links_s", doi);
        //       if (urls.indexOf(url) === -1) {
        //           urls.push(url);
        //           G.writeMultiProp(task.item,name,{
        //               "url_s": url,
        //               "url_type_s": "DOI"
        //           });
        //       }
        //   } else {
        //
        //       var url = G.getNodeText(node);
        //       G.writeMultiProp(task.item, "links_s", url);
        //       if (G.hasNode(task,root,"dc:format")){
        //           var ref = G.getString(task, node, "dc:format");
        //
        //           if ( url && ref) {
        //               if (urls.indexOf(url) === -1) {
        //                   urls.push(url);
        //                   G.writeMultiProp(task.item,name,{
        //                       "url_s": url,
        //                       "url_type_s": ref
        //                   });
        //               }
        //           }
        //       }
        //   }
        // })
    },

};
