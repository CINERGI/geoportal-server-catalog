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
load("classpath:metadata/js/JsonEvaluatorBase.js");
load("classpath:metadata/js/JsonEvaluatorFor_Dataset.js");

// interrogationJsonPath details: https://goessner.net/articles/JsonPath/

J._metadataTypes = {
  "OpenData Dcat Catalog": {
    key: "Dcat Catalog",
    evaluator: J.evaluators.dataset,
    //interrogationXPath: "/gmd:MD_Metadata/gmd:contact/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString[text()='Earthcube CINERGI Metadata Pipeline']",
    //interrogationJsonPath: "$.@type",
    interrogationJsonPath: "$.[?(@.@type=='dcat:Catalog')]",
    //identifier: "http://www.isotc211.org/2005/gmi",
    identifier: "Dcat_Catalog",
    //detailsXslt: "metadata/details/iso-details-alternate/ISO19139ToHTMLwMap.xsl",
//      xsdLocation: "https://www.ngdc.noaa.gov/metadata/published/xsd/schema.xsd",
//     schematronXslt: null
  },
  "JSON-LD Dataset": {
    key: "JSON-LD Dataset",
    evaluator: J.evaluators.dataset,
    //interrogationXPath: "/gmd:MD_Metadata/gmd:contact/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString[text()='Earthcube CINERGI Metadata Pipeline']",
    //interrogationJsonPath: "$.@type",
    interrogationJsonPath: "$.[?(@.@type=='Dataset')]",
    //identifier: "http://www.isotc211.org/2005/gmi",
    identifier: "JSON-LD_Dataset",
    //detailsXslt: "metadata/details/iso-details-alternate/ISO19139ToHTMLwMap.xsl",
//      xsdLocation: "https://www.ngdc.noaa.gov/metadata/published/xsd/schema.xsd",
//     schematronXslt: null
  },
}
J._initializeTask = function(mdoc) {
    var jconf = J.JSONCONF.builder().options(J.JSONCONFOPT.SUPPRESS_EXCEPTIONS).build();
  var jpath = J.JSONPATH;
  //var gptContext = com.esri.geoportal.context.GeoportalContext.getInstance();

  var task = {
    mdoc: mdoc,
    item: {},
    jpath: jpath,
    jconf: jconf,
   // parseGml: gptContext.getParseGml()
  };

  return task;
};
J._interrogate = function(mdoc) {
  //var task = J._initializeTask(mdoc);
  var type = null, mdType;
  var i, t, keys = Object.keys(J._metadataTypes);
  if (mdoc.hasSuppliedJson() && keys) {

    for (i=0;i<keys.length;i++) {
      t = J._metadataTypes[keys[i]];
      print (t.interrogationJsonPath)
      if (t.interrogationJsonPath) {
        var path = J.JSONPATH.read(mdoc.getSuppliedJson(), t.interrogationJsonPath);

        if (path.length >0) {
          print (t.identifier);
          type = t;
          break;
        }
      }
    }
  }
  if (type) {
    var mdtype = new com.esri.geoportal.base.metadata.MetadataType();
    mdtype.setKey(type.key);
    if (type.identifier) mdtype.setIdentifier(type.identifier);
    if (type.evaluator && type.evaluator.version) {
      mdtype.setEvaluatorVersion(type.evaluator.version);
    }
    mdoc.setMetadataType(mdtype);
  }
};

J._evaluate = function(mdoc) {
  var task = J._initializeTask(mdoc);
  var key = mdoc.getMetadataType().getKey();
  var metadataType = J._metadataTypes[key];

  if (metadataType && metadataType.evaluator) {
    metadataType.evaluator.evaluate(task);
    if (typeof task.item.title === "string") {
      task.mdoc.setTitle(task.item.title);
    }
    task.mdoc.setEvaluatedJson(JSON.stringify(task.item));
    print(JSON.stringify(task.item));
  } else {
    // TODO log
    print("No metadata evaluator for key: "+key);
  }
};

function evaluateSuppliedJson(mdoc) {
  print("JsonEvaluator::evaluateSuppliedJson");
  if (!mdoc.hasSuppliedJson()) {
    print("No JSON Supplied");
    return null;
  }
  // var item = JSON.parse(mdoc.getSuppliedJson());
  // item._extra = "extra"
  // mdoc.setSuppliedJson(JSON.stringify(item));
  J._interrogate(mdoc);
  J._evaluate(mdoc);
  //mdoc.setEvaluatedJson(JSON.stringify(item)); // change when evaluation happens
  print("JsonEvaluator::evaluateSuppliedJson exit");
}




