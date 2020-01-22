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

J._metadataTypes = {
  "JSON-LD Dataset": {
    key: "JSON-LD Dataset",
    evaluator: J.evaluators.dataset,
    //interrogationXPath: "/gmd:MD_Metadata/gmd:contact/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString[text()='Earthcube CINERGI Metadata Pipeline']",
    interrogationPath: "@type:Dataset",
    //identifier: "http://www.isotc211.org/2005/gmi",
    identifier: "JSON-LD_Dataset",
    //detailsXslt: "metadata/details/iso-details-alternate/ISO19139ToHTMLwMap.xsl",
//      xsdLocation: "https://www.ngdc.noaa.gov/metadata/published/xsd/schema.xsd",
//     schematronXslt: null
  },
}
function evaluateSuppliedJson(mdoc) {
  print("JsonEvaluator::evaluateSuppliedJson");
  var item = JSON.parse(mdoc.getSuppliedJson());
  item._extra = "extra"
  mdoc.setSuppliedJson(JSON.stringify(item));

  mdoc.setEvaluatedJson(JSON.stringify(item)); // change when evaluation happens
  print("JsonEvaluator::evaluateSuppliedJson exit");
}




