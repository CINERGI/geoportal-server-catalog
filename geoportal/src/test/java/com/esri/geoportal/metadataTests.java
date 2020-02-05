package com.esri.geoportal;

import com.esri.geoportal.base.metadata.Evaluator;
import com.esri.geoportal.base.metadata.MetadataDocument;
import com.esri.geoportal.base.util.JsonLdUtil;
import com.esri.geoportal.base.xml.XmlUtil;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.AccessUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jdk.nashorn.internal.parser.JSONParser;
import org.apache.commons.cli.*;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.*;
import java.net.URL;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 *
 * run the javascript Evaluators.js scripts
 * from command line for testing.
 * @implNote mainly tested in JetBrains Intellij
 *
 * @author David Valentine
 *
 */
// expensive and not needed.
//@ExtendWith(SpringExtension.class)
//@SpringJUnitConfig
//@ContextConfiguration(classes = MetadataTestContext.class)

public class metadataTests{

    static AbstractApplicationContext context = null;
    static ObjectMapper mapper = null;
    static Evaluator evaluator = null;

    /**

     * <h1>run the javascript Evaluators.js scripts</h1>
     * from command line for testing.
     *
     * <div> java com.esri.geoportal.base.metadata.MetadataCLI -Dlog4j.configurationFile=log4j2_cli.properties  -md={XMLFile_fullpath}
     *</div>
     *
     * <p><b>Note:</b> This only produces the basic JSON elements seen in the
     * elastic search json document. Other steps, such as itemID are found in {@link com.esri.geoportal.lib.elastic.request.PublishMetadataRequest#prePublish(ElasticContext, AccessUtil, AppResponse, MetadataDocument)} </p>
     *
     *<p><b>Note:</b> mainly tested in JetBrains Intellij</p>
     *  <p><b>Note:</b> mvn command line call is in contrib</p>
     *
     * @author David Valentine
     *
     */
    @BeforeAll

    public static void setup(){
        // pass  when configuring the test run
        // -Dlog4j.configurationFile=log4j2_cli.properties
        System.err.println("logger errors... pass testrunner '-Dlog4j.configurationFile=log4j2_cli.properties' ");
        String tmpdir = System.getProperty("java.io.tmpdir");
        System.setProperty("catilina.base",tmpdir);
        context = new ClassPathXmlApplicationContext("config/cli-context.xml"

                ,"**/cli-app-factory.xml"
        );
        mapper = new ObjectMapper();
        evaluator = GeoportalContext.getInstance().getBeanIfDeclared(
                "metadata.Evaluator",Evaluator.class,new Evaluator());

    }




    @ParameterizedTest
    @CsvSource({ "testdata/schema_org/jsonld/usgin_08d5b1c2-77d8-4264-b3cb-ac6297849207.json, True, 'json', false" ,
            "testdata/iso19115/linkstest.xml, True, 'xml', false" })
    public  void testScriptEvaluator( File metadata, Boolean verbose,String format, Boolean extract) throws Exception {
        System.err.println("IGNORE errors above this line. This needs to be reworked as a spring shell application");

       // ObjectMapper mapper = new ObjectMapper();
        ObjectMapper mapper = this.mapper;
        AppUser user = null;
        boolean pretty = true;
//        Evaluator evaluator = GeoportalContext.getInstance().getBeanIfDeclared(
//                "metadata.Evaluator",Evaluator.class,new Evaluator());
        Evaluator evaluator = this.evaluator;
        File p = metadata;


        MetadataDocument mdoc = new MetadataDocument();
        mdoc.setItemId("test");
        if (format.equals("json")){

            JsonNode jsonNode = mapper.readTree(p.getAbsoluteFile());
            mdoc.setSuppliedJson(jsonNode.toString());
            mdoc.evaluateSuppliedJson();

        } else {
            String xml = XmlUtil.readFile(p.getAbsolutePath());
            mdoc.setXml(xml);


            mdoc.interrogate();
            mdoc.evaluate();
            mdoc.validate();
            System.err.println("typeKey="+mdoc.getMetadataType().getKey());

            System.err.println("title="+mdoc.getTitle());
            if (verbose) {
                System.err.println("xml=" + mdoc.getXml());
            }
        }
        Object json = mapper.readValue(mdoc.getEvaluatedJson(), Object.class);
        String indented = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json);
        System.err.println("evaluatedjson="+indented);


    }
    /* other JSON tests needed:
    spatial
    temporal
    keyword
    identifier (@id, or first one of @identifier)
    etc
     */

    @ParameterizedTest
    @CsvSource({ "/testdata/schema_org/jsonld_embedded/cinergi_usgin.html, /testdata/schema_org/jsonld/usgin_08d5b1c2-77d8-4264-b3cb-ac6297849207.json" ,
            "/testdata/schema_org/jsonld_embedded/gov.noaa.ncdc_C00199.html, /testdata/schema_org/jsonld/noaa_jsonld_temporal.json" })
    public void jsonFromHTML (String htmlFile, String jsonFile) throws Exception{
        // ObjectMapper mapper = new ObjectMapper();
        ObjectMapper mapper = this.mapper;
        AppUser user = null;
        boolean pretty = true;
//        Evaluator evaluator = GeoportalContext.getInstance().getBeanIfDeclared(
//                "metadata.Evaluator",Evaluator.class,new Evaluator());
        Evaluator evaluator = this.evaluator;

        final URL res = getClass().getResource(htmlFile);
        StringBuffer htmlString = new StringBuffer();
        BufferedReader in = new BufferedReader ( new InputStreamReader(res.openStream()));
        String inputLine;
        while ((inputLine = in.readLine()) != null)
            htmlString.append(inputLine);
        in.close();

        final Object context =JsonLdUtil.jsonldFromHtml(htmlString.toString());
        assertTrue(context instanceof Map
                );

       // File p = jsonFile;


        MetadataDocument mdoc = new MetadataDocument();
        mdoc.setItemId("test");


//            JsonNode jsonNode = mapper.readTree(p.getAbsoluteFile());
//            mdoc.setSuppliedJson(jsonNode.toString());
//            mdoc.evaluateSuppliedJson();

    }
}
