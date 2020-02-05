package com.esri.geoportal.base.util;

import com.github.jsonldjava.core.DocumentLoader;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.utils.JsonUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import java.io.File;
import java.io.Reader;
import java.io.StringReader;
import java.net.URL;


public class JsonLdUtil {
    // in thr future, this should do content negotiation
    public static Object jsonldFromUrl(URL htmlUrl) throws Exception{
        Document doc = Jsoup.connect(htmlUrl.toString()).get();
        Elements jsonldscripts =doc.select("script[type$=application/ld+json]");
        return extractJsonLD(jsonldscripts);
    }
    public static Object jsonldFromHtml(File htmlFile) throws Exception{
        Document doc = Jsoup.parse(htmlFile,"UTF-8","");
        Elements jsonldscripts =doc.select("script[type$=application/ld+json]");
        return extractJsonLD(jsonldscripts);
    }
    public static Object jsonldFromHtml(String htmlString) throws Exception{
        Document doc = Jsoup.parse(htmlString);
        Elements jsonldscripts =doc.select("script[type$=application/ld+json]");
        return extractJsonLD(jsonldscripts);
    }

    private static Object extractJsonLD(Elements jsonldscripts) throws Exception{
        if (jsonldscripts != null  ) {
            String jsonLD = jsonldscripts.first().html();
            Object context = JsonUtils.fromString(jsonLD);
            return context;
        }
        throw new Exception("No script[type$=application/ld+json]in HTML");
    }



}
