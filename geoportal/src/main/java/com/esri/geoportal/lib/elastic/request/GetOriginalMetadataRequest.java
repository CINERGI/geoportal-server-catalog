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
package com.esri.geoportal.lib.elastic.request;
import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.kvp.Kvp;
import com.esri.geoportal.lib.elastic.kvp.KvpClob;
import com.esri.geoportal.lib.elastic.kvp.XmlContent;
import com.esri.geoportal.lib.elastic.util.AccessUtil;
import com.esri.geoportal.lib.elastic.util.FieldNames;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Get the metadata for an item.
 */
public class GetOriginalMetadataRequest extends AppRequest {

  /** Instance variables. */
  private String id;

  /** Constructor. */
  public GetOriginalMetadataRequest() {
    super();
  }
  
  /** The item id. */
  public String getId() {
    return id;
  }
  /** The item id. */
  public void setId(String id) {
    this.id = id;
  }

  /** Methods =============================================================== */

  @Override
  public AppResponse execute() throws Exception {
    AppResponse response = new AppResponse();
    String id = getId();
    if (id == null || id.length() == 0) {
      response.writeIdIsMissing(this);
      return response;
    }
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    AccessUtil au = new AccessUtil();
    id = au.determineId(id);
    au.ensureReadAccess(getUser(),id);

    KvpClob kvpClob = new KvpClob();
    kvpClob.setIndexName(ec.getIndexName());
    kvpClob.setIndexType(ec.getXmlIndexType());
    kvpClob.setDataFieldName(FieldNames.FIELD_SYS_SOURCE);
    kvpClob.setItemId(id);
    String metadata = kvpClob.readClob(ec);
    if (kvpClob.getFound()) {
      // TODO what if the metadata string is null or empty?
      this.writeOk(response,metadata, MediaType.MEDIA_TYPE_WILDCARD);
    } else {
      response.writeIdNotFound(this,id);
    }
    return response;
  }
  
  /**
   * Initialize.
   * @param id the item id
   */
  public void init(String id) {
    this.setId(id);
  }
  
  /**
   * Write the response.
   * @param response the response
   * @param md the metadata md
   * @param mediaType
   */
  public void writeOk(AppResponse response, String md, String mediaType) {
    response.setEntity(md);
    MediaType mt = MediaType.valueOf(mediaType);
    response.setMediaType(mt.withCharset("UTF-8"));
    response.setStatus(Response.Status.OK);
  }
  
}
